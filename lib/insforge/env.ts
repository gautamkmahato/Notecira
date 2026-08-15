function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

export function getInsforgeUrl(): string {
  const value = process.env.NEXT_PUBLIC_INSFORGE_URL;
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_INSFORGE_URL environment variable");
  }
  return value;
}

export function getInsforgeAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!value) {
    throw new Error(
      "Missing NEXT_PUBLIC_INSFORGE_ANON_KEY environment variable",
    );
  }
  return value;
}

export function getAppOrigin(): string {
  return (
    readEnv("NEXT_PUBLIC_APP_URL", "APP_URL") ?? "http://localhost:3000"
  );
}
