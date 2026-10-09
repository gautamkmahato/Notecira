import { refreshAuth, setAuthCookies } from "@insforge/sdk/ssr";
import {
  getRefreshTokenCookieName,
} from "@insforge/sdk/ssr/middleware";
import { cookies } from "next/headers";
import {
  authCookieSettings,
  getInsforgeAuthConfig,
} from "@/lib/insforge/auth-session";

/** Exchange refresh cookie for a new access token and persist cookies. */
export async function refreshSessionFromCookies(
  request?: Request,
): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(
    getRefreshTokenCookieName(authCookieSettings.names),
  )?.value;

  if (!refreshToken) {
    return null;
  }

  const result = await refreshAuth({
    ...getInsforgeAuthConfig(),
    ...authCookieSettings,
    request,
    cookies: cookieStore,
    refreshToken,
  });

  if (!result.accessToken) {
    return null;
  }

  setAuthCookies(
    cookieStore,
    {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken ?? refreshToken,
    },
    authCookieSettings,
  );

  return result.accessToken;
}
