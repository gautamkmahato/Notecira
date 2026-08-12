"use client";

import { displayTitle, useDocumentStore } from "@/lib/document-store";

type TopbarProps = {
  path: string[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSelectPathIndex: (index: number) => void;
  onCreateDocument: () => void;
};

export function Topbar({
  path,
  sidebarOpen,
  onToggleSidebar,
  onSelectPathIndex,
  onCreateDocument,
}: TopbarProps) {
  const { getDocument } = useDocumentStore();
  const activeId = path[path.length - 1];
  const activeDoc = activeId ? getDocument(activeId) : undefined;

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/75 px-3 backdrop-blur-sm sm:px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        ☰
      </button>

      <nav
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm"
        aria-label="Breadcrumb"
      >
        {path.map((docId, index) => {
          const doc = getDocument(docId);
          const label = displayTitle(doc?.title ?? "Untitled");
          const isLast = index === path.length - 1;

          return (
            <div key={`${docId}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <span className="shrink-0 text-slate-300">/</span>
              ) : null}
              {isLast ? (
                <span className="truncate font-medium text-slate-900">
                  {label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPathIndex(index)}
                  className="truncate text-slate-500 transition hover:text-teal-700"
                >
                  {label}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      <div className="hidden items-center gap-3 sm:flex">
        <p className="text-xs text-slate-400">
          {activeDoc ? "Saved locally" : ""}
        </p>
        <button
          type="button"
          onClick={onCreateDocument}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          New document
        </button>
      </div>
    </header>
  );
}
