import { getAccessTokenCookieName } from "@insforge/sdk/ssr/middleware";
import { cookies } from "next/headers";
import { refreshSessionFromCookies } from "@/lib/auth/refresh-session";
import { getInsforgeFromRequest } from "@/lib/insforge/server";
import { authCookieSettings } from "@/lib/insforge/auth-session";

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

async function resolveAccessToken(
  request: Request,
  bearer?: string,
): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(
    getAccessTokenCookieName(authCookieSettings.names),
  )?.value;

  if (bearer) {
    return bearer;
  }

  if (cookieToken) {
    const insforge = await getInsforgeFromRequest(request, cookieToken);
    const { data, error } = await insforge.auth.getCurrentUser();
    if (!error && data?.user?.id) {
      return cookieToken;
    }
  }

  return refreshSessionFromCookies(request);
}

export async function requireAuth(request: Request): Promise<AuthContext> {
  const bearer = readBearerToken(request);
  const accessToken = await resolveAccessToken(request, bearer);

  if (!accessToken) {
    throw new AuthError("Unauthorized", 401);
  }

  const insforge = await getInsforgeFromRequest(request, accessToken);
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user?.id) {
    const refreshed = bearer ? null : await refreshSessionFromCookies(request);
    if (!refreshed) {
      throw new AuthError("Invalid or expired session", 401);
    }

    const retryClient = await getInsforgeFromRequest(request, refreshed);
    const retry = await retryClient.auth.getCurrentUser();
    if (retry.error || !retry.data?.user?.id) {
      throw new AuthError("Invalid or expired session", 401);
    }

    return {
      userId: retry.data.user.id,
      email: retry.data.user.email ?? "",
      accessToken: refreshed,
    };
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    accessToken,
  };
}
