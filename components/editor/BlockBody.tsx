"use client";

import type { Block } from "@/lib/domain/types";
import { RichTextBlock } from "./RichTextBlock";
import { TableBlock } from "./TableBlock";
import { CodeBlock } from "./CodeBlock";
import { ImageBlock } from "./ImageBlock";
import { VideoBlock } from "./VideoBlock";
import { DocumentBlock } from "@/components/document-block/DocumentBlock";
import { MarkdownBlock } from "@/components/markdown-block/MarkdownBlock";

type BlockBodyProps = {
  block: Block;
  isSelected: boolean;
  editable?: boolean;
  autofocus?: boolean;
  caret?: number;
  onSelect: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
};

export function BlockBody({
  block,
  isSelected,
  editable = true,
  autofocus,
  caret,
  onSelect,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
}: BlockBodyProps) {
  const textProps = {
    block,
    editable,
    autofocus,
    caret,
    onFocused: onSelect,
    onAutofocusHandled,
    onRequestFocus,
    onSlashQueryChange,
  };

  switch (block.type) {
    case "heading_1":
      return (
        <RichTextBlock
          {...textProps}
          placeholder="Heading 1"
          className="font-serif text-3xl font-semibold tracking-tight"
        />
      );
    case "heading_2":
      return (
        <RichTextBlock
          {...textProps}
          placeholder="Heading 2"
          className="font-serif text-2xl font-semibold tracking-tight"
        />
      );
    case "heading_3":
      return (
        <RichTextBlock
          {...textProps}
          placeholder="Heading 3"
          className="text-xl font-semibold"
        />
      );
    case "heading_4":
      return (
        <RichTextBlock
          {...textProps}
          placeholder="Heading 4"
          className="text-lg font-semibold"
        />
      );
    case "bulleted_list_item":
      return (
        <RichTextBlock
          {...textProps}
          mode="bulletList"
          placeholder="List item"
        />
      );
    case "numbered_list_item":
      return (
        <RichTextBlock
          {...textProps}
          mode="orderedList"
          placeholder="List item"
        />
      );
    case "code":
      return (
        <CodeBlock block={block} editable={editable} onSelect={onSelect} />
      );
    case "table":
      return (
        <TableBlock block={block} editable={editable} onSelect={onSelect} />
      );
    case "image":
      return (
        <ImageBlock
          block={block}
          isSelected={isSelected}
          editable={editable}
          onSelect={onSelect}
        />
      );
    case "video":
      return (
        <VideoBlock block={block} editable={editable} onSelect={onSelect} />
      );
    case "pdf":
      return (
        <div className="space-y-2" onFocus={onSelect}>
          {block.attrs.src ? (
            <iframe
              src={block.attrs.src}
              title={block.attrs.name || "PDF"}
              className="h-80 w-full rounded-[var(--radius-xl)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]"
            />
          ) : (
            <div className="rounded-[var(--radius-xl)] bg-[var(--color-white-2)] px-3 py-8 text-center text-[var(--font-size-sm)] text-[var(--color-mid-gray)] shadow-[var(--shadow-sm)]">
              Add a PDF URL in the toolbar
            </div>
          )}
          {block.attrs.src ? (
            <a
              href={block.attrs.src}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--font-size-2xs)] text-[var(--color-blue)] hover:underline"
            >
              Open PDF
            </a>
          ) : null}
        </div>
      );
    case "document":
      return <DocumentBlock {...textProps} />;
    case "markdown":
      return <MarkdownBlock {...textProps} />;
    case "paragraph":
    default:
      return <RichTextBlock {...textProps} />;
  }
}
