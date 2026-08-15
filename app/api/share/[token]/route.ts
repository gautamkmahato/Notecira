import { loadSharedDocument } from "@/lib/data/document-shares-db";
import { requireAuth, AuthError } from "@/lib/api/auth";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api/responses";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token) return jsonError("Invalid share link", 400);

    let viewerEmail: string | undefined;
    try {
      const auth = await requireAuth(request);
      viewerEmail = auth.email;
    } catch (error) {
      if (!(error instanceof AuthError)) throw error;
    }

    const result = await loadSharedDocument(token, viewerEmail);
    if (result.status === "not_found") {
      return jsonError("This document is not available", 404);
    }
    if (result.status === "auth_required") {
      return jsonError("Sign in to view this document", 401);
    }
    if (result.status === "forbidden") {
      return jsonError("You do not have access to this document", 403);
    }

    return jsonOk(result.payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
