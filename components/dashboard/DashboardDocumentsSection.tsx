"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Search } from "lucide-react";
import { CanvasPanelSelect } from "@/components/canvas-block/CanvasPanelSelect";
import type { DashboardDocument } from "@/lib/domain/dashboard";
import type { SessionUser } from "@/lib/auth/session-user";
import {
  DOCUMENT_FILTERS,
  type DocumentFilterId,
  type DocumentSortId,
  filterDashboardDocuments,
} from "@/lib/dashboard/document-filters";
import { notionBtnPrimary } from "@/lib/ui/notion";
import { dashboardCardClass } from "./dashboard-tokens";
import { DocumentGridCard } from "./DocumentGridCard";
import { DocumentListRow } from "./DocumentListRow";

const VIEW_STORAGE_KEY = "branch-dashboard-doc-view";

const SORT_OPTIONS: { value: DocumentSortId; label: string }[] = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "title", label: "Title" },
];

type ViewMode = "grid" | "list";

function readStoredView(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
  return stored === "list" ? "list" : "grid";
}

type DashboardDocumentsSectionProps = {
  documents: DashboardDocument[];
  totalCount: number;
  user: SessionUser | null;
};

export function DashboardDocumentsSection({
  documents,
  totalCount,
  user,
}: DashboardDocumentsSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DocumentFilterId>("all");
  const [sort, setSort] = useState<DocumentSortId>("updated");
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    setView(readStoredView());
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setView(mode);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const safeDocuments = Array.isArray(documents) ? documents : [];

  const filtered = useMemo(
    () => filterDashboardDocuments(safeDocuments, { search, filter, sort }),
    [safeDocuments, search, filter, sort],
  );

  const cappedTotal = safeDocuments.length < totalCount;

  return (
    <section
      aria-labelledby="dashboard-documents-heading"
      className={`${dashboardCardClass} p-4 sm:p-5`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="dashboard-documents-heading"
            className="text-[var(--font-size-sm)] font-semibold text-[var(--color-dark-gray-2)]"
          >
            Your documents
          </h2>
          <p className="mt-0.5 text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
            {totalCount === 0
              ? "Create a page in the workspace to see it here."
              : `Showing ${filtered.length} of ${safeDocuments.length}${cappedTotal ? ` (latest ${safeDocuments.length} of ${totalCount})` : ""}`}
          </p>
        </div>
        <div className="flex rounded-2xl border border-[var(--color-light-gray-2)] bg-white p-0.5">
          <button
            type="button"
            className={`flex h-8 w-8 items-center justify-center rounded-[14px] transition ${
              view === "grid"
                ? "bg-[var(--color-dark-gray-2)] text-white"
                : "text-[var(--color-mid-gray)] hover:bg-[var(--notion-hover)]"
            }`}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`flex h-8 w-8 items-center justify-center rounded-[14px] transition ${
              view === "list"
                ? "bg-[var(--color-dark-gray-2)] text-white"
                : "text-[var(--color-mid-gray)] hover:bg-[var(--notion-hover)]"
            }`}
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-mid-gray)]"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, folder, or tag…"
            className="h-10 w-full rounded-full border border-[var(--color-light-gray-2)] bg-white py-2 pl-10 pr-4 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] outline-none ring-[var(--color-dark-gray-2)] placeholder:text-[var(--color-mid-gray)] focus:ring-2"
          />
        </label>
        <CanvasPanelSelect
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
          ariaLabel="Sort documents"
          className="w-full shrink-0 sm:w-[11rem]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {DOCUMENT_FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-[var(--font-size-xs)] font-medium transition ${
                active
                  ? "bg-[var(--color-dark-gray-2)] text-white"
                  : "border border-[var(--color-light-gray-2)] bg-white text-[var(--color-mid-gray)] hover:border-[var(--color-mid-gray)] hover:text-[var(--color-dark-gray-2)]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {totalCount === 0 ? (
          <div
            className={`${dashboardCardClass} border-dashed px-5 py-12 text-center`}
          >
            <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
              No documents yet.
            </p>
            <Link href="/documents" className={`${notionBtnPrimary} mt-4 inline-flex`}>
              Create your first page
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`${dashboardCardClass} border-dashed px-5 py-10 text-center`}
          >
            <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
              No documents match your search or filters.
            </p>
            <button
              type="button"
              className="mt-3 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] underline-offset-2 hover:underline"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : view === "grid" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((doc) => (
              <li key={doc.id}>
                <DocumentGridCard doc={doc} user={user} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((doc) => (
              <li key={doc.id}>
                <DocumentListRow doc={doc} user={user} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
