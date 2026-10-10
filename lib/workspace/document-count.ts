import type { WorkspaceSnapshot } from "@/lib/domain/types";

/** Active documents = not in trash (includes root and nested sub-documents). */
export function countActiveDocumentsInSnapshot(
  snapshot: WorkspaceSnapshot,
): number {
  return Object.values(snapshot.documents).filter((doc) => !doc.deletedAt)
    .length;
}
