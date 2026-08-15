import type { WorkspaceSnapshot } from "@/lib/domain/types";
import type { WorkspaceRepository } from "./repository";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign(`/sign-in?next=${next}`);
    }
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return body;
}

export class ApiWorkspaceRepository implements WorkspaceRepository {
  async load(): Promise<WorkspaceSnapshot> {
    const response = await fetch("/api/workspace", {
      cache: "no-store",
      credentials: "include",
    });
    return parseJson<WorkspaceSnapshot>(response);
  }

  async persist(snapshot: WorkspaceSnapshot): Promise<void> {
    const response = await fetch("/api/workspace", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(snapshot),
    });
    await parseJson<{ ok: boolean }>(response);
  }
}

export const apiWorkspaceRepository = new ApiWorkspaceRepository();
