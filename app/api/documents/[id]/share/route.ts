import {
  getDocumentShare,
  updateDocumentShare,
} from "@/lib/data/document-shares-db";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonOk } from "@/lib/api/responses";
import type { ShareVisibility } from "@/lib/domain/sharing";

type RouteContext = { params: Promise<{ id: string }> };

const VISIBILITIES = new Set<ShareVisibility>([
  "private",
  "public",
  "restricted",
]);

export const GET = withAuth(async (_request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  const share = await getDocumentShare(auth.accessToken, auth.userId, id);
  if (!share) return jsonError("Document not found", 404);
  return jsonOk(share);
});

export const PUT = withAuth(async (request, auth, context) => {
  const { id } = await (context as RouteContext).params;
  const body = (await request.json()) as {
    visibility?: ShareVisibility;
    allowedEmails?: string[];
  };

  if (!body.visibility || !VISIBILITIES.has(body.visibility)) {
    return jsonError("Invalid visibility", 400);
  }

  const allowedEmails = Array.isArray(body.allowedEmails)
    ? body.allowedEmails.filter((e) => typeof e === "string")
    : [];

  if (body.visibility === "restricted" && allowedEmails.length === 0) {
    return jsonError("Add at least one email for restricted sharing", 400);
  }

  try {
    const share = await updateDocumentShare(
      auth.accessToken,
      auth.userId,
      id,
      body.visibility,
      allowedEmails,
    );
    return jsonOk(share);
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      return jsonError(error.message, 404);
    }
    throw error;
  }
});
