"use client";

import type { ToolbarOptionDef } from "../types";

const COLORS = [
  { label: "Ink", value: "#1e293b" },
  { label: "Gray", value: "#64748b" },
  { label: "Red", value: "#b91c1c" },
  { label: "Orange", value: "#c2410c" },
  { label: "Green", value: "#15803d" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Teal", value: "#0f766e" },
];

const FONT_SIZES = [
  { label: "S", value: "sm" as const },
  { label: "M", value: "md" as const },
  { label: "L", value: "lg" as const },
  { label: "XL", value: "xl" as const },
];

/** TipTap-style toolbar toggle (soft active pill like image 2). */
function ToggleBtn({
  active,
  label,
  title,
  onClick,
  disabled,
  className = "",
}: {
  active: boolean;
  label: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition disabled:opacity-40 ${
        active
          ? "bg-[#ebe4f5] text-[#5b21b6]"
          : "text-slate-600 hover:bg-slate-200/70"
      } ${className}`}
    >
      {label}
    </button>
  );
}

/*
 * LEGACY custom contentEditable text options (kept for reference).
 * Replaced by TipTap-backed options below — do not delete.
 *
 * export const textFormatOptionsLegacy: ToolbarOptionDef[] = [ ... ]
 */

/**
 * TipTap text formatting options (MIT / free core).
 * Applies marks to the current selection only.
 */
export const textFormatOptions: ToolbarOptionDef[] = [
  {
    id: "bold",
    label: "Bold",
    render: ({ inline }) => (
      <ToggleBtn
        active={inline.state.bold}
        label={<span className="font-bold">B</span>}
        title="Bold"
        disabled={!inline.available}
        onClick={inline.toggleBold}
      />
    ),
  },
  {
    id: "italic",
    label: "Italic",
    render: ({ inline }) => (
      <ToggleBtn
        active={inline.state.italic}
        label={<span className="italic">I</span>}
        title="Italic"
        disabled={!inline.available}
        onClick={inline.toggleItalic}
      />
    ),
  },
  {
    id: "underline",
    label: "Underline",
    render: ({ inline }) => (
      <ToggleBtn
        active={inline.state.underline}
        label={<span className="underline">U</span>}
        title="Underline"
        disabled={!inline.available}
        onClick={inline.toggleUnderline}
      />
    ),
  },
  {
    id: "fontSize",
    label: "Size",
    render: ({ inline }) => (
      <div className="flex items-center gap-0.5 rounded-lg bg-slate-100/80 p-0.5">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            type="button"
            title={`Size ${size.label}`}
            disabled={!inline.available}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => inline.setFontSize(size.value)}
            className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md text-[11px] font-medium disabled:opacity-40 ${
              inline.state.fontSize === size.value
                ? "bg-[#ebe4f5] text-[#5b21b6]"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: "textColor",
    label: "Color",
    render: ({ inline }) => (
      <div className="flex items-center gap-1.5 pl-1">
        <span className="text-[11px] font-medium text-slate-400">A</span>
        <div className="flex items-center gap-1">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              disabled={!inline.available}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => inline.setColor(color.value)}
              className={`h-4 w-4 rounded-full border disabled:opacity-40 ${
                inline.state.color && rgbClose(inline.state.color, color.value)
                  ? "border-violet-600 ring-2 ring-violet-200"
                  : "border-white shadow-sm"
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

function rgbClose(computed: string, hex: string): boolean {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("span");
  probe.style.color = hex;
  document.body.appendChild(probe);
  const target = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return computed === target;
}
