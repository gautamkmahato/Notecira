"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  FileText,
  FolderOpen,
  Layers,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
} from "lucide-react";
import { fetchWithSessionRefresh } from "@/lib/auth/client-fetch";
import type { SessionUser } from "@/lib/auth/session-user";
import type { DashboardSummary } from "@/lib/domain/dashboard";
import { normalizeDashboardSummary } from "@/lib/dashboard/normalize-summary";
import { notionBtnPrimary, notionBtnSecondary } from "@/lib/ui/notion";
import { DashboardDocumentsSection } from "./DashboardDocumentsSection";
import { dashboardCardClass } from "./dashboard-tokens";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: DashboardSummary; user: SessionUser | null };

function greetingName(user: SessionUser | null): string {
  const name = user?.name?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  if (user?.email) return user.email.split("@")[0] ?? "there";
  return "there";
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
}) {
  return (
    <div className={`${dashboardCardClass} flex h-full flex-col p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[var(--font-size-xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-dark-gray-2)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--notion-hover)] text-[var(--color-dark-gray-2)]"
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function UsageStatCard({
  used,
  limit,
  atLimit,
  trashed,
}: {
  used: number;
  limit: number | null;
  atLimit: boolean;
  trashed: number;
}) {
  return (
    <div className={`${dashboardCardClass} flex h-full flex-col p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--font-size-xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
            Hosted usage
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-dark-gray-2)]">
            {used}
            <span className="text-lg font-medium text-[var(--color-mid-gray)]">
              {limit === null ? "" : ` / ${limit}`}
            </span>
          </p>
          {atLimit && (
            <p className="mt-0.5 text-[var(--font-size-2xs)] font-medium text-[var(--color-dark-gray-2)]">
              Limit reached
            </p>
          )}
        </div>
        <Link
          href="/trash"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--notion-hover)] text-[var(--color-dark-gray-2)] transition hover:bg-[var(--color-light-gray-2)]"
          aria-label={`Trash${trashed > 0 ? `, ${trashed} items` : ""}`}
          title="Trash"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
      {limit !== null && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--notion-hover)]"
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-label="Document usage"
        >
          <div
            className="h-full rounded-full bg-[var(--color-dark-gray-2)] transition-[width]"
            style={{
              width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

async function loadDashboard(): Promise<{
  summary: DashboardSummary;
  user: SessionUser | null;
}> {
  const [summaryRes, sessionRes] = await Promise.all([
    fetchWithSessionRefresh("/api/dashboard", { credentials: "include" }),
    fetchWithSessionRefresh("/api/auth/session", { credentials: "include" }),
  ]);

  if (!summaryRes.ok) {
    const body = (await summaryRes.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Could not load dashboard (${summaryRes.status})`);
  }

  const summary = normalizeDashboardSummary(
    (await summaryRes.json()) as DashboardSummary,
  );
  let user: SessionUser | null = null;
  if (sessionRes.ok) {
    const sessionBody = (await sessionRes.json()) as { user?: SessionUser };
    user = sessionBody.user ?? null;
  }

  return { summary, user };
}

export function DashboardView() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const refresh = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await loadDashboard();
      setState({ status: "ready", ...data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ready = state.status === "ready" ? state : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="border-b border-[var(--color-light-gray-2)] bg-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[var(--font-size-xl)] font-medium tracking-tight text-[var(--color-dark-gray-2)]">
              {ready
                ? `Welcome back, ${greetingName(ready.user)}`
                : "Dashboard"}
            </h1>
            <p className="mt-1 max-w-xl text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
              Overview, usage, and all your pages in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/documents"
              className={`${notionBtnPrimary} inline-flex items-center gap-2`}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Workspace
            </Link>
            <button
              type="button"
              onClick={() => void refresh()}
              className={`${notionBtnSecondary} inline-flex items-center gap-2`}
              disabled={state.status === "loading"}
            >
              <RefreshCw
                className={`h-4 w-4 ${state.status === "loading" ? "animate-spin" : ""}`}
                aria-hidden
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6">
        {state.status === "loading" && (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            Loading dashboard…
          </p>
        )}

        {state.status === "error" && (
          <div
            className={`${dashboardCardClass} flex max-w-lg items-start gap-3 p-4`}
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-mid-gray)]" />
            <div>
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)]">
                Couldn&apos;t load dashboard
              </p>
              <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
                {state.message}
              </p>
              <button
                type="button"
                className={`${notionBtnSecondary} mt-3`}
                onClick={() => void refresh()}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {ready && (
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <section aria-labelledby="dashboard-stats">
              <h2 id="dashboard-stats" className="sr-only">
                Workspace stats
              </h2>
              <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="Documents"
                  value={ready.summary.counts.documents}
                  icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
                />
                <StatCard
                  label="Folders"
                  value={ready.summary.counts.folders}
                  icon={<FolderOpen className="h-4 w-4" strokeWidth={1.75} />}
                />
                <StatCard
                  label="Blocks"
                  value={ready.summary.counts.blocks}
                  icon={<Layers className="h-4 w-4" strokeWidth={1.75} />}
                />
                <StatCard
                  label="Shared"
                  value={ready.summary.counts.shared}
                  icon={<Share2 className="h-4 w-4" strokeWidth={1.75} />}
                />
                <UsageStatCard
                  used={ready.summary.usage.documentsUsed}
                  limit={ready.summary.usage.documentLimit}
                  atLimit={ready.summary.usage.atLimit}
                  trashed={ready.summary.counts.trashed}
                />
              </div>
            </section>

            <DashboardDocumentsSection
              documents={ready.summary.documents}
              totalCount={ready.summary.counts.documents}
              user={ready.user}
            />
          </div>
        )}
      </div>
    </div>
  );
}
