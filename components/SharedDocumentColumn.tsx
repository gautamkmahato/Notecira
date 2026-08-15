"use client";

import type { CSSProperties } from "react";
import { X } from "lucide-react";
import type { SharedDocumentPayload } from "@/lib/domain/sharing";
import {
  FIXED_COLUMN_WIDTH_PX,
  SOLO_COLUMN_MAX_WIDTH_PX,
} from "@/lib/layout";
import { displayTitle } from "@/lib/domain/helpers";
import { SharedBlockList } from "@/components/SharedDocumentView";

type SharedDocumentColumnProps = {
  payload: SharedDocumentPayload;
  docId: string;
  columnIndex: number;
  columnCount: number;
  layout: "equal" | "fixed";
  widthPx?: number;
  isLast: boolean;
  openLinkedDocId?: string;
  onOpenLinked: (columnIndex: number, docId: string) => void;
  onCloseFrom: (columnIndex: number) => void;
};

export function SharedDocumentColumn({
  payload,
  docId,
  columnIndex,
  columnCount,
  layout,
  widthPx,
  isLast,
  openLinkedDocId,
  onOpenLinked,
  onCloseFrom,
}: SharedDocumentColumnProps) {
  const doc = payload.documents[docId];
  const isSolo = columnCount === 1 && layout === "equal";
  const isFixed = layout === "fixed";
  const titleSizeClass = columnCount === 1 ? "text-[32px]" : "text-[22px]";
  const contentPad = columnCount > 1 ? "px-8" : "px-14";

  if (!doc) {
    return (
      <section
        className={`relative flex h-full flex-col bg-[var(--color-white)] px-4 py-5 ${
          isFixed ? "shrink-0" : "min-w-0 flex-1"
        }`}
        style={columnStyle(layout, columnCount, widthPx, isSolo)}
      >
        <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
          This document is missing.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`relative flex h-full flex-col overflow-visible bg-[var(--color-white)] transition-[flex-basis,box-shadow,width] duration-[var(--duration-duration-7)] ease-[var(--easing-ease-out)] ${
        isFixed ? "shrink-0" : "min-w-[260px] flex-1"
      } border border-[var(--color-mid-gray-6)] rounded-[var(--radius-2xl)]`}
      style={columnStyle(layout, columnCount, widthPx, isSolo)}
    >
      <header className={`flex items-start gap-2 py-3 ${contentPad}`}>
        <h1
          className={`min-w-0 flex-1 bg-transparent font-bold leading-[1.2] tracking-tight text-[var(--color-dark-gray-2)] ${titleSizeClass}`}
        >
          {displayTitle(doc.title || "Untitled")}
        </h1>

        {columnIndex > 0 ? (
          <div className="mt-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onCloseFrom(columnIndex)}
              className="notion-icon-btn"
              aria-label="Close this and deeper documents"
              title="Close"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </header>

      <div className={`flex min-h-0 flex-1 flex-col overflow-visible ${contentPad} pb-8`}>
        <SharedBlockList
          payload={payload}
          documentId={docId}
          columnIndex={columnIndex}
          openLinkedDocId={openLinkedDocId}
          onOpenLinked={onOpenLinked}
        />
      </div>
    </section>
  );
}

function columnStyle(
  layout: "equal" | "fixed",
  columnCount: number,
  widthPx: number | undefined,
  isSolo: boolean,
): CSSProperties | undefined {
  if (isSolo) {
    return {
      width: "100%",
      maxWidth: SOLO_COLUMN_MAX_WIDTH_PX,
    };
  }

  if (layout === "fixed") {
    const width = widthPx ?? FIXED_COLUMN_WIDTH_PX;
    return { width, minWidth: width };
  }

  if (widthPx) {
    return { flex: `0 0 ${widthPx}px`, width: widthPx, minWidth: widthPx };
  }

  return { flexBasis: `${100 / columnCount}%` };
}
