import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";
import { getAppOrigin } from "@/lib/insforge/env";

const VERIFIER_COOKIE = "writing_oauth_verifier";

export async function GET(request: NextRequest) {
  const origin = getAppOrigin();
  const url = new URL(request.url);

  if (url.searchParams.get("insforge_error")) {
    return NextResponse.redirect(`${origin}/sign-in?error=oauth`);
  }

  const code = url.searchParams.get("insforge_code");
  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}/documents`);
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const verifier = request.cookies.get(VERIFIER_COOKIE)?.value;
  const { error } = await auth.exchangeOAuthCode(code, verifier);
  response.cookies.delete(VERIFIER_COOKIE);

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=oauth`);
  }

  return response;
}
