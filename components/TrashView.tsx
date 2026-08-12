"use client";

import { displayTitle, useDocumentStore } from "@/lib/document-store";

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

export function TrashView() {
  const {
    trashedDocuments,
    hydrated,
    restoreDocument,
    permanentlyDeleteDocument,
  } = useDocumentStore();

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        Loading trash…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-slate-200/80 bg-white/75 px-6 py-5 backdrop-blur-sm">
        <h1 className="font-serif text-2xl tracking-tight text-slate-900">
          Trash
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Deleted documents and sub-documents. Restore or delete permanently.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {trashedDocuments.length === 0 ? (
          <p className="text-sm text-slate-500">Trash is empty.</p>
        ) : (
          <ul className="flex max-w-3xl flex-col gap-2">
            {trashedDocuments.map(({ document, parentTitle }) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/90 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {displayTitle(document.title)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {parentTitle
                      ? `Sub-document of “${parentTitle}”`
                      : "Root document"}
                    {" · "}
                    Deleted {formatDeletedAt(document.deletedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => restoreDocument(document.id)}
                    className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Permanently delete “${displayTitle(document.title)}”? This cannot be undone.`,
                        )
                      ) {
                        permanentlyDeleteDocument(document.id);
                      }
                    }}
                    className="rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Delete forever
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
