import { createId, nowIso } from "@/lib/domain/ids";
import { defaultAttrsForType } from "@/lib/domain/types";
import type { Block, Document, WorkspaceSnapshot } from "@/lib/domain/types";

/** Default workspace shape when the DB has no rows yet. */
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
