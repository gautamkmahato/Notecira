import { loadWorkspace, saveWorkspace } from "@/lib/data/workspace-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { WorkspaceSnapshot } from "@/lib/domain/types";

export const GET = withAuth(async (_request, auth) => {
  const snapshot = await loadWorkspace(auth.accessToken, auth.userId);
  return jsonOk(snapshot);
});

export const PUT = withAuth(async (request, auth) => {
  const body = (await request.json()) as WorkspaceSnapshot;
  if (!body || body.version !== 5) {
    return jsonError("Invalid workspace snapshot", 400);
  }
  await saveWorkspace(body, auth.userId);
  return jsonOk({ ok: true });
});
