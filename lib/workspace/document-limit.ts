import {
  canAddDocuments,
  getMaxDocumentsPerUser,
  type WorkspaceDocumentLimit,
} from "@/lib/constants/workspace-limits";
import { getUserInsforge } from "@/lib/insforge/server";
import type { WorkspaceSnapshot } from "@/lib/domain/types";
import { countActiveDocumentsInSnapshot } from "@/lib/workspace/document-count";

export class DocumentLimitError extends Error {
  readonly status = 403;
  readonly limit: WorkspaceDocumentLimit;
  readonly current: number;

  constructor(current: number, limit: WorkspaceDocumentLimit) {
    const limitLabel = limit === null ? "unlimited" : String(limit);
    super(
      limit === null
        ? "Document limit check failed"
        : `Document limit reached (${current}/${limit}). Delete documents or increase WORKSPACE_MAX_DOCUMENTS to create more.`,
    );
    this.name = "DocumentLimitError";
    this.current = current;
    this.limit = limit;
  }
}

export { countActiveDocumentsInSnapshot } from "@/lib/workspace/document-count";

export async function countActiveDocumentsInDb(
  accessToken: string,
): Promise<number> {
  const { count, error } = await getUserInsforge(accessToken)
    .database.from("documents")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if (error) throw error;
  return count ?? 0;
}

export function assertSnapshotWithinDocumentLimit(
  snapshot: WorkspaceSnapshot,
  limit: WorkspaceDocumentLimit = getMaxDocumentsPerUser(),
): void {
  const active = countActiveDocumentsInSnapshot(snapshot);
  if (limit !== null && active > limit) {
    throw new DocumentLimitError(active, limit);
  }
}

export async function assertCanCreateDocuments(
  accessToken: string,
  additional: number,
  limit: WorkspaceDocumentLimit = getMaxDocumentsPerUser(),
): Promise<void> {
  if (additional <= 0) return;
  if (limit === null) return;

  const current = await countActiveDocumentsInDb(accessToken);
  if (!canAddDocuments(current, additional, limit)) {
    throw new DocumentLimitError(current, limit);
  }
}

export function getWorkspaceLimitsPayload(activeDocuments: number) {
  const maxDocuments = getMaxDocumentsPerUser();
  const atLimit =
    maxDocuments !== null && activeDocuments >= maxDocuments;
  return {
    maxDocuments,
    activeDocuments,
    atLimit,
    remaining:
      maxDocuments === null
        ? null
        : Math.max(0, maxDocuments - activeDocuments),
  };
}
