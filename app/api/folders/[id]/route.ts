import { deleteFolder, updateFolder } from "@/lib/data/workspace-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { Folder } from "@/lib/domain/types";

type RouteContext = { params: Promise<{ id: string }> };

export const PUT = withAuth(async (request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  const patch = (await request.json()) as Partial<Folder>;
  try {
    const updated = await updateFolder(
      auth.accessToken,
      auth.userId,
      id,
      patch,
    );
    return jsonOk(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "Folder not found") {
      return jsonError(error.message, 404);
    }
    throw error;
  }
});

export const DELETE = withAuth(async (_request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  await deleteFolder(auth.accessToken, id);
  return jsonOk({ ok: true });
});
