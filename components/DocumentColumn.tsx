"use client";

import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useDocumentStore } from "@/lib/document-store";
import {
  FIXED_COLUMN_WIDTH_PX,
  SOLO_COLUMN_MAX_WIDTH_PX,
  clampColumnWidth,
} from "@/lib/layout";
import { BlockEditor } from "./BlockEditor";
import { DocumentTitleInput } from "./DocumentTitleInput";

type DocumentColumnProps = {
  docId: string;
  columnIndex: number;
  columnCount: number;
  layout: "equal" | "fixed" | "focus";
  widthPx?: number;
  isLast: boolean;
  isFocused: boolean;
  canFocus: boolean;
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
  openLinkedDocId,
  onOpenLinked,
  onCloseFrom,
  onEnterFocus,
  onExitFocus,
  onResizeWidth,
}: DocumentColumnProps) {
  const { getDocument } = useDocumentStore();
  const document = getDocument(docId);
  const [isEditing, setIsEditing] = useState(false);
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
        className={`relative flex h-full flex-col border-r border-slate-200 bg-white px-4 py-5 ${
          isFixed || layout === "focus" ? "shrink-0" : "min-w-0 flex-1"
        }`}
        style={columnStyle(layout, columnCount, widthPx, isSolo)}
      >
        <p className="text-sm text-slate-500">This document is missing.</p>
      </section>
    );
  }

  return (
    <section
      className={`relative flex h-full flex-col border-slate-200/90 bg-[#f7f9fb] transition-[flex-basis,box-shadow,width] duration-300 ease-out ${
        isFixed || layout === "focus" ? "shrink-0" : "min-w-[260px] flex-1"
      } ${
        isSolo
          ? "rounded-xl border shadow-sm"
          : `border-r ${isLast ? "shadow-[inset_0_0_0_1px_rgba(15,118,110,0.18)]" : ""}`
      }`}
      style={columnStyle(layout, columnCount, widthPx, isSolo)}
    >
      <header className="flex items-start gap-2 border-b border-slate-200/80 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {isFocused
              ? "Focused"
              : columnIndex === 0
                ? "Document"
                : `Sub-document · L${columnIndex}`}
          </p>
          <DocumentTitleInput
            docId={docId}
            readOnly={!isEditing}
            className="w-full bg-transparent font-serif text-xl font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-400 read-only:cursor-default"
          />
        </div>

        <div className="mt-1 flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              isEditing
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
            title={isEditing ? "Switch to read-only" : "Enable editing"}
          >
            {isEditing ? "Done" : "Edit"}
          </button>

          {canFocus && !isFocused ? (
            <button
              type="button"
              onClick={() => onEnterFocus(docId)}
              className="rounded px-2 py-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
              aria-label="Expand to full view"
              title="Full view"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
              </svg>
            </button>
          ) : null}

          {isFocused ? (
            <button
              type="button"
              onClick={onExitFocus}
              className="rounded px-2 py-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
              aria-label="Exit full view"
              title="Exit full view"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M9 3v5H4M15 3v5h5M9 21v-5H4M15 21v-5h5" />
              </svg>
            </button>
          ) : null}

          {columnIndex > 0 && !isFocused ? (
            <button
              type="button"
              onClick={() => onCloseFrom(columnIndex)}
              className="rounded px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
              aria-label="Close this and deeper documents"
              title="Close"
            >
              ✕
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <BlockEditor
          docId={docId}
          columnIndex={columnIndex}
          editable={isEditing}
          openLinkedDocId={isFocused ? undefined : openLinkedDocId}
          onOpenLinked={onOpenLinked}
        />
      </div>

      {canResize ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize column"
          onMouseDown={handleResizeStart}
          className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize bg-transparent transition hover:bg-teal-500/30"
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
