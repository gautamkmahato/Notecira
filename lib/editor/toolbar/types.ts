"use client";

import type { ReactNode } from "react";
import type { Block, BlockAttrs, BlockType } from "@/lib/domain/types";
import type { TipTapFormatApi } from "@/lib/editor/tiptap/active-editor";
import { emptyTipTapFormatApi } from "@/lib/editor/tiptap/active-editor";

/**
 * Toolbar option context passed into every option renderer.
 * Keep this stable — add fields carefully so option modules stay compatible.
 */
export type ToolbarOptionContext = {
  block: Block;
  patchAttrs: (patch: Partial<BlockAttrs>) => void;
  setContent: (content: string) => void;
  setType: (type: BlockType) => void;
  /** Selection-scoped TipTap formatting. */
  inline: TipTapFormatApi;
};

export type ToolbarOptionDef = {
  id: string;
  label: string;
  /** Render control(s) for this option. Isolated per feature. */
  render: (ctx: ToolbarOptionContext) => ReactNode;
};

/**
 * Registry: each block type owns its own option list.
 * Add/remove options for one type without touching others.
 */
export type ToolbarRegistry = Record<BlockType, ToolbarOptionDef[]>;

export function getToolbarOptions(
  registry: ToolbarRegistry,
  type: BlockType,
): ToolbarOptionDef[] {
  return registry[type] ?? registry.paragraph;
}

export function emptyInlineApi(): TipTapFormatApi {
  return emptyTipTapFormatApi();
}
