"use client";

import type { ToolbarOptionDef } from "../types";
import { FontFamilySelect } from "../components/font-family-select";
import { FontSizeControl } from "../components/font-size-control";
import { TextColorPicker } from "../components/text-color-picker";
import { ToolbarDivider } from "../components/toolbar-divider";

/** TipTap-style toolbar toggle (soft active pill). */
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
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-lg)] px-2 text-[var(--font-size-sm)] transition disabled:opacity-40 ${
        active
          ? "bg-[var(--notion-selected)] text-[var(--color-dark-gray-2)]"
          : "text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
      } ${className}`}
    >
      {label}
    </button>
  );
}

/**
 * TipTap text formatting options — font, size, style, and color.
 * Used for paragraphs, headings, and list items.
 */
export const textFormatOptions: ToolbarOptionDef[] = [
  {
    id: "fontFamily",
    label: "Font",
    render: ({ inline }) => <FontFamilySelect inline={inline} />,
  },
  {
    id: "divider-font",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "fontSize",
    label: "Size",
    render: ({ inline }) => <FontSizeControl inline={inline} />,
  },
  {
    id: "divider-size",
    label: "",
    render: () => <ToolbarDivider />,
  },
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
    id: "divider-style",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "textColor",
    label: "Color",
    render: ({ inline }) => <TextColorPicker inline={inline} />,
  },
];
