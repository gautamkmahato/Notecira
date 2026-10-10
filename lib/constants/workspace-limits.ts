/**
 * Workspace document limits (root pages + nested sub-documents).
 *
 * Self-host: set `WORKSPACE_MAX_DOCUMENTS` in the environment.
 * - Positive integer: max active (non-trashed) documents per user.
 * - `0`: unlimited documents.
 * - Unset: defaults to {@link DEFAULT_WORKSPACE_MAX_DOCUMENTS}.
 */

export const DEFAULT_WORKSPACE_MAX_DOCUMENTS = 10;

export type WorkspaceDocumentLimit = number | null;

/** `null` means unlimited. */
export function getMaxDocumentsPerUser(): WorkspaceDocumentLimit {
  const raw = process.env.WORKSPACE_MAX_DOCUMENTS;
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_WORKSPACE_MAX_DOCUMENTS;
  }

  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_WORKSPACE_MAX_DOCUMENTS;
  }

  if (parsed === 0) {
    return null;
  }

  return parsed;
}

export function countTowardDocumentLimit(currentActive: number): number {
  return Math.max(0, currentActive);
}

export function canAddDocuments(
  currentActive: number,
  additional: number,
  limit: WorkspaceDocumentLimit,
): boolean {
  if (additional <= 0) return true;
  if (limit === null) return true;
  return currentActive + additional <= limit;
}

export function remainingDocumentSlots(
  currentActive: number,
  limit: WorkspaceDocumentLimit,
): number | null {
  if (limit === null) return null;
  return Math.max(0, limit - currentActive);
}
