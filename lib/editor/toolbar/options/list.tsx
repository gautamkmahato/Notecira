"use client";

import type { ToolbarOptionDef } from "../types";
import { textFormatOptions } from "./text";

/** Lists: TipTap marks + list style switch (soft active state). */
export const listOptions: ToolbarOptionDef[] = [
  ...textFormatOptions,
  {
    id: "list-bullet",
    label: "Bullets",
    render: ({ block, setType }) => (
      <button
        type="button"
        title="Bullet list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setType("bulleted_list_item")}
        className={`inline-flex h-8 items-center rounded-lg px-2.5 text-sm transition ${
          block.type === "bulleted_list_item"
            ? "bg-[#ebe4f5] text-[#5b21b6]"
            : "text-slate-600 hover:bg-slate-200/70"
        }`}
      >
        • List
      </button>
    ),
  },
  {
    id: "list-numbered",
    label: "Numbered",
    render: ({ block, setType }) => (
      <button
        type="button"
        title="Numbered list"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setType("numbered_list_item")}
        className={`inline-flex h-8 items-center rounded-lg px-2.5 text-sm transition ${
          block.type === "numbered_list_item"
            ? "bg-[#ebe4f5] text-[#5b21b6]"
            : "text-slate-600 hover:bg-slate-200/70"
        }`}
      >
        1. List
      </button>
    ),
  },
];
