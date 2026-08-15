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
      <div className="flex flex-1 items-center justify-center text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
        Loading trash…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="bg-[var(--color-white)] px-6 py-5 shadow-[var(--shadow-lg)]">
        <h1 className="text-[var(--font-size-xl)] font-medium tracking-tight text-[var(--color-dark-gray-2)]">
          Trash
        </h1>
        <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
          Deleted documents and sub-documents. Restore or delete permanently.
        </p>
      </header>

      <div className="scrollbar-custom min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {trashedDocuments.length === 0 ? (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">Trash is empty.</p>
        ) : (
          <ul className="flex max-w-3xl flex-col gap-2">
            {trashedDocuments.map(({ document, parentTitle }) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-xl)] bg-[var(--color-white)] px-4 py-3 shadow-[var(--shadow-sm)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--color-dark-gray-2)]">
                    {displayTitle(document.title)}
                  </p>
                  <p className="mt-0.5 text-[var(--font-size-2xs)] text-[var(--color-mid-gray)]">
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
                    className="notion-btn"
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
                    className="notion-btn text-[var(--notion-danger)] hover:bg-[var(--notion-danger-bg)]"
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
