"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  FileText,
  Folder,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ListPageHeader } from "@/components/app/ListPageHeader";
import { displayTitle, useDocumentStore } from "@/lib/document-store";
import { scrollbarCustom } from "@/lib/ui/notion";
import { formatRelativeTime } from "@/lib/utils/relative-time";

type SortMode = "deleted" | "name";

function formatDeletedAt(iso: string | null): string {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function TrashRowMenu({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] text-[var(--color-mid-gray)] transition hover:bg-[var(--notion-hover)]"
        aria-label={`More options for ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-10 mt-1 min-w-[9rem] rounded-xl border border-[var(--color-light-gray-2)] bg-[var(--color-white)] py-1 shadow-[var(--shadow-md)]"
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-[var(--font-size-sm)] hover:bg-[var(--notion-hover)]"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export function TrashView() {
  const {
    trashedDocuments,
    hydrated,
    restoreDocument,
    permanentlyDeleteDocument,
  } = useDocumentStore();

  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("deleted");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = trashedDocuments;
    if (q) {
      list = list.filter(({ document, parentTitle }) => {
        const title = displayTitle(document.title).toLowerCase();
        const parent = parentTitle?.toLowerCase() ?? "";
        return title.includes(q) || parent.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      if (sortMode === "name") {
        return displayTitle(a.document.title).localeCompare(
          displayTitle(b.document.title),
          undefined,
          { sensitivity: "base" },
        );
      }
      const at = a.document.deletedAt
        ? new Date(a.document.deletedAt).getTime()
        : 0;
      const bt = b.document.deletedAt
        ? new Date(b.document.deletedAt).getTime()
        : 0;
      return bt - at;
    });
  }, [trashedDocuments, search, sortMode]);

  const sortLabel =
    sortMode === "deleted" ? "Sort: Deleted date" : "Sort: Name";

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#fafafa] text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
        Loading trash…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#fafafa]">
      <ListPageHeader
        icon={Trash2}
        title="Trash"
        description="Deleted documents and sub-documents. Restore or delete permanently."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search trash…"
        sortLabel={sortLabel}
        onSortClick={() =>
          setSortMode((m) => (m === "deleted" ? "name" : "deleted"))
        }
      />

      <div className={`${scrollbarCustom} min-h-0 flex-1 overflow-y-auto px-6 py-6`}>
        {filtered.length === 0 ? (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            {trashedDocuments.length === 0
              ? "Trash is empty."
              : "No items match your search."}
          </p>
        ) : (
          <div
            className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-light-gray-2)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]"
          >
            <ul className="divide-y divide-[var(--color-light-gray-2)]">
              {filtered.map(({ document, parentTitle }) => {
                const title = displayTitle(document.title);
                const deletedAt = document.deletedAt;
                const pathLabel = parentTitle
                  ? `Sub-document of “${parentTitle}”`
                  : "Root document";

                return (
                  <li
                    key={document.id}
                    className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f4f5] text-[var(--color-mid-gray)]"
                        aria-hidden
                      >
                        {parentTitle ? (
                          <FileText className="h-5 w-5" strokeWidth={1.5} />
                        ) : (
                          <Folder className="h-5 w-5" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[var(--font-size-sm)] font-semibold text-[var(--color-dark-gray-2)]">
                          {title}
                        </p>
                        <p className="mt-0.5 truncate text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
                          {pathLabel} • Deleted •{" "}
                          {formatDeletedAt(deletedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[var(--font-size-xs)] text-[var(--color-mid-gray)]"
                      >
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {deletedAt
                          ? formatRelativeTime(deletedAt)
                          : "Unknown"}
                      </span>
                      <button
                        type="button"
                        onClick={() => restoreDocument(document.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-4 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] transition hover:bg-[var(--notion-hover)]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Permanently delete “${title}”? This cannot be undone.`,
                            )
                          ) {
                            permanentlyDeleteDocument(document.id);
                          }
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#fecaca] bg-[#fef2f2] px-4 text-[var(--font-size-sm)] font-medium text-[#b91c1c] transition hover:bg-[#fee2e2]"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete forever
                      </button>
                      <TrashRowMenu title={title} />
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
