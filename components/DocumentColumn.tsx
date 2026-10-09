"use client";

import { notionIconBtn } from "@/lib/ui/notion";


import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useDocumentStore } from "@/lib/document-store";
import {
  FIXED_COLUMN_WIDTH_PX,
  clampColumnWidth,
} from "@/lib/layout";
import { BlockEditor } from "./BlockEditor";

type DocumentColumnProps = {
  docId: string;
  columnIndex: number;
  columnCount: number;
  layout: "equal" | "fixed" | "focus";
  widthPx?: number;
  isLast: boolean;
  isFocused: boolean;
  canFocus: boolean;
  editable: boolean;
  openLinkedDocId?: string;
  onOpenLinked: (columnIndex: number, docId: string) => void;
  onCloseFrom: (columnIndex: number) => void;
  onEnterFocus: (docId: string) => void;
  onExitFocus: () => void;
  onResizeWidth?: (columnIndex: number, widthPx: number) => void;
};

export function DocumentColumn({
  docId,
  columnIndex,
  columnCount,
  layout,
  widthPx,
  isLast,
  isFocused,
  canFocus,
  editable,
  openLinkedDocId,
  onOpenLinked,
  onCloseFrom,
  onEnterFocus,
  onExitFocus,
  onResizeWidth,
}: DocumentColumnProps) {
  const { getDocument } = useDocumentStore();
  const document = getDocument(docId);
  const isSolo = layout === "focus" || (columnCount === 1 && layout === "equal");
  const isFixed = layout === "fixed";
  const canResize =
    Boolean(onResizeWidth) && !isFocused && columnCount > 1 && !isLast;

  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleResizeStart = useCallback(
    (event: MouseEvent) => {
      if (!onResizeWidth) return;
      event.preventDefault();
      const startWidth = widthPx ?? FIXED_COLUMN_WIDTH_PX;
      dragRef.current = { startX: event.clientX, startWidth };

      const onMove = (moveEvent: globalThis.MouseEvent) => {
        if (!dragRef.current) return;
        const delta = moveEvent.clientX - dragRef.current.startX;
        onResizeWidth(
          columnIndex,
          clampColumnWidth(dragRef.current.startWidth + delta),
        );
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.document.body.style.cursor = "";
        window.document.body.style.userSelect = "";
      };

      window.document.body.style.cursor = "col-resize";
      window.document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [columnIndex, onResizeWidth, widthPx],
  );

  if (!document) {
    return (
      <section
        className={`relative flex flex-col bg-[var(--color-white)] ${
          isFixed || layout === "focus" ? "shrink-0" : "min-w-0 flex-1"
        }`}
        style={columnStyle(layout, columnCount, widthPx, isSolo)}
      >
        <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
          This document is missing.
        </p>
      </section>
    );
  }

  const showColumnChrome =
    canFocus || isFocused || (columnIndex > 0 && !isFocused);

  return (
    <section
      className={`relative flex w-full flex-col bg-[var(--color-white)] transition-[flex-basis,box-shadow,width] duration-[var(--duration-duration-7)] ease-[var(--easing-ease-out)] ${
        isFixed || layout === "focus" ? "shrink-0" : "min-w-[260px] flex-1"
      } ${
        isSolo
          ? ""
          : "border border-[var(--color-mid-gray-6)] rounded-[var(--radius-2xl)]"
      }`}
      style={columnStyle(layout, columnCount, widthPx, isSolo)}
    >
      {showColumnChrome ? (
        <div className="flex items-center justify-end gap-0.5 pb-1">
          {canFocus && !isFocused ? (
            <button
              type="button"
              onClick={() => onEnterFocus(docId)}
              className={notionIconBtn}
              aria-label="Expand to full view"
              title="Full view"
            >
              <Maximize2 size={16} strokeWidth={1.75} />
            </button>
          ) : null}

          {isFocused ? (
            <button
              type="button"
              onClick={onExitFocus}
              className={notionIconBtn}
              aria-label="Exit full view"
              title="Exit full view"
            >
              <Minimize2 size={16} strokeWidth={1.75} />
            </button>
          ) : null}

          {columnIndex > 0 && !isFocused ? (
            <button
              type="button"
              onClick={() => onCloseFrom(columnIndex)}
              className={notionIconBtn}
              aria-label="Close this and deeper documents"
              title="Close"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
      ) : null}

      <BlockEditor
        docId={docId}
        columnIndex={columnIndex}
        columnCount={columnCount}
        editable={editable}
        openLinkedDocId={isFocused ? undefined : openLinkedDocId}
        onOpenLinked={onOpenLinked}
      />
      {canResize ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize column"
          onMouseDown={handleResizeStart}
          className="absolute inset-y-0 right-0 z-[var(--z-5)] w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-[var(--color-dark-orange)]"
        />
      ) : null}
    </section>
  );
}

function columnStyle(
  layout: "equal" | "fixed" | "focus",
  columnCount: number,
  widthPx: number | undefined,
  isSolo: boolean,
): CSSProperties | undefined {
  if (layout === "focus" || isSolo) {
    return {
      width: "100%",
      maxWidth: "none",
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
