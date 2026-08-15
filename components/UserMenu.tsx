"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import {
  userInitial,
  type SessionUser,
} from "@/lib/auth/session-user";

export function UserMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user as SessionUser);
      })
      .catch(() => {});
  }, []);

  const initial = user ? userInitial(user) : "?";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--color-dark-gray-2)] text-[var(--font-size-sm)] font-medium text-[var(--color-white)]"
        aria-label="Account menu"
        title={user?.email ?? "Account"}
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initial
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[var(--z-10)]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-[var(--z-14)] mt-2 w-48 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] py-1 shadow-[var(--shadow-md)]">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] hover:bg-[var(--notion-hover)]"
            >
              <User size={16} />
              Profile
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/signout", {
                  method: "POST",
                  credentials: "include",
                });
                window.location.assign("/sign-in");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] hover:bg-[var(--notion-hover)]"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
