import type { AuthCookieSettings } from "@insforge/sdk/ssr/middleware";
import { getInsforgeAnonKey, getInsforgeUrl } from "@/lib/insforge/env";

/** Refresh access tokens this many seconds before JWT expiry. */
export const AUTH_REFRESH_LEEWAY_SECONDS = 120;

const TWENTY_FOUR_HOURS_SECONDS = 24 * 60 * 60;

export const authCookieSettings: AuthCookieSettings = {
  options: {
    accessToken: {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: TWENTY_FOUR_HOURS_SECONDS,
    },
    refreshToken: {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      maxAge: TWENTY_FOUR_HOURS_SECONDS,
    },
  },
};

export function getInsforgeAuthConfig() {
  return {
    baseUrl: getInsforgeUrl(),
    anonKey: getInsforgeAnonKey(),
  };
}
