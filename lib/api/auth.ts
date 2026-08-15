import { getAccessTokenCookieName } from "@insforge/sdk/ssr/middleware";
import { cookies } from "next/headers";
import { getInsforgeFromRequest } from "@/lib/insforge/server";

export type AuthContext = {
  userId: string;
  email: string;
  accessToken: string;
};

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function readBearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return undefined;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : undefined;
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const bearer = readBearerToken(request);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(getAccessTokenCookieName())?.value;
  const accessToken = bearer ?? cookieToken;

  if (!accessToken) {
    throw new AuthError("Unauthorized", 401);
  }

  const insforge = await getInsforgeFromRequest(request, bearer);
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user?.id) {
    throw new AuthError("Invalid or expired session", 401);
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    accessToken,
  };
}
