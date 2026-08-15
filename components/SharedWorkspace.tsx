"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SharedDocumentPayload } from "@/lib/domain/sharing";
import { displayTitle } from "@/lib/domain/helpers";
import {
  FIXED_COLUMN_WIDTH_PX,
  isScrollColumnLayout,
} from "@/lib/layout";
import { SharedDocumentColumn } from "@/components/SharedDocumentColumn";
import { CanvasScrollControls } from "@/components/CanvasScrollControls";

type SharedWorkspaceProps = {
  payload: SharedDocumentPayload;
};

export function SharedWorkspace({ payload }: SharedWorkspaceProps) {
  const [path, setPath] = useState<string[]>([payload.rootDocumentId]);
  const [columnWidths] = useState<Record<number, number>>({});
  const scrollBoardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPath((prev) => {
      const root = payload.rootDocumentId;
      if (prev.length === 0) return [root];

      const stillValid = prev.every((id) => Boolean(payload.documents[id]));
      if (!stillValid) return [root];

      for (let i = 1; i < prev.length; i++) {
        const doc = payload.documents[prev[i]];
        if (!doc) return prev.slice(0, i);
        const parentBlockId = doc.parentBlockId;
        if (!parentBlockId) return prev.slice(0, i);
        const parentBlock = payload.blocks[parentBlockId];
        if (!parentBlock || parentBlock.documentId !== prev[i - 1]) {
          return prev.slice(0, i);
        }
        if (parentBlock.linkedDocumentId !== prev[i]) {
          return prev.slice(0, i);
        }
      }

      return prev;
    });
  }, [payload]);

  const columnCount = path.length;
  const scrollLayout = isScrollColumnLayout(columnCount);

  useEffect(() => {
    if (!scrollLayout || !scrollBoardRef.current) return;
    const board = scrollBoardRef.current;
    board.scrollTo({ left: board.scrollWidth, behavior: "smooth" });
  }, [scrollLayout, columnCount]);

  const openLinked = useCallback((fromColumnIndex: number, docId: string) => {
    if (!payload.documents[docId]) return;
    setPath((prev) => prev.slice(0, fromColumnIndex + 1).concat(docId));
  }, [payload.documents]);

  const closeFrom = useCallback((columnIndex: number) => {
    setPath((prev) => prev.slice(0, Math.max(1, columnIndex)));
  }, []);

  const selectPathIndex = useCallback((index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  }, []);

  const layout = scrollLayout ? "fixed" : "equal";

  return (
    <div className="flex h-screen flex-col bg-[var(--color-white)]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-mid-gray-6)] px-3 sm:px-4">
        <span className="shrink-0 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
          Shared document
        </span>

        <nav
          className="scrollbar-custom flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[var(--font-size-lg)]"
          aria-label="Breadcrumb"
        >
          {path.map((docId, index) => {
            const doc = payload.documents[docId];
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
                    onClick={() => selectPathIndex(index)}
                    className="truncate text-[var(--color-mid-gray)] transition-colors hover:text-[var(--color-blue)]"
                  >
                    {label}
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <CanvasScrollControls
          scrollRef={scrollBoardRef}
          enabled={columnCount > 1}
        />
        <div
          ref={scrollBoardRef}
          className="scrollbar-custom h-full overflow-x-auto overflow-y-hidden bg-[var(--color-white)]"
        >
          {scrollLayout ? (
            <div className="flex h-full min-h-0 w-max gap-4 ml-4 mt-8">
              {path.map((docId, index) => (
                <SharedDocumentColumn
                  key={`${docId}-${index}`}
                  payload={payload}
                  docId={docId}
                  columnIndex={index}
                  columnCount={columnCount}
                  layout={layout}
                  widthPx={columnWidths[index] ?? FIXED_COLUMN_WIDTH_PX}
                  isLast={index === path.length - 1}
                  openLinkedDocId={path[index + 1]}
                  onOpenLinked={openLinked}
                  onCloseFrom={closeFrom}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full justify-center px-3 py-3 sm:px-5 mt-8">
              <div
                className="flex h-full min-h-0 gap-4"
                style={{
                  width:
                    columnCount === 1 ? "min(820px, 100%)" : "min(100%, 1400px)",
                  maxWidth: "100%",
                }}
              >
                {path.map((docId, index) => (
                  <SharedDocumentColumn
                    key={`${docId}-${index}`}
                    payload={payload}
                    docId={docId}
                    columnIndex={index}
                    columnCount={columnCount}
                    layout={layout}
                    widthPx={columnWidths[index]}
                    isLast={index === path.length - 1}
                    openLinkedDocId={path[index + 1]}
                    onOpenLinked={openLinked}
                    onCloseFrom={closeFrom}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
