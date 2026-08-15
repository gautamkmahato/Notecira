import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";
import { getAppOrigin } from "@/lib/insforge/env";

const PROVIDERS = new Set(["google", "github"]);
const VERIFIER_COOKIE = "writing_oauth_verifier";

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;
  if (!PROVIDERS.has(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const staging = new NextResponse();
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: staging.cookies,
  });

  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: `${getAppOrigin()}/api/auth/callback`,
    skipBrowserRedirect: true,
  });

  if (error || !data?.url) {
    return NextResponse.redirect(
      `${getAppOrigin()}/sign-in?error=oauth_start`,
    );
  }

  const response = NextResponse.redirect(data.url);
  for (const cookie of staging.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  if (data.codeVerifier) {
    response.cookies.set(VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
  }
  return response;
}
