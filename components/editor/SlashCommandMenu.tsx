"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

const VIEWPORT_PADDING = 8;
const PREFERRED_MAX_HEIGHT = 256;

type MenuPlacement = {
  side: "top" | "bottom";
  maxHeight: number;
};

function measurePlacement(menu: HTMLElement): MenuPlacement {
  const parent = menu.offsetParent as HTMLElement | null;
  const anchorRect = parent?.getBoundingClientRect();
  if (!anchorRect) {
    return { side: "bottom", maxHeight: PREFERRED_MAX_HEIGHT };
  }

  const naturalHeight = menu.scrollHeight;
  const spaceBelow = window.innerHeight - anchorRect.bottom - VIEWPORT_PADDING;
  const spaceAbove = anchorRect.top - VIEWPORT_PADDING;
  const needed = Math.min(naturalHeight, PREFERRED_MAX_HEIGHT);

  if (spaceBelow < needed && spaceAbove > spaceBelow) {
    return {
      side: "top",
      maxHeight: Math.max(120, Math.min(PREFERRED_MAX_HEIGHT, spaceAbove)),
    };
  }

  return {
    side: "bottom",
    maxHeight: Math.max(120, Math.min(PREFERRED_MAX_HEIGHT, spaceBelow)),
  };
}

export function SlashCommandMenu({
  query,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<MenuPlacement>({
    side: "bottom",
    maxHeight: PREFERRED_MAX_HEIGHT,
  });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INSERTABLE_BLOCK_TYPES;
    return INSERTABLE_BLOCK_TYPES.filter((type) =>
      BLOCK_TYPE_LABELS[type].toLowerCase().includes(q),
    );
  }, [query]);

  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;

    const updatePlacement = () => {
      setPlacement(measurePlacement(menu));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [filtered, query]);

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

  const positionClass =
    placement.side === "top" ? "bottom-full mb-1" : "top-full mt-1";

  if (filtered.length === 0) {
    return (
      <div
        ref={ref}
        className={`notion-menu absolute left-8 z-[var(--z-14)] w-56 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-mid-gray)] ${positionClass}`}
        style={{ maxHeight: placement.maxHeight }}
      >
        No matching blocks
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`notion-menu scrollbar-custom absolute left-8 z-[var(--z-14)] w-56 overflow-y-auto ${positionClass}`}
      style={{ maxHeight: placement.maxHeight }}
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
