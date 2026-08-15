import {
  deleteBlock,
  getBlock,
  updateBlock,
} from "@/lib/data/workspace-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { Block } from "@/lib/domain/types";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  const block = await getBlock(auth.accessToken, id);
  if (!block) return jsonError("Block not found", 404);
  return jsonOk(block);
});

export const PUT = withAuth(async (request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  const patch = (await request.json()) as Partial<Block>;
  try {
    const updated = await updateBlock(
      auth.accessToken,
      auth.userId,
      id,
      patch,
    );
    return jsonOk(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "Block not found") {
      return jsonError(error.message, 404);
    }
    throw error;
  }
});

export const DELETE = withAuth(async (_request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  const existing = await getBlock(auth.accessToken, id);
  if (!existing) return jsonError("Block not found", 404);
  await deleteBlock(auth.accessToken, id);
  return jsonOk({ ok: true });
});
