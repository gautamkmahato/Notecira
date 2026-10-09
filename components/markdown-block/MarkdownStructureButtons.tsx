"use client";

import {
  Code,
  Heading1,
  Heading3,
  List,
  ListOrdered,
  Table,
} from "lucide-react";
import type { MarkdownBlockFormatApi } from "@/lib/markdown-block/active-editor";

function StructureBtn({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-lg)] px-2 text-[var(--font-size-sm)] text-[var(--color-dark-gray)] transition hover:bg-[var(--notion-hover)] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

type MarkdownStructureButtonsProps = {
  markdown: MarkdownBlockFormatApi;
};

export function MarkdownStructureButtons({
  markdown,
}: MarkdownStructureButtonsProps) {
  return (
    <>
      <StructureBtn
        title="Heading 1"
        disabled={!markdown.available}
        onClick={markdown.applyHeading1}
      >
        <Heading1 size={14} strokeWidth={1.75} />
      </StructureBtn>
      <StructureBtn
        title="Subheading"
        disabled={!markdown.available}
        onClick={markdown.applyHeading3}
      >
        <Heading3 size={14} strokeWidth={1.75} />
      </StructureBtn>
      <StructureBtn
        title="Code"
        disabled={!markdown.available}
        onClick={markdown.applyCode}
      >
        <Code size={14} strokeWidth={1.75} />
      </StructureBtn>
      <StructureBtn
        title="Table"
        disabled={!markdown.available}
        onClick={markdown.applyTable}
      >
        <Table size={14} strokeWidth={1.75} />
      </StructureBtn>
      <StructureBtn
        title="Bullet list"
        disabled={!markdown.available}
        onClick={markdown.applyBulletList}
      >
        <List size={14} strokeWidth={1.75} />
      </StructureBtn>
      <StructureBtn
        title="Numbered list"
        disabled={!markdown.available}
        onClick={markdown.applyOrderedList}
      >
        <ListOrdered size={14} strokeWidth={1.75} />
      </StructureBtn>
    </>
  );
}
