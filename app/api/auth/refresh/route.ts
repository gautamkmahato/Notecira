import { createRefreshAuthRouter } from "@insforge/sdk/ssr";
import {
  authCookieSettings,
  getInsforgeAuthConfig,
} from "@/lib/insforge/auth-session";

export const { POST } = createRefreshAuthRouter({
  ...getInsforgeAuthConfig(),
  ...authCookieSettings,
});
