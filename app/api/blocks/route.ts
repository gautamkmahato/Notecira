import { createBlock, listBlocks } from "@/lib/data/workspace-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { Block } from "@/lib/domain/types";

export const GET = withAuth(async (request, auth) => {
  const documentId = new URL(request.url).searchParams.get("documentId");
  const blocks = await listBlocks(
    auth.accessToken,
    documentId ?? undefined,
  );
  return jsonOk(blocks);
});

export const POST = withAuth(async (request, auth) => {
  const body = (await request.json()) as Block;
  if (!body?.id || !body.documentId) {
    return jsonError("Block id and documentId are required", 400);
  }
  const created = await createBlock(auth.accessToken, auth.userId, body);
  return jsonOk(created, 201);
});
