"use client";

import type { ReactNode } from "react";
import type { Block, BlockAttrs, BlockType } from "@/lib/domain/types";
import type { InlineFormatApi } from "@/lib/editor/rich-text/active-editor";
import type { MarkdownBlockFormatApi } from "@/lib/markdown-block/active-editor";
import { FontFamilySelect } from "@/lib/editor/toolbar/components/font-family-select";
import { FontSizeControl } from "@/lib/editor/toolbar/components/font-size-control";
import { TextColorPicker } from "@/lib/editor/toolbar/components/text-color-picker";
import { ToolbarDivider } from "@/lib/editor/toolbar/components/toolbar-divider";
import { MarkdownStructureButtons } from "./MarkdownStructureButtons";

export type MarkdownToolbarOptionContext = {
  block: Block;
  patchAttrs: (patch: Partial<BlockAttrs>) => void;
  setContent: (content: string) => void;
  setType: (type: BlockType) => void;
  inline: InlineFormatApi;
  markdown: MarkdownBlockFormatApi;
};

export type MarkdownToolbarOptionDef = {
  id: string;
  label: string;
  render: (ctx: MarkdownToolbarOptionContext) => ReactNode;
};

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

/** Markdown block toolbar controls. */
export const markdownToolbarOptions: MarkdownToolbarOptionDef[] = [
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
  {
    id: "divider-structure",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "structure",
    label: "Structure",
    render: ({ markdown }) => <MarkdownStructureButtons markdown={markdown} />,
  },
];
