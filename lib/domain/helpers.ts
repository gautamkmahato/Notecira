import type {
  Block,
  Document,
  SidebarDocNode,
  SidebarFolderNode,
  SidebarForest,
  TrashedDocumentItem,
  WorkspaceSnapshot,
} from "./types";

export function isActiveDocument(doc: Document | undefined): doc is Document {
  return Boolean(doc && doc.deletedAt === null);
}

export function titleFromContent(content: string): string {
  const plain = content
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
    .replace(/\s+/g, " ");
  if (!plain) return "Untitled";
  return plain.length > 40 ? `${plain.slice(0, 40)}…` : plain;
}

export function displayTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : "Untitled";
}

export function displayFolderName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Untitled folder";
}

/** Blocks for a document, ordered by `position` (DB-friendly). */
export function getOrderedBlocks(
  snapshot: WorkspaceSnapshot,
  documentId: string,
): Block[] {
  return Object.values(snapshot.blocks)
    .filter((block) => block.documentId === documentId)
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
}

export function findDocumentIdForBlock(
  snapshot: WorkspaceSnapshot,
  blockId: string,
): string | undefined {
  return snapshot.blocks[blockId]?.documentId;
}

/**
 * Walk parent_block_id links upward to build the open-column path
 * from a root document to `documentId`.
 */
export function buildPathToDocument(
  snapshot: WorkspaceSnapshot,
  documentId: string,
): string[] | null {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: string | null = documentId;

  while (current) {
    if (seen.has(current)) return null;
    seen.add(current);

    const doc: Document | undefined = snapshot.documents[current];
    if (!isActiveDocument(doc)) return null;

    chain.unshift(current);

    if (doc.parentBlockId === null) break;

    const parentBlock: Block | undefined = snapshot.blocks[doc.parentBlockId];
    if (!parentBlock) return null;
    current = parentBlock.documentId;
  }

  return chain;
}

function childDocumentsOf(
  snapshot: WorkspaceSnapshot,
  documentId: string,
): Document[] {
  const blocks = getOrderedBlocks(snapshot, documentId);
  const children: Document[] = [];

  for (const block of blocks) {
    if (!block.linkedDocumentId) continue;
    const child = snapshot.documents[block.linkedDocumentId];
    if (isActiveDocument(child)) children.push(child);
  }

  return children;
}

function buildDocNode(
  snapshot: WorkspaceSnapshot,
  documentId: string,
  depth: number,
): SidebarDocNode | null {
  const doc = snapshot.documents[documentId];
  if (!isActiveDocument(doc)) return null;

  return {
    kind: "document",
    documentId,
    title: displayTitle(doc.title),
    depth,
    children: childDocumentsOf(snapshot, documentId)
      .map((child) => buildDocNode(snapshot, child.id, depth + 1))
      .filter((node): node is SidebarDocNode => node !== null),
  };
}

function rootDocumentsInFolder(
  snapshot: WorkspaceSnapshot,
  folderId: string | null,
): Document[] {
  return snapshot.rootDocumentIds
    .map((id) => snapshot.documents[id])
    .filter((doc): doc is Document => {
      if (!isActiveDocument(doc) || doc.parentBlockId !== null) return false;
      return (doc.folderId ?? null) === folderId;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

function childFoldersOf(
  snapshot: WorkspaceSnapshot,
  parentFolderId: string | null,
): string[] {
  if (parentFolderId === null) {
    return snapshot.rootFolderIds.filter((id) => snapshot.folders[id]);
  }

  return Object.values(snapshot.folders)
    .filter((folder) => folder.parentFolderId === parentFolderId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((folder) => folder.id);
}

function buildFolderNode(
  snapshot: WorkspaceSnapshot,
  folderId: string,
  depth: number,
): SidebarFolderNode | null {
  const folder = snapshot.folders[folderId];
  if (!folder) return null;

  return {
    kind: "folder",
    folderId,
    name: displayFolderName(folder.name),
    depth,
    folders: childFoldersOf(snapshot, folderId)
      .map((id) => buildFolderNode(snapshot, id, depth + 1))
      .filter((node): node is SidebarFolderNode => node !== null),
    documents: rootDocumentsInFolder(snapshot, folderId)
      .map((doc) => buildDocNode(snapshot, doc.id, depth + 1))
      .filter((node): node is SidebarDocNode => node !== null),
  };
}

/** Sidebar forest: folders (with nested folders/docs) + unfiled root docs. */
export function buildSidebarForest(snapshot: WorkspaceSnapshot): SidebarForest {
  return {
    folders: childFoldersOf(snapshot, null)
      .map((id) => buildFolderNode(snapshot, id, 0))
      .filter((node): node is SidebarFolderNode => node !== null),
    documents: rootDocumentsInFolder(snapshot, null)
      .map((doc) => buildDocNode(snapshot, doc.id, 0))
      .filter((node): node is SidebarDocNode => node !== null),
  };
}

function childDocumentsOfAll(
  snapshot: WorkspaceSnapshot,
  documentId: string,
): Document[] {
  const blocks = getOrderedBlocks(snapshot, documentId);
  const children: Document[] = [];
  for (const block of blocks) {
    if (!block.linkedDocumentId) continue;
    const child = snapshot.documents[block.linkedDocumentId];
    if (child) children.push(child);
  }
  return children;
}

/** Collect linked descendants regardless of trash state. */
export function collectAllDocumentSubtreeIds(
  snapshot: WorkspaceSnapshot,
  documentId: string,
): string[] {
  const result: string[] = [];
  const stack = [documentId];
  const seen = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    result.push(current);

    for (const child of childDocumentsOfAll(snapshot, current)) {
      stack.push(child.id);
    }
  }

  return result;
}

/** Collect a document and all linked descendants. */
export function collectDocumentSubtreeIds(
  snapshot: WorkspaceSnapshot,
  documentId: string,
): string[] {
  const result: string[] = [];
  const stack = [documentId];
  const seen = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    result.push(current);

    for (const child of childDocumentsOf(snapshot, current)) {
      stack.push(child.id);
    }
  }

  return result;
}

export function reindexPositions(blocks: Block[]): Block[] {
  return blocks.map((block, index) =>
    block.position === index ? block : { ...block, position: index },
  );
}

export function isFolderAncestor(
  snapshot: WorkspaceSnapshot,
  folderId: string,
  maybeAncestorId: string,
): boolean {
  let current: string | null = folderId;
  const seen = new Set<string>();

  while (current) {
    if (current === maybeAncestorId) return true;
    if (seen.has(current)) return false;
    seen.add(current);
    current = snapshot.folders[current]?.parentFolderId ?? null;
  }

  return false;
}

/** All trashed documents and sub-documents, newest first. */
export function listTrashedDocuments(
  snapshot: WorkspaceSnapshot,
): TrashedDocumentItem[] {
  return Object.values(snapshot.documents)
    .filter((doc) => doc.deletedAt !== null)
    .sort(
      (a, b) =>
        (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "") ||
        a.title.localeCompare(b.title),
    )
    .map((document) => {
      let parentTitle: string | null = null;
      if (document.parentBlockId) {
        const parentBlock = snapshot.blocks[document.parentBlockId];
        const parentDoc = parentBlock
          ? snapshot.documents[parentBlock.documentId]
          : undefined;
        parentTitle = parentDoc
          ? displayTitle(parentDoc.title)
          : "Unknown document";
      }
      return { document, parentTitle };
    });
}
