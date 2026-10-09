"use client";

import { ImageIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActiveCanvas } from "@/lib/canvas-block/active-canvas";

type CanvasMoreMenuProps = {
  blockId: string | null;
};

export function CanvasMoreMenu({ blockId }: CanvasMoreMenuProps) {
  const active = useActiveCanvas(blockId);
  const api = active?.api;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        title="More tools"
        aria-label="More canvas tools"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={!api}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-40 ${
          open
            ? "bg-[#ece9ff] text-[#6965db]"
            : "text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
        }`}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      {open && api ? (
        <div
          className="absolute left-1/2 top-[calc(100%+6px)] z-[var(--z-20)] min-w-[200px] -translate-x-1/2 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] py-1 shadow-[0_8px_30px_rgba(15,23,42,0.14)]"
          role="menu"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] transition hover:bg-[var(--notion-hover)]"
            onClick={() => {
              setOpen(false);
              api.openImagePicker();
            }}
          >
            <ImageIcon
              className="h-[18px] w-[18px] shrink-0 text-[var(--color-mid-gray)]"
              strokeWidth={1.75}
            />
            <span className="flex-1">Insert image</span>
            <span className="text-[var(--font-size-xs)] text-[var(--color-mid-gray)]">
              9
            </span>
          </button>
          <div className="mx-2 my-1 h-px bg-[var(--color-light-gray-2)]" />
          <button
            type="button"
            role="menuitem"
            disabled={!api.selectedId}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[var(--font-size-sm)] text-[var(--notion-danger)] transition hover:bg-[var(--notion-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              if (!api.selectedId) return;
              setOpen(false);
              api.deleteSelected();
            }}
          >
            <Trash2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            <span>Delete selected</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
