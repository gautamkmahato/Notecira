"use client";

import { useDocumentStore } from "@/lib/document-store";
import {
  buildInlineFormatApi,
  emptyInlineFormatApi,
  useInlineMarkState,
} from "@/lib/editor/rich-text/active-editor";
import { markdownToolbarOptions } from "./markdown-toolbar-options";
import { MarkdownElementInsertSelect } from "./MarkdownElementInsertSelect";

type MarkdownFormatToolbarProps = {
  blockId: string | null;
};

const EMPTY_BLOCK = {
  id: "",
  documentId: "",
  type: "markdown" as const,
  content: "",
  attrs: {},
  position: 0,
  linkedDocumentId: null,
  createdAt: "",
  updatedAt: "",
};

export function MarkdownFormatToolbar({ blockId }: MarkdownFormatToolbarProps) {
  const getBlock = useDocumentStore((s) => s.getBlock);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  useDocumentStore((s) => s.snapshot.blocks);

  const block = blockId ? getBlock(blockId) : undefined;
  useInlineMarkState(blockId);
  const inline = block ? buildInlineFormatApi(block.id) : emptyInlineFormatApi();

  const renderBlock = block ?? EMPTY_BLOCK;
  const patchAttrs = block
    ? (patch: Partial<typeof block.attrs>) => updateBlockAttrs(block.id, patch)
    : () => {};
  const setContent = block
    ? (content: string) => updateBlockContent(block.id, content)
    : () => {};
  const setType = block
    ? (type: typeof block.type) => updateBlockType(block.id, type)
    : () => {};

  return (
    <div
      className="relative z-[var(--z-10)] flex min-h-12 shrink-0 items-center justify-center overflow-visible border-b border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-3 sm:px-4"
      data-editor="markdown"
    >
      <div className="flex min-h-9 w-full min-w-0 items-center justify-center gap-1 overflow-visible rounded-[var(--radius-xl)] px-1.5 py-1.5">
        {markdownToolbarOptions.map((option) => (
          <div key={option.id} className="flex shrink-0 items-center">
            {option.render({
              block: renderBlock,
              patchAttrs,
              setContent,
              setType,
              inline,
            })}
          </div>
        ))}
        <div className="flex shrink-0 items-center">
          <MarkdownElementInsertSelect blockId={blockId} />
        </div>
      </div>
    </div>
  );
}
