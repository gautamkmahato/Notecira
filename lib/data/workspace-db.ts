import { createEmptyWorkspace } from "@/lib/data/local-repository";
import {
  getInsforgeAdmin,
  getUserInsforge,
} from "@/lib/insforge/server";
import type {
  Block,
  Document,
  Folder,
  WorkspaceSnapshot,
} from "@/lib/domain/types";

type FolderRow = {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  folder_id: string | null;
  parent_block_id: string | null;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type BlockRow = {
  id: string;
  user_id: string;
  document_id: string;
  type: string;
  content: string;
  attrs: Block["attrs"];
  position: number;
  linked_document_id: string | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceMetaRow = {
  user_id: string;
  version: number;
  root_folder_ids: string[];
  root_document_ids: string[];
  updated_at: string;
};

function toIso(value: string): string {
  return new Date(value).toISOString();
}

function folderFromRow(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    parentFolderId: row.parent_folder_id,
    sortOrder: row.sort_order,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function documentFromRow(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    folderId: row.folder_id,
    parentBlockId: row.parent_block_id,
    sortOrder: row.sort_order,
    deletedAt: row.deleted_at ? toIso(row.deleted_at) : null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function blockFromRow(row: BlockRow): Block {
  return {
    id: row.id,
    documentId: row.document_id,
    type: row.type as Block["type"],
    content: row.content ?? "",
    attrs: row.attrs ?? {},
    position: row.position,
    linkedDocumentId: row.linked_document_id,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function folderToRow(folder: Folder, userId: string) {
  return {
    id: folder.id,
    user_id: userId,
    name: folder.name,
    parent_folder_id: folder.parentFolderId,
    sort_order: folder.sortOrder,
    created_at: folder.createdAt,
    updated_at: folder.updatedAt,
  };
}

function documentToRow(document: Document, userId: string) {
  return {
    id: document.id,
    user_id: userId,
    title: document.title,
    folder_id: document.folderId,
    parent_block_id: document.parentBlockId,
    sort_order: document.sortOrder,
    deleted_at: document.deletedAt,
    created_at: document.createdAt,
    updated_at: document.updatedAt,
  };
}

function blockToRow(block: Block, userId: string) {
  return {
    id: block.id,
    user_id: userId,
    document_id: block.documentId,
    type: block.type,
    content: block.content,
    attrs: block.attrs,
    position: block.position,
    linked_document_id: block.linkedDocumentId,
    created_at: block.createdAt,
    updated_at: block.updatedAt,
  };
}

function recordsToMap<T extends { id: string }>(rows: T[]): Record<string, T> {
  return Object.fromEntries(rows.map((row) => [row.id, row]));
}

export async function loadWorkspace(
  accessToken: string,
  userId: string,
): Promise<WorkspaceSnapshot> {
  const db = getUserInsforge(accessToken).database;

  const [foldersRes, documentsRes, blocksRes, metaRes] = await Promise.all([
    db.from("folders").select("*").order("sort_order", { ascending: true }),
    db.from("documents").select("*").order("sort_order", { ascending: true }),
    db.from("blocks").select("*").order("position", { ascending: true }),
    db.from("workspace_meta").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (foldersRes.error) throw foldersRes.error;
  if (documentsRes.error) throw documentsRes.error;
  if (blocksRes.error) throw blocksRes.error;
  if (metaRes.error) throw metaRes.error;

  const folderRows = (foldersRes.data ?? []) as FolderRow[];
  const documentRows = (documentsRes.data ?? []) as DocumentRow[];
  const blockRows = (blocksRes.data ?? []) as BlockRow[];
  const meta = metaRes.data as WorkspaceMetaRow | null;

  if (documentRows.length === 0) {
    return createEmptyWorkspace();
  }

  const folders = recordsToMap(folderRows.map(folderFromRow));
  const documents = recordsToMap(documentRows.map(documentFromRow));
  const blocks = recordsToMap(blockRows.map(blockFromRow));

  return {
    version: 5,
    folders,
    documents,
    blocks,
    rootFolderIds: meta?.root_folder_ids ?? [],
    rootDocumentIds: meta?.root_document_ids ?? [],
  };
}

export async function saveWorkspace(
  snapshot: WorkspaceSnapshot,
  userId: string,
): Promise<void> {
  const { error } = await getInsforgeAdmin().database.rpc("replace_workspace", {
    p_user_id: userId,
    snapshot,
  });
  if (error) throw error;
}

export async function listDocuments(accessToken: string): Promise<Document[]> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("documents")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DocumentRow[]).map(documentFromRow);
}

export async function getDocument(
  accessToken: string,
  id: string,
): Promise<Document | null> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? documentFromRow(data as DocumentRow) : null;
}

export async function createDocument(
  accessToken: string,
  userId: string,
  document: Document,
): Promise<Document> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("documents")
    .insert(documentToRow(document, userId))
    .select()
    .single();
  if (error) throw error;
  return documentFromRow(data as DocumentRow);
}

export async function updateDocument(
  accessToken: string,
  userId: string,
  id: string,
  patch: Partial<Document>,
): Promise<Document> {
  const current = await getDocument(accessToken, id);
  if (!current) throw new Error("Document not found");

  const next = { ...current, ...patch, id };
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("documents")
    .update(documentToRow(next, userId))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return documentFromRow(data as DocumentRow);
}

export async function deleteDocument(
  accessToken: string,
  id: string,
): Promise<void> {
  const { error } = await getUserInsforge(accessToken)
    .database.from("documents")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listFolders(accessToken: string): Promise<Folder[]> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("folders")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as FolderRow[]).map(folderFromRow);
}

export async function createFolder(
  accessToken: string,
  userId: string,
  folder: Folder,
): Promise<Folder> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("folders")
    .insert(folderToRow(folder, userId))
    .select()
    .single();
  if (error) throw error;
  return folderFromRow(data as FolderRow);
}

export async function updateFolder(
  accessToken: string,
  userId: string,
  id: string,
  patch: Partial<Folder>,
): Promise<Folder> {
  const { data: rows, error: readError } = await getUserInsforge(accessToken)
    .database.from("folders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw readError;
  if (!rows) throw new Error("Folder not found");

  const current = folderFromRow(rows as FolderRow);
  const next = { ...current, ...patch, id };
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("folders")
    .update(folderToRow(next, userId))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return folderFromRow(data as FolderRow);
}

export async function deleteFolder(
  accessToken: string,
  id: string,
): Promise<void> {
  const { error } = await getUserInsforge(accessToken)
    .database.from("folders")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listBlocks(
  accessToken: string,
  documentId?: string,
): Promise<Block[]> {
  let query = getUserInsforge(accessToken)
    .database.from("blocks")
    .select("*")
    .order("position", { ascending: true });
  if (documentId) query = query.eq("document_id", documentId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as BlockRow[]).map(blockFromRow);
}

export async function getBlock(
  accessToken: string,
  id: string,
): Promise<Block | null> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("blocks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? blockFromRow(data as BlockRow) : null;
}

export async function createBlock(
  accessToken: string,
  userId: string,
  block: Block,
): Promise<Block> {
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("blocks")
    .insert(blockToRow(block, userId))
    .select()
    .single();
  if (error) throw error;
  return blockFromRow(data as BlockRow);
}

export async function updateBlock(
  accessToken: string,
  userId: string,
  id: string,
  patch: Partial<Block>,
): Promise<Block> {
  const current = await getBlock(accessToken, id);
  if (!current) throw new Error("Block not found");

  const next = { ...current, ...patch, id };
  const { data, error } = await getUserInsforge(accessToken)
    .database.from("blocks")
    .update(blockToRow(next, userId))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return blockFromRow(data as BlockRow);
}

export async function deleteBlock(
  accessToken: string,
  id: string,
): Promise<void> {
  const { error } = await getUserInsforge(accessToken)
    .database.from("blocks")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
