"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  LogOut,
  Mail,
  MoreHorizontal,
  Settings,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import { fetchWithSessionRefresh } from "@/lib/auth/client-fetch";
import {
  userDisplayName,
  type SessionUser,
} from "@/lib/auth/session-user";
import { ListPageHeader } from "@/components/app/ListPageHeader";
import { scrollbarCustom } from "@/lib/ui/notion";
import { formatRelativeTime } from "@/lib/utils/relative-time";

type SortMode = "name" | "category";

type SettingRow = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  detailLine: string;
  timeLabel: string;
  timeIso: string | null;
  icon: LucideIcon;
  primary?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant: "default" | "danger";
    icon?: LucideIcon;
  };
};

function formatJoined(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function RowMenu({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] text-[var(--color-mid-gray)] transition hover:bg-[var(--notion-hover)] hover:text-[var(--color-dark-gray-2)]"
        aria-label={`More options for ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-10 mt-1 min-w-[9rem] rounded-xl border border-[var(--color-light-gray-2)] bg-[var(--color-white)] py-1 shadow-[var(--shadow-md)]"
          role="menu"
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] hover:bg-[var(--notion-hover)]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function buildRows(user: SessionUser | null): SettingRow[] {
  if (!user) return [];

  const providers =
    user.providers.length > 0
      ? user.providers
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(", ")
      : "Email";

  return [
    {
      id: "profile",
      category: "Account",
      title: userDisplayName(user),
      subtitle: "Profile & display name",
      detailLine: `Account • ${user.email}`,
      timeLabel: user.createdAt
        ? formatRelativeTime(user.createdAt)
        : "Member",
      timeIso: user.createdAt,
      icon: User,
      primary: {
        label: "View profile",
        href: "/profile",
        variant: "default",
      },
    },
    {
      id: "email",
      category: "Security",
      title: "Email & sign-in",
      subtitle: user.email,
      detailLine: `${providers} • ${user.emailVerified ? "Verified" : "Not verified"}`,
      timeLabel: user.emailVerified ? "Verified" : "Pending",
      timeIso: null,
      icon: Mail,
      primary: {
        label: "Manage",
        href: "/profile",
        variant: "default",
      },
    },
    {
      id: "security",
      category: "Security",
      title: "Session & device",
      subtitle: "Active on this browser",
      detailLine: "Security • Sign out when you’re done on shared devices",
      timeLabel: "Now",
      timeIso: null,
      icon: Shield,
    },
    {
      id: "signout",
      category: "Account",
      title: "Sign out",
      subtitle: "End session on this device",
      detailLine: "Account • You can sign back in anytime",
      timeLabel: "—",
      timeIso: null,
      icon: LogOut,
      primary: {
        label: "Sign out",
        variant: "danger",
        icon: LogOut,
        onClick: async () => {
          await fetch("/api/auth/signout", {
            method: "POST",
            credentials: "include",
          });
          window.location.assign("/sign-in");
        },
      },
    },
  ];
}

export function SettingsView() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("category");

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithSessionRefresh("/api/auth/session", {
        credentials: "include",
      });
      const body = (await res.json()) as { user?: SessionUser; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to load settings");
      setUser(body.user ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const rows = useMemo(() => buildRows(user), [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (row) =>
          row.title.toLowerCase().includes(q) ||
          row.subtitle.toLowerCase().includes(q) ||
          row.detailLine.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sortMode === "name") {
        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      }
      return (
        a.category.localeCompare(b.category, undefined, { sensitivity: "base" }) ||
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );
    });
  }, [rows, search, sortMode]);

  const sortLabel =
    sortMode === "category" ? "Sort: Category" : "Sort: Name";

  const cycleSort = () => {
    setSortMode((mode) => (mode === "category" ? "name" : "category"));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#fafafa]">
      <ListPageHeader
        icon={Settings}
        title="Settings"
        description="Manage your account, security, and preferences for this workspace."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search settings…"
        sortLabel={sortLabel}
        onSortClick={cycleSort}
      />

      <div className={`${scrollbarCustom} min-h-0 flex-1 overflow-y-auto px-6 py-6`}>
        {loading && (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Loading settings…
          </p>
        )}

        {error && (
          <div
            className="max-w-3xl rounded-2xl border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-4 py-3 text-[var(--font-size-sm)] text-[var(--notion-danger)]"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            {rows.length === 0
              ? "Sign in to manage settings."
              : "No settings match your search."}
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div
            className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-light-gray-2)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]"
          >
            <ul className="divide-y divide-[var(--color-light-gray-2)]">
              {filtered.map((row) => {
                const Icon = row.icon;
                const PrimaryIcon = row.primary?.icon;

                return (
                  <li
                    key={row.id}
                    className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f4f5] text-[var(--color-mid-gray)]"
                        aria-hidden
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[var(--font-size-sm)] font-semibold text-[var(--color-dark-gray-2)]">
                          {row.title}
                        </p>
                        <p className="mt-0.5 truncate text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
                          {row.detailLine}
                          {row.timeIso ? ` • ${formatJoined(row.timeIso)}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[var(--font-size-xs)] text-[var(--color-mid-gray)]"
                      >
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {row.timeLabel}
                      </span>

                      {row.primary &&
                        (row.primary.href ? (
                          <Link
                            href={row.primary.href}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-4 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] transition hover:bg-[var(--notion-hover)]"
                          >
                            {PrimaryIcon && (
                              <PrimaryIcon className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {row.primary.label}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void row.primary?.onClick?.()}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[var(--font-size-sm)] font-medium transition ${
                              row.primary.variant === "danger"
                                ? "border border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2]"
                                : "border border-[var(--color-light-gray-2)] bg-[var(--color-white)] text-[var(--color-dark-gray-2)] hover:bg-[var(--notion-hover)]"
                            }`}
                          >
                            {PrimaryIcon && (
                              <PrimaryIcon className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {row.primary.label}
                          </button>
                        ))}

                      <RowMenu label={row.title} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
