"use client";

import { useState } from "react";
import { Menu, Share2 } from "lucide-react";
import { displayTitle, useDocumentStore } from "@/lib/document-store";
import { ShareDocumentModal } from "@/components/ShareDocumentModal";
import { UserMenu } from "@/components/UserMenu";

type TopbarProps = {
  path: string[];
  activeDocId: string | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSelectPathIndex: (index: number) => void;
};

export function Topbar({
  path,
  activeDocId,
  sidebarOpen,
  onToggleSidebar,
  onSelectPathIndex,
}: TopbarProps) {
  const { getDocument } = useDocumentStore();
  const [shareOpen, setShareOpen] = useState(false);
  const shareDocId = path[0] ?? activeDocId;
  const shareDoc = shareDocId ? getDocument(shareDocId) : undefined;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-mid-gray-6)] bg-[var(--color-white)] px-3 sm:px-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="notion-icon-btn"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        <nav
          className="scrollbar-custom flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[var(--font-size-lg)]"
          aria-label="Breadcrumb"
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
                {isLast ? (
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

        <div className="flex items-center gap-2">
          {shareDoc ? (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="notion-btn inline-flex items-center gap-2"
              title="Share document"
            >
              <Share2 size={16} strokeWidth={1.75} />
              <span className="hidden sm:inline">Share</span>
            </button>
          ) : null}
          <UserMenu />
        </div>
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
