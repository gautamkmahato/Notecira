import { getAppOrigin } from "@/lib/insforge/env";
import { getInsforgeAdmin, getUserInsforge } from "@/lib/insforge/server";
import type {
  DocumentShareSettings,
  SharedDocumentPayload,
  ShareVisibility,
} from "@/lib/domain/sharing";
import type { WorkspaceSnapshot } from "@/lib/domain/types";

type ShareRow = {
  document_id: string;
  owner_user_id: string;
  visibility: ShareVisibility;
  share_token: string | null;
  allowed_emails: string[];
  updated_at: string;
};

type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  parent_block_id: string | null;
  deleted_at: string | null;
};

type BlockRow = {
  id: string;
  document_id: string;
  parent_block_id: string | null;
  type: string;
  content: string;
  attrs: Record<string, unknown>;
  position: number;
  linked_document_id: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toSettings(row: ShareRow): DocumentShareSettings {
  const shareUrl = row.share_token
    ? `${getAppOrigin()}/share/${row.share_token}`
    : null;
  return {
    documentId: row.document_id,
    visibility: row.visibility,
    shareToken: row.share_token,
    allowedEmails: row.allowed_emails ?? [],
    shareUrl,
  };
}

function newShareToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function ensureDocumentShares(
  userId: string,
  documentIds: string[],
): Promise<void> {
  if (documentIds.length === 0) return;

  const admin = getInsforgeAdmin();
  const { data: existingDocs, error: readError } = await admin.database
    .from("documents")
    .select("id")
    .eq("user_id", userId)
    .in("id", documentIds);
  if (readError) throw readError;

  const validIds = ((existingDocs ?? []) as { id: string }[]).map((row) => row.id);
  if (validIds.length === 0) return;

  const { error } = await admin.database.from("document_shares").upsert(
    validIds.map((document_id) => ({
      document_id,
      owner_user_id: userId,
      visibility: "private" as const,
      share_token: null,
      allowed_emails: [],
    })),
    { onConflict: "document_id", ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function getDocumentShare(
  accessToken: string,
  userId: string,
  documentId: string,
): Promise<DocumentShareSettings | null> {
  const owned = await getUserInsforge(accessToken)
    .database.from("documents")
    .select("id")
    .eq("id", documentId)
    .maybeSingle();
  if (owned.error) throw owned.error;
  if (!owned.data) return null;

  const { data, error } = await getUserInsforge(accessToken)
    .database.from("document_shares")
    .select("*")
    .eq("document_id", documentId)
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    await ensureDocumentShares(userId, [documentId]);
    return {
      documentId,
      visibility: "private",
      shareToken: null,
      allowedEmails: [],
      shareUrl: null,
    };
  }
  return toSettings(data as ShareRow);
}

export async function updateDocumentShare(
  accessToken: string,
  userId: string,
  documentId: string,
  visibility: ShareVisibility,
  allowedEmails: string[],
): Promise<DocumentShareSettings> {
  const current = await getDocumentShare(accessToken, userId, documentId);
  if (!current) throw new Error("Document not found");

  const normalizedEmails = [
    ...new Set(allowedEmails.map(normalizeEmail).filter(Boolean)),
  ];

  let shareToken = current.shareToken;
  if (visibility === "private") {
    shareToken = null;
  } else if (!shareToken) {
    shareToken = newShareToken();
  }

  const { data, error } = await getUserInsforge(accessToken)
    .database.from("document_shares")
    .update({
      visibility,
      share_token: shareToken,
      allowed_emails: normalizedEmails,
      updated_at: new Date().toISOString(),
    })
    .eq("document_id", documentId)
    .eq("owner_user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return toSettings(data as ShareRow);
}

async function loadChildDocumentIds(
  admin: ReturnType<typeof getInsforgeAdmin>,
  documentId: string,
): Promise<string[]> {
  const result: string[] = [];
  const stack = [documentId];
  const seen = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    result.push(current);

    const { data: blocks, error } = await admin.database
      .from("blocks")
      .select("linked_document_id")
      .eq("document_id", current);
    if (error) throw error;

    for (const block of (blocks ?? []) as { linked_document_id: string | null }[]) {
      if (block.linked_document_id && !seen.has(block.linked_document_id)) {
        stack.push(block.linked_document_id);
      }
    }
  }

  return result;
}

export async function loadSharedDocument(
  token: string,
  viewerEmail?: string,
): Promise<
  | { status: "ok"; payload: SharedDocumentPayload }
  | { status: "not_found" }
  | { status: "auth_required" }
  | { status: "forbidden" }
> {
  const admin = getInsforgeAdmin();
  const { data: share, error } = await admin.database
    .from("document_shares")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!share) return { status: "not_found" };

  const shareRow = share as ShareRow;
  if (shareRow.visibility === "private") return { status: "not_found" };

  if (shareRow.visibility === "restricted") {
    if (!viewerEmail) return { status: "auth_required" };
    const email = normalizeEmail(viewerEmail);
    const allowed = (shareRow.allowed_emails ?? []).map(normalizeEmail);
    if (!allowed.includes(email)) return { status: "forbidden" };
  }

  const docIds = await loadChildDocumentIds(admin, shareRow.document_id);
  const { data: documents, error: docsError } = await admin.database
    .from("documents")
    .select("id, title, parent_block_id, deleted_at")
    .in("id", docIds);
  if (docsError) throw docsError;

  const activeDocs = ((documents ?? []) as DocumentRow[]).filter(
    (doc) => doc.deleted_at === null,
  );
  if (activeDocs.length === 0) return { status: "not_found" };

  const activeDocIds = activeDocs.map((doc) => doc.id);
  const { data: blocks, error: blocksError } = await admin.database
    .from("blocks")
    .select("id, document_id, parent_block_id, type, content, attrs, position, linked_document_id")
    .in("document_id", activeDocIds)
    .order("position", { ascending: true });
  if (blocksError) throw blocksError;

  const documentsMap: SharedDocumentPayload["documents"] = {};
  for (const doc of activeDocs) {
    documentsMap[doc.id] = {
      id: doc.id,
      title: doc.title,
      parentBlockId: doc.parent_block_id,
    };
  }

  const blocksMap: SharedDocumentPayload["blocks"] = {};
  for (const block of (blocks ?? []) as BlockRow[]) {
    blocksMap[block.id] = {
      id: block.id,
      documentId: block.document_id,
      type: block.type,
      content: block.content,
      attrs: block.attrs ?? {},
      position: block.position,
      linkedDocumentId: block.linked_document_id,
    };
  }

  return {
    status: "ok",
    payload: {
      rootDocumentId: shareRow.document_id,
      documents: documentsMap,
      blocks: blocksMap,
    },
  };
}

export async function syncSharesAfterWorkspaceSave(
  userId: string,
  snapshot: WorkspaceSnapshot,
): Promise<void> {
  await ensureDocumentShares(userId, Object.keys(snapshot.documents));
}
