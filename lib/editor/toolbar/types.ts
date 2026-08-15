"use client";

import type { ReactNode } from "react";
import type { Block, BlockAttrs, BlockType } from "@/lib/domain/types";
import type { InlineFormatApi } from "@/lib/editor/rich-text/active-editor";
import { emptyInlineFormatApi } from "@/lib/editor/rich-text/active-editor";

export type ToolbarOptionContext = {
  block: Block;
  patchAttrs: (patch: Partial<BlockAttrs>) => void;
  setContent: (content: string) => void;
  setType: (type: BlockType) => void;
  inline: InlineFormatApi;
};

export type ToolbarOptionDef = {
  id: string;
  label: string;
  render: (ctx: ToolbarOptionContext) => ReactNode;
};

export type ToolbarRegistry = Record<BlockType, ToolbarOptionDef[]>;

export function getToolbarOptions(
  registry: ToolbarRegistry,
  type: BlockType,
): ToolbarOptionDef[] {
  return registry[type] ?? registry.paragraph;
}

export function emptyInlineApi(): InlineFormatApi {
  return emptyInlineFormatApi();
}
