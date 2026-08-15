"use client";

import { useEffect, useState } from "react";
import {
  userDisplayName,
  userInitial,
  type SessionUser,
} from "@/lib/auth/session-user";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatProviders(providers: string[]): string {
  if (providers.length === 0) return "—";
  return providers
    .map((provider) => provider.charAt(0).toUpperCase() + provider.slice(1))
    .join(", ");
}

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/auth/session", { credentials: "include" })
      .then(async (res) => {
        const body = (await res.json()) as { user?: SessionUser; error?: string };
        if (!res.ok) throw new Error(body.error ?? "Failed to load profile");
        if (!body.user) throw new Error("Not signed in");
        setUser(body.user);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-[var(--color-mid-gray-6)] bg-[var(--color-white)] px-6 py-5">
        <h1 className="text-[var(--font-size-xl)] font-medium tracking-tight text-[var(--color-dark-gray-2)]">
          Profile
        </h1>
      </header>

      <div className="flex flex-1 items-start justify-center p-6">
        {loading ? (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Loading profile…
          </p>
        ) : error || !user ? (
          <p className="text-[var(--font-size-sm)] text-red-600" role="alert">
            {error ?? "Could not load profile"}
          </p>
        ) : (
          <section className="w-full max-w-lg rounded-[var(--radius-2xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-dark-gray-2)] text-[var(--font-size-xl)] font-medium text-[var(--color-white)]">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  userInitial(user)
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[var(--font-size-lg)] font-semibold text-[var(--color-dark-gray-2)]">
                  {userDisplayName(user)}
                </h2>
                <p className="truncate text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
                  {user.email}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-[var(--font-size-2xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
                  Email
                </dt>
                <dd className="mt-1 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)]">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--font-size-2xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
                  Sign-in provider
                </dt>
                <dd className="mt-1 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)]">
                  {formatProviders(user.providers)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--font-size-2xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
                  Email verified
                </dt>
                <dd className="mt-1 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)]">
                  {user.emailVerified ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--font-size-2xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
                  Member since
                </dt>
                <dd className="mt-1 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)]">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
