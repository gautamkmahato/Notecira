import { createAdminClient, createClient } from "@insforge/sdk";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import {
  getInsforgeAnonKey,
  getInsforgeUrl,
} from "@/lib/insforge/env";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Server-only admin client (bypasses RLS). Use only after verifying the user in API routes. */
export function getInsforgeAdmin() {
  return createAdminClient({
    baseUrl: getInsforgeUrl(),
    apiKey: requireEnv("INSFORGE_API_KEY"),
  });
}

/** User-scoped client for RLS-enforced reads/writes. */
export function getUserInsforge(accessToken: string) {
  return createClient({
    baseUrl: getInsforgeUrl(),
    anonKey: getInsforgeAnonKey(),
    accessToken,
  });
}

/** Resolve session from cookies or an explicit bearer token. */
export async function getInsforgeFromRequest(
  request: Request,
  accessToken?: string,
) {
  const cookieStore = await cookies();
  return createServerClient({
    baseUrl: getInsforgeUrl(),
    anonKey: getInsforgeAnonKey(),
    cookies: cookieStore,
    accessToken,
  });
}
