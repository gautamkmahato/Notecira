"use client";

import { useDocumentStore } from "@/lib/document-store";
import type { BlockType } from "@/lib/domain/types";
import { isTextLikeBlockType } from "@/lib/domain/types";
import {
  BLOCK_TYPE_LABELS,
  INSERTABLE_BLOCK_TYPES,
} from "@/lib/editor/block-meta";
import {
  buildTipTapFormatApi,
  useActiveTipTap,
} from "@/lib/editor/tiptap/active-editor";
import { emptyInlineApi, getToolbarOptions } from "@/lib/editor/toolbar/types";
import { toolbarRegistry } from "@/lib/editor/toolbar/registry";

type FormatToolbarProps = {
  blockId: string | null;
};

export function FormatToolbar({ blockId }: FormatToolbarProps) {
  const getBlock = useDocumentStore((s) => s.getBlock);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  useDocumentStore((s) => s.snapshot.blocks);
  const block = blockId ? getBlock(blockId) : undefined;

  const activeType = block?.type ?? "paragraph";
  const options = getToolbarOptions(toolbarRegistry, activeType);
  const editor = useActiveTipTap(blockId);
  const inline = block
    ? buildTipTapFormatApi(block.id, editor)
    : emptyInlineApi();

  const textNeedsFocus =
    Boolean(block) && isTextLikeBlockType(activeType) && !inline.available;

  return (
    <div className="border-b border-slate-200/70 bg-[#f4f5f7] px-3 py-2.5" data-editor="tiptap">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-1 rounded-xl bg-[#eceef1] px-2 py-1.5 shadow-sm">
        {block ? (
          <>
            <label className="flex items-center gap-1.5 rounded-lg px-1.5 text-[11px] font-medium text-slate-500">
              <span className="text-slate-400">Type</span>
              <select
                value={block.type}
                onChange={(e) =>
                  updateBlockType(block.id, e.target.value as BlockType)
                }
                className="h-8 rounded-lg border-0 bg-transparent px-1.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-200/60"
              >
                {INSERTABLE_BLOCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {BLOCK_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <span className="mx-1 h-5 w-px bg-slate-300/80" />
          </>
        ) : null}

        {!block ? (
          <span className="px-2 text-xs text-slate-400">
            Select a block to edit its options
          </span>
        ) : textNeedsFocus ? (
          <span className="px-2 text-xs text-slate-400">
            Click into the text to format
          </span>
        ) : (
          options.map((option) => (
            <div key={option.id} className="flex items-center">
              {option.render({
                block,
                patchAttrs: (patch) => updateBlockAttrs(block.id, patch),
                setContent: (content) => updateBlockContent(block.id, content),
                setType: (type) => updateBlockType(block.id, type),
                inline,
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
