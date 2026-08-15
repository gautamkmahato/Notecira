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
        className="notion-menu absolute left-8 top-full z-[var(--z-14)] mt-1 w-56 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]"
      >
        No matching blocks
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="notion-menu scrollbar-custom absolute left-8 top-full z-[var(--z-14)] mt-1 max-h-64 w-56 overflow-y-auto"
      role="listbox"
      aria-label="Insert block"
    >
      <p className="px-3 py-1 text-[var(--font-size-2xs)] font-medium uppercase tracking-wide text-[var(--color-mid-gray)]">
        Basic blocks
      </p>
      {filtered.map((type) => (
        <button
          key={type}
          type="button"
          role="option"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(type)}
          className="notion-menu-item"
        >
          {BLOCK_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
