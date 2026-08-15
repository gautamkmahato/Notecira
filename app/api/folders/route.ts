import { createFolder, listFolders } from "@/lib/data/workspace-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { Folder } from "@/lib/domain/types";

export const GET = withAuth(async (_request, auth) => {
  const folders = await listFolders(auth.accessToken);
  return jsonOk(folders);
});

export const POST = withAuth(async (request, auth) => {
  const body = (await request.json()) as Folder;
  if (!body?.id || !body.name) {
    return jsonError("Folder id and name are required", 400);
  }
  const created = await createFolder(auth.accessToken, auth.userId, body);
  return jsonOk(created, 201);
});
