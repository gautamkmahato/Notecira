import { createId, nowIso } from "@/lib/domain/ids";
import { defaultAttrsForType } from "@/lib/domain/types";
import type {
  Block,
  BlockType,
  Document,
  Folder,
  WorkspaceSnapshot,
} from "@/lib/domain/types";
import type { WorkspaceRepository } from "./repository";

export const STORAGE_KEY_V5 = "writing-app-v5";
const STORAGE_KEY_V4 = "writing-app-v4";
const STORAGE_KEY_V3 = "writing-app-v3";
const STORAGE_KEY_V2 = "writing-app-v2";
const STORAGE_KEY_V1 = "writing-app-v1";

type LegacyBlock = Omit<Block, "attrs" | "type"> & {
  type?: string;
  attrs?: Block["attrs"];
};

type LegacyV1Store = {
  rootDocId: string;
  documents: Record<
    string,
    {
      id: string;
      title: string;
      blockIds: string[];
      createdAt: number;
      updatedAt: number;
    }
  >;
  blocks: Record<
    string,
    {
      id: string;
      type: "paragraph";
      content: string;
      linkedDocId?: string;
    }
  >;
};

type LegacySnapshot = {
  version: number;
  folders?: Record<string, Folder>;
  documents: Record<string, Document>;
  blocks: Record<string, LegacyBlock>;
  rootFolderIds?: string[];
  rootDocumentIds: string[];
};

function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  if (!value || typeof value !== "object") return false;
  const snap = value as WorkspaceSnapshot;
  return (
    snap.version === 5 &&
    Array.isArray(snap.rootDocumentIds) &&
    Array.isArray(snap.rootFolderIds) &&
    typeof snap.folders === "object" &&
    snap.folders !== null &&
    typeof snap.documents === "object" &&
    snap.documents !== null &&
    typeof snap.blocks === "object" &&
    snap.blocks !== null
  );
}

function isLegacySnapshot(value: unknown): value is LegacySnapshot {
  if (!value || typeof value !== "object") return false;
  const snap = value as LegacySnapshot;
  return (
    typeof snap.version === "number" &&
    snap.version >= 2 &&
    snap.version <= 4 &&
    Array.isArray(snap.rootDocumentIds) &&
    typeof snap.documents === "object" &&
    snap.documents !== null &&
    typeof snap.blocks === "object" &&
    snap.blocks !== null
  );
}

function isLegacyV1Store(value: unknown): value is LegacyV1Store {
  if (!value || typeof value !== "object") return false;
  const store = value as LegacyV1Store;
  return (
    typeof store.rootDocId === "string" &&
    typeof store.documents === "object" &&
    store.documents !== null &&
    typeof store.blocks === "object" &&
    store.blocks !== null
  );
}

function normalizeBlockType(type: string | undefined): BlockType {
  const allowed: BlockType[] = [
    "paragraph",
    "heading_1",
    "heading_2",
    "heading_3",
    "heading_4",
    "bulleted_list_item",
    "numbered_list_item",
    "table",
    "code",
    "image",
    "video",
    "pdf",
    "document",
    "markdown",
  ];
  if (type && (allowed as string[]).includes(type)) {
    return type as BlockType;
  }
  return "paragraph";
}

function normalizeBlock(block: LegacyBlock): Block {
  const type = normalizeBlockType(block.type);
  return {
    id: block.id,
    documentId: block.documentId,
    type,
    content: block.content ?? "",
    attrs: { ...defaultAttrsForType(type), ...(block.attrs ?? {}) },
    position: block.position,
    linkedDocumentId: block.linkedDocumentId ?? null,
    createdAt: block.createdAt,
    updatedAt: block.updatedAt,
  };
}

export function createEmptyWorkspace(): WorkspaceSnapshot {
  const timestamp = nowIso();
  const documentId = createId();
  const blockId = createId();

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
    title: "Untitled",
    folderId: null,
    parentBlockId: null,
    sortOrder: 0,
    deletedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    version: 5,
    folders: {},
    documents: { [documentId]: document },
    blocks: { [blockId]: block },
    rootFolderIds: [],
    rootDocumentIds: [documentId],
  };
}

function migrateLegacySnapshot(legacy: LegacySnapshot): WorkspaceSnapshot {
  const documents: Record<string, Document> = {};
  for (const doc of Object.values(legacy.documents)) {
    documents[doc.id] = {
      ...doc,
      folderId: doc.folderId ?? null,
      deletedAt: doc.deletedAt ?? null,
    };
  }

  const blocks: Record<string, Block> = {};
  for (const block of Object.values(legacy.blocks)) {
    blocks[block.id] = normalizeBlock(block);
  }

  return sanitizeSnapshot({
    version: 5,
    folders: legacy.folders ?? {},
    documents,
    blocks,
    rootFolderIds: legacy.rootFolderIds ?? [],
    rootDocumentIds: legacy.rootDocumentIds,
  });
}

function migrateFromV1(legacy: LegacyV1Store): WorkspaceSnapshot {
  const documents: Record<string, Document> = {};
  const blocks: Record<string, Block> = {};

  const linkedByChild = new Map<string, string>();
  for (const block of Object.values(legacy.blocks)) {
    if (block.linkedDocId) linkedByChild.set(block.linkedDocId, block.id);
  }

  for (const legacyDoc of Object.values(legacy.documents)) {
    const parentBlockId = linkedByChild.get(legacyDoc.id) ?? null;
    documents[legacyDoc.id] = {
      id: legacyDoc.id,
      title: legacyDoc.title,
      folderId: null,
      parentBlockId,
      sortOrder: 0,
      deletedAt: null,
      createdAt: new Date(legacyDoc.createdAt).toISOString(),
      updatedAt: new Date(legacyDoc.updatedAt).toISOString(),
    };

    legacyDoc.blockIds.forEach((blockId, position) => {
      const legacyBlock = legacy.blocks[blockId];
      if (!legacyBlock) return;
      const timestamp = new Date(legacyDoc.updatedAt).toISOString();
      blocks[blockId] = {
        id: blockId,
        documentId: legacyDoc.id,
        type: "paragraph",
        content: legacyBlock.content,
        attrs: defaultAttrsForType("paragraph"),
        position,
        linkedDocumentId: legacyBlock.linkedDocId ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });
  }

  const rootDocumentIds = Object.values(documents)
    .filter((doc) => doc.parentBlockId === null)
    .sort((a, b) => {
      if (a.id === legacy.rootDocId) return -1;
      if (b.id === legacy.rootDocId) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map((doc, index) => {
      documents[doc.id] = { ...documents[doc.id], sortOrder: index };
      return doc.id;
    });

  if (rootDocumentIds.length === 0) {
    return createEmptyWorkspace();
  }

  return {
    version: 5,
    folders: {},
    documents,
    blocks,
    rootFolderIds: [],
    rootDocumentIds,
  };
}

function readJson(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export class LocalWorkspaceRepository implements WorkspaceRepository {
  async load(): Promise<WorkspaceSnapshot> {
    const v5 = readJson(STORAGE_KEY_V5);
    if (isWorkspaceSnapshot(v5)) {
      return sanitizeSnapshot(v5);
    }

    for (const key of [STORAGE_KEY_V4, STORAGE_KEY_V3, STORAGE_KEY_V2]) {
      const legacy = readJson(key);
      if (isLegacySnapshot(legacy)) {
        const migrated = migrateLegacySnapshot(legacy);
        await this.persist(migrated);
        return migrated;
      }
    }

    const v1 = readJson(STORAGE_KEY_V1);
    if (isLegacyV1Store(v1)) {
      const migrated = migrateFromV1(v1);
      await this.persist(migrated);
      return migrated;
    }

    return createEmptyWorkspace();
  }

  async persist(snapshot: WorkspaceSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY_V5, JSON.stringify(snapshot));
  }
}

function sanitizeSnapshot(snapshot: WorkspaceSnapshot): WorkspaceSnapshot {
  const folders: Record<string, Folder> = { ...snapshot.folders };
  const documents: Record<string, Document> = {};
  const blocks: Record<string, Block> = {};

  for (const doc of Object.values(snapshot.documents)) {
    const folderId =
      doc.folderId && folders[doc.folderId] ? doc.folderId : null;
    documents[doc.id] = {
      ...doc,
      folderId,
      deletedAt: doc.deletedAt ?? null,
    };
  }

  for (const block of Object.values(snapshot.blocks)) {
    blocks[block.id] = normalizeBlock(block);
  }

  const rootFolderIds = (
    snapshot.rootFolderIds.length > 0
      ? snapshot.rootFolderIds
      : Object.values(folders)
          .filter((folder) => folder.parentFolderId === null)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((folder) => folder.id)
  ).filter((id) => folders[id]?.parentFolderId === null);

  const activeRootIds = (
    snapshot.rootDocumentIds.length > 0
      ? snapshot.rootDocumentIds
      : Object.values(documents)
          .filter((doc) => doc.parentBlockId === null && doc.deletedAt === null)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((doc) => doc.id)
  ).filter(
    (id) =>
      documents[id]?.parentBlockId === null &&
      documents[id]?.deletedAt === null,
  );

  if (activeRootIds.length === 0 && Object.keys(documents).length === 0) {
    return createEmptyWorkspace();
  }

  return {
    ...snapshot,
    version: 5,
    folders,
    documents,
    blocks,
    rootFolderIds,
    rootDocumentIds: activeRootIds,
  };
}

export const localWorkspaceRepository = new LocalWorkspaceRepository();
