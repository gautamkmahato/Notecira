"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  TEXT_COLOR_DEFAULT,
  TEXT_COLOR_GRID,
  TEXT_COLOR_PRESETS,
} from "@/lib/editor/toolbar/color-palette";
import type { InlineFormatApi } from "@/lib/editor/rich-text/active-editor";
import { useDismissOnOutsideClick } from "../hooks/use-dismiss-on-outside-click";

type TextColorPickerProps = {
  inline: InlineFormatApi;
};

function colorsMatch(a: string | null, b: string): boolean {
  if (!a) return b === TEXT_COLOR_DEFAULT;
  if (typeof document === "undefined") return a.toLowerCase() === b.toLowerCase();
  const probe = document.createElement("span");
  probe.style.color = b;
  document.body.appendChild(probe);
  const target = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return a === target;
}

function toHexColor(color: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (typeof document === "undefined") return TEXT_COLOR_DEFAULT;
  const probe = document.createElement("span");
  probe.style.color = color;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return TEXT_COLOR_DEFAULT;
  const hex = [match[1], match[2], match[3]]
    .map((n) => Number(n).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

function ColorSwatch({
  color,
  selected,
  disabled,
  onPick,
}: {
  color: string;
  selected: boolean;
  disabled?: boolean;
  onPick: (color: string) => void;
}) {
  return (
    <button
      type="button"
      title={color}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(color)}
      className={`h-5 w-5 rounded-full border disabled:opacity-40 cursor-pointer ${
        selected
          ? "border-[var(--color-blue)] ring-2 ring-[var(--color-blue-25)]"
          : "border-[var(--color-light-gray-2)] hover:scale-110"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

export function TextColorPicker({ inline }: TextColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const activeColor = inline.state.color ?? TEXT_COLOR_DEFAULT;
  const customHex = toHexColor(activeColor);
  const isPreset = TEXT_COLOR_PRESETS.some((c) => colorsMatch(inline.state.color, c));

  useDismissOnOutsideClick(ref, open, () => setOpen(false));

  const pickPreset = (color: string) => {
    inline.setColor(color);
    setOpen(false);
  };

  const pickCustom = (color: string) => {
    inline.setColor(color);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Text color"
        disabled={!inline.available}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 min-w-8 flex-col items-center justify-center rounded-[var(--radius-lg)] px-2 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)] disabled:opacity-40"
      >
        <span>A</span>
        <span
          className="mt-0.5 h-1 w-4 rounded-full"
          style={{ backgroundColor: activeColor }}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-[var(--z-14)] mt-1 w-max rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-md)]">
          <div className="grid grid-cols-10 gap-0.5">
            {TEXT_COLOR_GRID.flat().map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={colorsMatch(inline.state.color, color)}
                disabled={!inline.available}
                onPick={pickPreset}
              />
            ))}
          </div>

          <div className="mt-3 border-t border-[var(--color-light-gray-2)] pt-3">
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-[var(--color-mid-gray)]">
              CUSTOM
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Pick custom color"
                disabled={!inline.available}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => colorInputRef.current?.click()}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border disabled:opacity-40 ${
                  !isPreset && inline.state.color
                    ? "border-[var(--color-blue)] ring-2 ring-[var(--color-blue-25)]"
                    : "border-[var(--color-light-gray-2)] hover:bg-[var(--notion-hover)]"
                }`}
                style={{ backgroundColor: customHex }}
              >
                <Plus size={14} strokeWidth={1.75} className="text-[var(--color-white)] drop-shadow-sm" />
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={customHex}
                disabled={!inline.available}
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => pickCustom(e.target.value)}
                className="sr-only"
                aria-label="Custom text color"
              />
              <span className="text-[var(--font-size-2xs)] text-[var(--color-mid-gray)]">
                {customHex.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
