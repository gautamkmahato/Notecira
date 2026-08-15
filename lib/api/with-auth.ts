import type { AuthContext } from "@/lib/api/auth";
import { AuthError, requireAuth } from "@/lib/api/auth";
import { handleRouteError, jsonError } from "@/lib/api/responses";

type RouteContext = { params: Promise<Record<string, string>> };

type AuthedHandler = (
  request: Request,
  auth: AuthContext,
  context?: RouteContext,
) => Promise<Response>;

export function withAuth(handler: AuthedHandler) {
  return async (request: Request, context?: RouteContext) => {
    try {
      const auth = await requireAuth(request);
      return await handler(request, auth, context);
    } catch (error) {
      if (error instanceof AuthError) {
        return jsonError(error.message, error.status);
      }
      return handleRouteError(error);
    }
  };
}
