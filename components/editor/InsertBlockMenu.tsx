"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
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
    <>
        {/* <div ref={ref} className="relative self-start">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="notion-btn gap-1 text-[var(--color-mid-gray)]"
      >
        <Plus size={14} strokeWidth={1.75} />
        Add block
      </button>
      {open ? (
        <div className="notion-menu absolute bottom-full left-0 z-[var(--z-14)] mb-1 max-h-64 w-52 overflow-y-auto">
          {INSERTABLE_BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onInsert(type);
                setOpen(false);
              }}
              className="notion-menu-item"
            >
              {BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      ) : null}
        </div> */}
    </>
  );
}
