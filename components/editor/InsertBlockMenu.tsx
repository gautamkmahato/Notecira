"use client";

import { useEffect, useRef, useState } from "react";
import type { BlockType } from "@/lib/domain/types";
import {
  BLOCK_TYPE_LABELS,
  INSERTABLE_BLOCK_TYPES,
} from "@/lib/editor/block-meta";

type InsertBlockMenuProps = {
  onInsert: (type: BlockType) => void;
};

export function InsertBlockMenu({ onInsert }: InsertBlockMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={ref} className="relative mt-2 self-start">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        + Add block
      </button>
      {open ? (
        <div className="absolute bottom-full left-0 z-20 mb-1 max-h-64 w-52 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {INSERTABLE_BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onInsert(type);
                setOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              {BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
