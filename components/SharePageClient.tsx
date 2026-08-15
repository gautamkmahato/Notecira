"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SharedDocumentPayload } from "@/lib/domain/sharing";
import { SharedWorkspace } from "@/components/SharedWorkspace";

type SharePageProps = {
  token: string;
};

export function SharePageClient({ token }: SharePageProps) {
  const [payload, setPayload] = useState<SharedDocumentPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    void fetch(`/api/share/${token}`, { credentials: "include" })
      .then(async (res) => {
        const body = (await res.json()) as SharedDocumentPayload & {
          error?: string;
        };
        if (res.status === 401) {
          setAuthRequired(true);
          throw new Error(body.error ?? "Sign in required");
        }
        if (!res.ok) throw new Error(body.error ?? "Failed to load document");
        setPayload(body);
      })
      .catch((err: Error) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[var(--font-size-lg)] font-medium text-[var(--color-dark-gray-2)]">
          {error}
        </p>
        {authRequired ? (
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/share/${token}`)}`}
            className="notion-btn notion-btn-primary"
          >
            Sign in to continue
          </Link>
        ) : (
          <Link href="/sign-in" className="notion-btn">
            Go to sign in
          </Link>
        )}
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
        Loading document…
      </main>
    );
  }

  return <SharedWorkspace payload={payload} />;
}
