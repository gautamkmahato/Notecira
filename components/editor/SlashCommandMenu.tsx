"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BlockType } from "@/lib/domain/types";
import {
  BLOCK_TYPE_LABELS,
  INSERTABLE_BLOCK_TYPES,
} from "@/lib/editor/block-meta";

type SlashCommandMenuProps = {
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
};

export function SlashCommandMenu({
  query,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INSERTABLE_BLOCK_TYPES;
    return INSERTABLE_BLOCK_TYPES.filter((type) =>
      BLOCK_TYPE_LABELS[type].toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (filtered.length === 0) {
    return (
      <div
        ref={ref}
        className="absolute left-8 top-full z-30 mt-1 w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 shadow-lg"
      >
        No matching blocks
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="absolute left-8 top-full z-30 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
      role="listbox"
      aria-label="Insert block"
    >
      <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
        Basic blocks
      </p>
      {filtered.map((type) => (
        <button
          key={type}
          type="button"
          role="option"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(type)}
          className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          {BLOCK_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
