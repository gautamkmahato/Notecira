"use client";

import { Minus, Plus } from "lucide-react";
import {
  clampFontSizePx,
  DEFAULT_FONT_SIZE_PX,
  MAX_FONT_SIZE_PX,
  MIN_FONT_SIZE_PX,
} from "@/lib/editor/rich-text/font-size";
import type { InlineFormatApi } from "@/lib/editor/rich-text/active-editor";

type FontSizeControlProps = {
  inline: InlineFormatApi;
};

export function FontSizeControl({ inline }: FontSizeControlProps) {
  const displaySize = inline.state.fontSizePx ?? DEFAULT_FONT_SIZE_PX;

  const applySize = (px: number) => {
    inline.setFontSizePx(clampFontSizePx(px));
  };

  const bump = (delta: number) => {
    applySize(displaySize + delta);
  };

  const handleInput = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    applySize(parsed);
  };

  return (
    <div className="flex items-center rounded-[var(--radius-lg)] px-0.5">
      <button
        type="button"
        title="Decrease font size"
        disabled={!inline.available || displaySize <= MIN_FONT_SIZE_PX}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => bump(-1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)] disabled:opacity-40"
      >
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <input
        type="number"
        min={MIN_FONT_SIZE_PX}
        max={MAX_FONT_SIZE_PX}
        value={displaySize}
        disabled={!inline.available}
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => handleInput(e.target.value)}
        className="h-7 w-9 appearance-none rounded-[var(--radius-lg)] border-0 bg-transparent text-center text-[var(--font-size-sm)] text-[var(--color-dark-gray)] outline-none [appearance:textfield] disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        title="Increase font size"
        disabled={!inline.available || displaySize >= MAX_FONT_SIZE_PX}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => bump(1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)] disabled:opacity-40"
      >
        <Plus size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
