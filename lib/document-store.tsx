"use client";

import { useEffect, type ReactNode } from "react";
import { create } from "zustand";
import { apiWorkspaceRepository } from "@/lib/data/api-repository";
import {
  createEmptyWorkspace,
} from "@/lib/data/local-repository";
import type { WorkspaceRepository } from "@/lib/data/repository";
import {
  buildPathToDocument,
  buildSidebarForest,
  collectAllDocumentSubtreeIds,
  collectDocumentSubtreeIds,
  displayTitle,
  getOrderedBlocks,
  listTrashedDocuments,
  reindexPositions,
  titleFromContent,
} from "@/lib/domain/helpers";
import { createId, nowIso } from "@/lib/domain/ids";
import {
  defaultAttrsForType,
  type Block,
  type BlockAttrs,
  type BlockType,
  type Document,
  type Folder,
  type SidebarForest,
  type TrashedDocumentItem,
  type WorkspaceSnapshot,
} from "@/lib/domain/types";
import { createBlockSeed, attrsForTypeChange } from "@/lib/editor/block-meta";
import { ensureListItems, listItemsPlainText } from "@/lib/editor/list-attrs";
import { htmlToPlainText } from "@/lib/editor/rich-text/html";

type MergeResult = {
  previousBlockId: string;
  caretOffset: number;
} | null;

type DocumentStoreState = {
  snapshot: WorkspaceSnapshot;
  hydrated: boolean;
  sidebarForest: SidebarForest;
  trashedDocuments: TrashedDocumentItem[];

  getDocument: (docId: string) => Document | undefined;
  getFolder: (folderId: string) => Folder | undefined;
  getBlock: (blockId: string) => Block | undefined;
  getBlocksForDocument: (docId: string) => Block[];
  listFolders: () => Folder[];
  buildPathTo: (docId: string) => string[] | null;

  hydrate: (repository?: WorkspaceRepository) => Promise<void>;
  createRootDocument: (title?: string, folderId?: string | null) => string;
  renameDocument: (docId: string, title: string) => void;
  deleteDocument: (docId: string) => void;
  restoreDocument: (docId: string) => void;
  permanentlyDeleteDocument: (docId: string) => void;
  moveDocumentToFolder: (docId: string, folderId: string | null) => void;
  createFolder: (name?: string, parentFolderId?: string | null) => string;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  updateBlockContent: (blockId: string, content: string) => void;
  updateBlockAttrs: (blockId: string, patch: Partial<BlockAttrs>) => void;
  updateBlockType: (blockId: string, type: BlockType) => void;
  insertBlock: (
    docId: string,
    afterBlockId: string | null,
    content?: string,
    type?: BlockType,
  ) => string;
  splitBlock: (
    docId: string,
    blockId: string,
    before: string,
    after: string,
  ) => string;
  mergeWithPrevious: (docId: string, blockId: string) => MergeResult;
  moveBlock: (docId: string, blockId: string, toIndex: number) => void;
  duplicateBlock: (blockId: string) => string;
  deleteBlock: (blockId: string) => string | null;
  linkBlockToNewDoc: (blockId: string) => string;
  unlinkBlock: (blockId: string) => void;
};

function touchDocument(
  snapshot: WorkspaceSnapshot,
  docId: string,
): WorkspaceSnapshot {
  const doc = snapshot.documents[docId];
  if (!doc) return snapshot;
  const timestamp = nowIso();
  return {
    ...snapshot,
    documents: {
      ...snapshot.documents,
      [docId]: { ...doc, updatedAt: timestamp },
    },
  };
}

function applyBlockUpdates(
  snapshot: WorkspaceSnapshot,
  updates: Block[],
): WorkspaceSnapshot {
  if (updates.length === 0) return snapshot;
  const blocks = { ...snapshot.blocks };
  for (const block of updates) {
    blocks[block.id] = block;
  }
  return { ...snapshot, blocks };
}

function cloneBlockAttrs(attrs: Block["attrs"]): Block["attrs"] {
  return {
    ...attrs,
    items: attrs.items ? [...attrs.items] : attrs.items,
    cells: attrs.cells ? attrs.cells.map((row) => [...row]) : attrs.cells,
  };
}

function withDerived(snapshot: WorkspaceSnapshot) {
  return {
    snapshot,
    sidebarForest: buildSidebarForest(snapshot),
    trashedDocuments: listTrashedDocuments(snapshot),
  };
}

function setSnapshot(
  set: (partial: Partial<DocumentStoreState>) => void,
  get: () => DocumentStoreState,
  updater: (prev: WorkspaceSnapshot) => WorkspaceSnapshot,
) {
  const next = updater(get().snapshot);
  if (next === get().snapshot) return;
  set(withDerived(next));
}

const empty = createEmptyWorkspace();

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  ...withDerived(empty),
  hydrated: false,

  getDocument: (docId) => get().snapshot.documents[docId],
  getFolder: (folderId) => get().snapshot.folders[folderId],
  getBlock: (blockId) => get().snapshot.blocks[blockId],
  getBlocksForDocument: (docId) => getOrderedBlocks(get().snapshot, docId),
  listFolders: () =>
    Object.values(get().snapshot.folders).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    ),
  buildPathTo: (docId) => buildPathToDocument(get().snapshot, docId),

  hydrate: async (repository = apiWorkspaceRepository) => {
    if (get().hydrated) return;
    const loaded = await repository.load();
    set({ ...withDerived(loaded), hydrated: true });
  },

  createRootDocument: (title = "Untitled", folderId = null) => {
    const timestamp = nowIso();
    const documentId = createId();
    const blockId = createId();
    const prev = get().snapshot;
    const resolvedFolderId =
      folderId && prev.folders[folderId] ? folderId : null;
    const sortOrder = prev.rootDocumentIds.length;

    const block: Block = {
      id: blockId,
      documentId,
      type: "paragraph",
      content: "",
      attrs: defaultAttrsForType("paragraph"),
      position: 0,
      linkedDocumentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const document: Document = {
      id: documentId,
      title: title.trim() || "Untitled",
      folderId: resolvedFolderId,
      parentBlockId: null,
      sortOrder,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    set(
      withDerived({
        ...prev,
        documents: { ...prev.documents, [documentId]: document },
        blocks: { ...prev.blocks, [blockId]: block },
        rootDocumentIds: [...prev.rootDocumentIds, documentId],
      }),
    );

    return documentId;
  },

  renameDocument: (docId, title) => {
    setSnapshot(set, get, (prev) => {
      const doc = prev.documents[docId];
      if (!doc) return prev;
      return {
        ...prev,
        documents: {
          ...prev.documents,
          [docId]: { ...doc, title, updatedAt: nowIso() },
        },
      };
    });
  },

  deleteDocument: (docId) => {
    setSnapshot(set, get, (prev) => {
      if (!prev.documents[docId] || prev.documents[docId].deletedAt) {
        return prev;
      }

      const toTrash = new Set(collectDocumentSubtreeIds(prev, docId));
      const timestamp = nowIso();
      const documents = { ...prev.documents };

      for (const id of toTrash) {
        const doc = documents[id];
        if (!doc) continue;
        documents[id] = { ...doc, deletedAt: timestamp, updatedAt: timestamp };
      }

      return {
        ...prev,
        documents,
        rootDocumentIds: prev.rootDocumentIds.filter((id) => !toTrash.has(id)),
      };
    });
  },

  restoreDocument: (docId) => {
    setSnapshot(set, get, (prev) => {
      const doc = prev.documents[docId];
      if (!doc?.deletedAt) return prev;

      const toRestore = new Set(collectAllDocumentSubtreeIds(prev, docId));
      const timestamp = nowIso();
      const documents = { ...prev.documents };
      let rootDocumentIds = [...prev.rootDocumentIds];

      for (const id of toRestore) {
        const current = documents[id];
        if (!current?.deletedAt) continue;
        documents[id] = {
          ...current,
          deletedAt: null,
          updatedAt: timestamp,
        };
        if (
          current.parentBlockId === null &&
          !rootDocumentIds.includes(id)
        ) {
          rootDocumentIds.push(id);
        }
      }

      return { ...prev, documents, rootDocumentIds };
    });
  },

  permanentlyDeleteDocument: (docId) => {
    setSnapshot(set, get, (prev) => {
      if (!prev.documents[docId]) return prev;

      const toDelete = new Set(collectAllDocumentSubtreeIds(prev, docId));
      const documents = { ...prev.documents };
      const blocks = { ...prev.blocks };
      const timestamp = nowIso();

      for (const block of Object.values(blocks)) {
        if (
          block.linkedDocumentId &&
          toDelete.has(block.linkedDocumentId) &&
          !toDelete.has(block.documentId)
        ) {
          blocks[block.id] = {
            ...block,
            linkedDocumentId: null,
            updatedAt: timestamp,
          };
        }
      }

      for (const id of toDelete) {
        delete documents[id];
        for (const block of Object.values(blocks)) {
          if (block.documentId === id) {
            delete blocks[block.id];
          }
        }
      }

      return {
        ...prev,
        documents,
        blocks,
        rootDocumentIds: prev.rootDocumentIds.filter((id) => !toDelete.has(id)),
      };
    });
  },

  moveDocumentToFolder: (docId, folderId) => {
    setSnapshot(set, get, (prev) => {
      const doc = prev.documents[docId];
      if (!doc || doc.parentBlockId !== null) return prev;

      const resolvedFolderId =
        folderId && prev.folders[folderId] ? folderId : null;
      if ((doc.folderId ?? null) === resolvedFolderId) return prev;

      return {
        ...prev,
        documents: {
          ...prev.documents,
          [docId]: {
            ...doc,
            folderId: resolvedFolderId,
            updatedAt: nowIso(),
          },
        },
      };
    });
  },

  createFolder: (name = "New folder", parentFolderId = null) => {
    const folderId = createId();
    const timestamp = nowIso();
    const prev = get().snapshot;
    const resolvedParent =
      parentFolderId && prev.folders[parentFolderId]
        ? parentFolderId
        : null;

    const siblings =
      resolvedParent === null
        ? prev.rootFolderIds
        : Object.values(prev.folders)
            .filter((folder) => folder.parentFolderId === resolvedParent)
            .map((folder) => folder.id);

    const folder: Folder = {
      id: folderId,
      name: name.trim() || "New folder",
      parentFolderId: resolvedParent,
      sortOrder: siblings.length,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    set(
      withDerived({
        ...prev,
        folders: { ...prev.folders, [folderId]: folder },
        rootFolderIds:
          resolvedParent === null
            ? [...prev.rootFolderIds, folderId]
            : prev.rootFolderIds,
      }),
    );

    return folderId;
  },

  renameFolder: (folderId, name) => {
    setSnapshot(set, get, (prev) => {
      const folder = prev.folders[folderId];
      if (!folder) return prev;
      return {
        ...prev,
        folders: {
          ...prev.folders,
          [folderId]: {
            ...folder,
            name: name.trim() || "Untitled folder",
            updatedAt: nowIso(),
          },
        },
      };
    });
  },

  deleteFolder: (folderId) => {
    setSnapshot(set, get, (prev) => {
      if (!prev.folders[folderId]) return prev;

      const toDelete = new Set<string>();
      const stack = [folderId];
      while (stack.length > 0) {
        const current = stack.pop();
        if (!current || toDelete.has(current)) continue;
        toDelete.add(current);
        for (const folder of Object.values(prev.folders)) {
          if (folder.parentFolderId === current) {
            stack.push(folder.id);
          }
        }
      }

      const folders = { ...prev.folders };
      for (const id of toDelete) {
        delete folders[id];
      }

      const timestamp = nowIso();
      const documents = { ...prev.documents };
      for (const doc of Object.values(documents)) {
        if (doc.folderId && toDelete.has(doc.folderId)) {
          documents[doc.id] = {
            ...doc,
            folderId: null,
            updatedAt: timestamp,
          };
        }
      }

      return {
        ...prev,
        folders,
        documents,
        rootFolderIds: prev.rootFolderIds.filter((id) => !toDelete.has(id)),
      };
    });
  },

  updateBlockContent: (blockId, content) => {
    setSnapshot(set, get, (prev) => {
      const block = prev.blocks[blockId];
      if (!block) return prev;
      const timestamp = nowIso();
      let next: WorkspaceSnapshot = {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: { ...block, content, updatedAt: timestamp },
        },
      };
      next = touchDocument(next, block.documentId);
      return next;
    });
  },

  updateBlockAttrs: (blockId, patch) => {
    setSnapshot(set, get, (prev) => {
      const block = prev.blocks[blockId];
      if (!block) return prev;
      const timestamp = nowIso();
      let next: WorkspaceSnapshot = {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            attrs: { ...block.attrs, ...patch },
            updatedAt: timestamp,
          },
        },
      };
      next = touchDocument(next, block.documentId);
      return next;
    });
  },

  updateBlockType: (blockId, type) => {
    setSnapshot(set, get, (prev) => {
      const block = prev.blocks[blockId];
      if (!block || block.type === type) return prev;
      const timestamp = nowIso();
      const nextShape = attrsForTypeChange(block, type);

      let next: WorkspaceSnapshot = {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            type,
            attrs: nextShape.attrs,
            content: nextShape.content,
            linkedDocumentId: nextShape.linkedDocumentId,
            updatedAt: timestamp,
          },
        },
      };
      next = touchDocument(next, block.documentId);
      return next;
    });
  },

  insertBlock: (docId, afterBlockId, content = "", type = "paragraph") => {
    const newBlockId = createId();
    const timestamp = nowIso();
    const prev = get().snapshot;
    const ordered = getOrderedBlocks(prev, docId);
    if (!prev.documents[docId]) return newBlockId;

    let insertAt = ordered.length;
    if (afterBlockId !== null) {
      const index = ordered.findIndex((block) => block.id === afterBlockId);
      if (index === -1) return newBlockId;
      insertAt = index + 1;
    }

    const seed = createBlockSeed(type, { content });
    const newBlock: Block = {
      id: newBlockId,
      documentId: docId,
      type: seed.type,
      content: seed.content,
      attrs: seed.attrs,
      position: insertAt,
      linkedDocumentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextOrdered = [...ordered];
    nextOrdered.splice(insertAt, 0, newBlock);
    const reindexed = reindexPositions(
      nextOrdered.map((block) =>
        block.id === newBlockId ? newBlock : { ...block, updatedAt: timestamp },
      ),
    );

    set(withDerived(touchDocument(applyBlockUpdates(prev, reindexed), docId)));
    return newBlockId;
  },

  splitBlock: (docId, blockId, before, after) => {
    const newBlockId = createId();
    const timestamp = nowIso();
    const prev = get().snapshot;
    const ordered = getOrderedBlocks(prev, docId);
    const index = ordered.findIndex((block) => block.id === blockId);
    const current = ordered[index];
    if (!current || !prev.documents[docId]) return newBlockId;

    const updatedCurrent: Block = {
      ...current,
      content: before,
      updatedAt: timestamp,
    };
    const created: Block = {
      id: newBlockId,
      documentId: docId,
      type: current.type,
      content: after,
      attrs: { ...current.attrs },
      position: index + 1,
      linkedDocumentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextOrdered = [...ordered];
    nextOrdered[index] = updatedCurrent;
    nextOrdered.splice(index + 1, 0, created);
    const reindexed = reindexPositions(nextOrdered);

    set(withDerived(touchDocument(applyBlockUpdates(prev, reindexed), docId)));
    return newBlockId;
  },

  mergeWithPrevious: (docId, blockId) => {
    const prev = get().snapshot;
    const ordered = getOrderedBlocks(prev, docId);
    const index = ordered.findIndex((block) => block.id === blockId);
    if (index <= 0) return null;

    const current = ordered[index];
    const previous = ordered[index - 1];
    if (!current || !previous) return null;

    const timestamp = nowIso();
    const prevIsList =
      previous.type === "bulleted_list_item" ||
      previous.type === "numbered_list_item";
    const currIsList =
      current.type === "bulleted_list_item" ||
      current.type === "numbered_list_item";

    let mergedContent = previous.content + current.content;
    let mergedAttrs = previous.attrs;

    if (prevIsList && currIsList && previous.type === current.type) {
      const items = [
        ...ensureListItems(previous.attrs, previous.content),
        ...ensureListItems(current.attrs, current.content),
      ];
      mergedAttrs = { ...previous.attrs, items };
      mergedContent = listItemsPlainText(items);
    }

    const caretOffset = prevIsList
      ? htmlToPlainText(
          ensureListItems(previous.attrs, previous.content).join(""),
        ).length
      : htmlToPlainText(previous.content).length;

    const mergedPrevious: Block = {
      ...previous,
      content: mergedContent,
      attrs: mergedAttrs,
      linkedDocumentId:
        previous.linkedDocumentId ?? current.linkedDocumentId,
      updatedAt: timestamp,
    };

    let documents = { ...prev.documents };
    let rootDocumentIds = prev.rootDocumentIds;

    if (current.linkedDocumentId) {
      const child = documents[current.linkedDocumentId];
      if (child) {
        if (!previous.linkedDocumentId) {
          documents[current.linkedDocumentId] = {
            ...child,
            parentBlockId: previous.id,
            updatedAt: timestamp,
          };
        } else if (previous.linkedDocumentId !== current.linkedDocumentId) {
          if (!rootDocumentIds.includes(current.linkedDocumentId)) {
            rootDocumentIds = [...rootDocumentIds, current.linkedDocumentId];
          }
          documents[current.linkedDocumentId] = {
            ...child,
            parentBlockId: null,
            folderId: child.folderId ?? documents[docId]?.folderId ?? null,
            sortOrder: rootDocumentIds.indexOf(current.linkedDocumentId),
            updatedAt: timestamp,
          };
        }
      }
    }

    const remaining = ordered.filter((block) => block.id !== blockId);
    remaining[index - 1] = mergedPrevious;
    const reindexed = reindexPositions(remaining);

    const { [blockId]: _, ...blocksWithout } = prev.blocks;
    const nextBlocks = { ...blocksWithout };
    for (const block of reindexed) {
      nextBlocks[block.id] = block;
    }

    set(
      withDerived(
        touchDocument(
          {
            ...prev,
            documents,
            rootDocumentIds,
            blocks: nextBlocks,
          },
          docId,
        ),
      ),
    );

    return { previousBlockId: previous.id, caretOffset };
  },

  moveBlock: (docId, blockId, toIndex) => {
    const prev = get().snapshot;
    const ordered = getOrderedBlocks(prev, docId);
    const fromIndex = ordered.findIndex((block) => block.id === blockId);
    if (fromIndex === -1) return;

    const clamped = Math.max(0, Math.min(toIndex, ordered.length - 1));
    if (fromIndex === clamped) return;

    const nextOrdered = [...ordered];
    const [moved] = nextOrdered.splice(fromIndex, 1);
    if (!moved) return;
    nextOrdered.splice(clamped, 0, moved);

    const timestamp = nowIso();
    const reindexed = reindexPositions(
      nextOrdered.map((block) => ({ ...block, updatedAt: timestamp })),
    );
    set(withDerived(touchDocument(applyBlockUpdates(prev, reindexed), docId)));
  },

  duplicateBlock: (blockId) => {
    const prev = get().snapshot;
    const block = prev.blocks[blockId];
    if (!block) return "";

    const newId = createId();
    const timestamp = nowIso();
    const ordered = getOrderedBlocks(prev, block.documentId);
    const index = ordered.findIndex((item) => item.id === blockId);
    if (index === -1) return "";

    const clone: Block = {
      ...block,
      id: newId,
      linkedDocumentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      attrs: cloneBlockAttrs(block.attrs),
    };

    const nextOrdered = [...ordered];
    nextOrdered.splice(index + 1, 0, clone);
    const reindexed = reindexPositions(
      nextOrdered.map((item) =>
        item.id === newId ? clone : { ...item, updatedAt: timestamp },
      ),
    );

    let nextSnapshot = applyBlockUpdates(prev, reindexed);

    set(
      withDerived(
        touchDocument(nextSnapshot, block.documentId),
      ),
    );
    return newId;
  },

  deleteBlock: (blockId) => {
    const prev = get().snapshot;
    const block = prev.blocks[blockId];
    if (!block) return null;

    const ordered = getOrderedBlocks(prev, block.documentId);
    const index = ordered.findIndex((item) => item.id === blockId);
    if (index === -1) return null;

    const timestamp = nowIso();

    if (ordered.length === 1) {
      const cleared: Block = {
        ...block,
        type: "paragraph",
        content: "",
        attrs: defaultAttrsForType("paragraph"),
        linkedDocumentId: null,
        updatedAt: timestamp,
      };
      set(
        withDerived(
          touchDocument(applyBlockUpdates(prev, [cleared]), block.documentId),
        ),
      );
      return cleared.id;
    }

    let documents = { ...prev.documents };
    let rootDocumentIds = prev.rootDocumentIds;
    if (block.linkedDocumentId) {
      const child = documents[block.linkedDocumentId];
      if (child) {
        if (!rootDocumentIds.includes(block.linkedDocumentId)) {
          rootDocumentIds = [...rootDocumentIds, block.linkedDocumentId];
        }
        documents[block.linkedDocumentId] = {
          ...child,
          parentBlockId: null,
          folderId: child.folderId ?? documents[block.documentId]?.folderId ?? null,
          sortOrder: rootDocumentIds.indexOf(block.linkedDocumentId),
          updatedAt: timestamp,
        };
      }
    }

    const remaining = ordered.filter((item) => item.id !== blockId);
    const reindexed = reindexPositions(
      remaining.map((item) => ({ ...item, updatedAt: timestamp })),
    );
    const { [blockId]: _, ...blocksWithout } = prev.blocks;
    const nextBlocks = { ...blocksWithout };
    for (const item of reindexed) {
      nextBlocks[item.id] = item;
    }

    const focusId =
      reindexed[Math.min(index, reindexed.length - 1)]?.id ?? null;

    set(
      withDerived(
        touchDocument(
          {
            ...prev,
            documents,
            rootDocumentIds,
            blocks: nextBlocks,
          },
          block.documentId,
        ),
      ),
    );
    return focusId;
  },

  linkBlockToNewDoc: (blockId) => {
    const prev = get().snapshot;
    const block = prev.blocks[blockId];
    if (!block) return "";

    if (block.linkedDocumentId && prev.documents[block.linkedDocumentId]) {
      return block.linkedDocumentId;
    }

    const timestamp = nowIso();
    const childDocId = createId();
    const childBlockId = createId();
    const parentDoc = prev.documents[block.documentId];

    const childBlock: Block = {
      id: childBlockId,
      documentId: childDocId,
      type: "paragraph",
      content: "",
      attrs: defaultAttrsForType("paragraph"),
      position: 0,
      linkedDocumentId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const childDoc: Document = {
      id: childDocId,
      title: titleFromContent(block.content),
      folderId: null,
      parentBlockId: blockId,
      sortOrder: 0,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    let next: WorkspaceSnapshot = {
      ...prev,
      documents: {
        ...prev.documents,
        [childDocId]: childDoc,
      },
      blocks: {
        ...prev.blocks,
        [blockId]: {
          ...block,
          linkedDocumentId: childDocId,
          updatedAt: timestamp,
        },
        [childBlockId]: childBlock,
      },
    };
    if (parentDoc) next = touchDocument(next, parentDoc.id);
    set(withDerived(next));
    return childDocId;
  },

  unlinkBlock: (blockId) => {
    setSnapshot(set, get, (prev) => {
      const block = prev.blocks[blockId];
      if (!block?.linkedDocumentId) return prev;

      const childId = block.linkedDocumentId;
      const child = prev.documents[childId];
      const parentDoc = prev.documents[block.documentId];
      const timestamp = nowIso();

      const documents = { ...prev.documents };
      const rootDocumentIds = [...prev.rootDocumentIds];

      if (child) {
        if (!rootDocumentIds.includes(childId)) {
          rootDocumentIds.push(childId);
        }
        documents[childId] = {
          ...child,
          parentBlockId: null,
          folderId: child.folderId ?? parentDoc?.folderId ?? null,
          sortOrder: rootDocumentIds.indexOf(childId),
          updatedAt: timestamp,
        };
      }

      let next: WorkspaceSnapshot = {
        ...prev,
        documents,
        rootDocumentIds,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            linkedDocumentId: null,
            updatedAt: timestamp,
          },
        },
      };
      next = touchDocument(next, block.documentId);
      return next;
    });
  },
}));

/**
 * Thin bootstrap for load + persist. Zustand holds the store;
 * this only wires repository lifecycle into the React tree.
 */
export function DocumentStoreProvider({
  children,
  repository = apiWorkspaceRepository,
}: {
  children: ReactNode;
  repository?: WorkspaceRepository;
}) {
  const hydrated = useDocumentStore((s) => s.hydrated);
  const hydrate = useDocumentStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate(repository);
  }, [hydrate, repository]);

  useEffect(() => {
    if (!hydrated) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = useDocumentStore.subscribe((state, prev) => {
      if (state.snapshot === prev.snapshot) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void repository.persist(state.snapshot);
      }, 150);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [hydrated, repository]);

  return children;
}

export { displayTitle };
