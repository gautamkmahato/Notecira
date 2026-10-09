import { NextResponse, type NextRequest } from "next/server";
import {
  getAccessTokenCookieName,
  getRefreshTokenCookieName,
  updateSession,
} from "@insforge/sdk/ssr/middleware";
import {
  AUTH_REFRESH_LEEWAY_SECONDS,
  authCookieSettings,
  getInsforgeAuthConfig,
} from "@/lib/insforge/auth-session";

const PUBLIC_PREFIXES = ["/sign-in", "/api/auth", "/share", "/api/share"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function hasAuthToken(request: NextRequest): boolean {
  if (request.cookies.get(getAccessTokenCookieName())?.value) return true;
  if (
    request.cookies.get(
      getRefreshTokenCookieName(authCookieSettings.names),
    )?.value
  ) {
    return true;
  }
  const header = request.headers.get("authorization");
  return header?.toLowerCase().startsWith("bearer ") ?? false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  await updateSession({
    ...getInsforgeAuthConfig(),
    ...authCookieSettings,
    requestCookies: request.cookies,
    responseCookies: response.cookies,
    refreshLeewaySeconds: AUTH_REFRESH_LEEWAY_SECONDS,
  });

  if (isPublicPath(pathname)) {
    return response;
  }

  if (!hasAuthToken(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signIn = new URL("/sign-in", request.url);
    if (pathname !== "/") {
      signIn.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
