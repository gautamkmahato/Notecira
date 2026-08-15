"use client";

import { useDocumentStore } from "@/lib/document-store";
import {
  buildInlineFormatApi,
  useInlineMarkState,
} from "@/lib/editor/rich-text/active-editor";
import { emptyInlineApi, getToolbarOptions } from "@/lib/editor/toolbar/types";
import { toolbarRegistry } from "@/lib/editor/toolbar/registry";
import { textFormatOptions } from "@/lib/editor/toolbar/options/text";

type FormatToolbarProps = {
  blockId: string | null;
};

const EMPTY_BLOCK = {
  id: "",
  documentId: "",
  type: "paragraph" as const,
  content: "",
  attrs: {},
  position: 0,
  linkedDocumentId: null,
  createdAt: "",
  updatedAt: "",
};

export function FormatToolbar({ blockId }: FormatToolbarProps) {
  const getBlock = useDocumentStore((s) => s.getBlock);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  useDocumentStore((s) => s.snapshot.blocks);
  const block = blockId ? getBlock(blockId) : undefined;

  const activeType = block?.type ?? "paragraph";
  const options = block
    ? getToolbarOptions(toolbarRegistry, activeType)
    : textFormatOptions;
  useInlineMarkState(blockId);
  const inline = block ? buildInlineFormatApi(block.id) : emptyInlineApi();

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
      data-editor="rich-text"
    >
      <div className="flex min-h-9 w-full min-w-0 items-center justify-center gap-1 overflow-visible rounded-[var(--radius-xl)] px-1.5 py-1.5">
        {options.map((option) => (
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
      </div>
    </div>
  );
}
