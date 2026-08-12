import type { WorkspaceSnapshot } from "@/lib/domain/types";

/**
 * Persistence boundary. Today: localStorage.
 * Tomorrow: implement the same interface with Postgres-backed API routes.
 *
 * Keep mutations in the store; the repository only loads/persists snapshots
 * (or later, individual SQL-shaped operations with the same entity types).
 */
export interface WorkspaceRepository {
  load(): Promise<WorkspaceSnapshot>;
  persist(snapshot: WorkspaceSnapshot): Promise<void>;
}
