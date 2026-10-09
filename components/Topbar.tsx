"use client";

import { notionIconBtn, notionBtn } from "@/lib/ui/notion";


import { useState, type ReactNode } from "react";
import { Check, Menu, Pencil, Share2 } from "lucide-react";
import { displayTitle, useDocumentStore } from "@/lib/document-store";
import { ShareDocumentModal } from "@/components/ShareDocumentModal";
import { DocumentTitleInput } from "@/components/DocumentTitleInput";

type TopbarProps = {
  path: string[];
  activeDocId: string | null;
  sidebarOpen: boolean;
  isDocumentEditing: boolean;
  onToggleDocumentEditing: () => void;
  onToggleSidebar: () => void;
  onSelectPathIndex: (index: number) => void;
  centerToolbar?: ReactNode;
  subToolbar?: ReactNode;
};

export function Topbar({
  path,
  activeDocId,
  sidebarOpen,
  isDocumentEditing,
  onToggleDocumentEditing,
  onToggleSidebar,
  onSelectPathIndex,
  centerToolbar,
  subToolbar,
}: TopbarProps) {
  const { getDocument } = useDocumentStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const shareDocId = path[0] ?? activeDocId;
  const shareDoc = shareDocId ? getDocument(shareDocId) : undefined;

  return (
    <>
      <header
        className="relative z-[var(--z-10)] shrink-0 overflow-visible border-b border-[var(--color-mid-gray-6)] bg-[var(--color-white)]"
        data-workspace-topbar
      >
        <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`${notionIconBtn} shrink-0`}
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>

            <nav
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[var(--font-size-lg)]"
              aria-label="Document"
            >
              {path.map((docId, index) => {
                const doc = getDocument(docId);
                const label = displayTitle(doc?.title ?? "Untitled");
                const isLast = index === path.length - 1;

                return (
                  <div
                    key={`${docId}-${index}`}
                    className="flex min-w-0 items-center gap-1"
                  >
                    {index > 0 ? (
                      <span className="shrink-0 text-[var(--color-light-gray)]">
                        /
                      </span>
                    ) : null}
                    {isLast && activeDocId === docId ? (
                      <div
                        className="min-w-0 flex-1"
                        onMouseDown={(event) => {
                          if (!titleEditing) {
                            event.preventDefault();
                            setTitleEditing(true);
                          }
                        }}
                        role="presentation"
                      >
                        <DocumentTitleInput
                          docId={docId}
                          readOnly={!titleEditing}
                          autoFocus={titleEditing}
                          onRenameDone={() => setTitleEditing(false)}
                          className={`w-full min-w-0 truncate bg-transparent font-medium leading-tight text-[var(--color-dark-gray-2)] outline-none placeholder:text-[var(--color-mid-gray)] ${
                            titleEditing
                              ? "cursor-text"
                              : "cursor-pointer read-only:cursor-pointer"
                          }`}
                        />
                      </div>
                    ) : isLast ? (
                      <span className="truncate font-medium text-[var(--color-dark-gray-2)]">
                        {label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectPathIndex(index)}
                        className="truncate text-[var(--color-mid-gray)] transition-colors hover:text-[var(--color-blue)]"
                      >
                        {label}
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="flex max-w-[min(100vw-24rem,56rem)] min-w-0 justify-center overflow-visible px-1">
            {centerToolbar}
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            {activeDocId ? (
              <button
                type="button"
                onClick={onToggleDocumentEditing}
                className={`${notionIconBtn} ${
                  isDocumentEditing
                    ? "bg-[var(--color-dark-gray-2)] text-[var(--color-white)] hover:bg-[var(--color-dark-gray-3)]"
                    : ""
                }`}
                title={
                  isDocumentEditing
                    ? "Done editing"
                    : "Edit document"
                }
                aria-label={
                  isDocumentEditing ? "Done editing" : "Edit document"
                }
              >
                {isDocumentEditing ? (
                  <Check size={16} strokeWidth={1.75} />
                ) : (
                  <Pencil size={16} strokeWidth={1.75} />
                )}
              </button>
            ) : null}

            {shareDoc ? (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className={`${notionBtn} inline-flex items-center gap-2`}
                title="Share document"
              >
                <Share2 size={16} strokeWidth={1.75} />
                <span className="hidden sm:inline">Share</span>
              </button>
            ) : null}
          </div>
        </div>

        {subToolbar ? (
          <div className="border-t border-[var(--color-light-gray-2)] bg-[var(--color-white)]">
            {subToolbar}
          </div>
        ) : null}
      </header>

      {shareDoc && shareDocId ? (
        <ShareDocumentModal
          documentId={shareDocId}
          documentTitle={displayTitle(shareDoc.title)}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </>
  );
}
