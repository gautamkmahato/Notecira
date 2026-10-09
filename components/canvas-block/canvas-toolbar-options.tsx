"use client";

import type { ReactNode } from "react";
import type { Block, BlockAttrs, BlockType } from "@/lib/domain/types";
import { getCanvasMode } from "@/lib/canvas-block/model";
import type { CanvasMode } from "@/lib/canvas-block/types";
import { ToolbarDivider } from "@/lib/editor/toolbar/components/toolbar-divider";
import { CanvasToolsBar } from "./CanvasToolsBar";

export type CanvasToolbarOptionContext = {
  block: Block;
  blockId: string | null;
  patchAttrs: (patch: Partial<BlockAttrs>) => void;
  setType: (type: BlockType) => void;
};

export type CanvasToolbarOptionDef = {
  id: string;
  label: string;
  render: (ctx: CanvasToolbarOptionContext) => ReactNode;
};

function ModeBtn({
  active,
  title,
  onClick,
  children,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rounded-[var(--radius-lg)] px-2.5 py-1 text-[var(--font-size-xs)] transition ${
        active
          ? "bg-[var(--notion-selected)] font-medium text-[var(--color-dark-gray-2)]"
          : "text-[var(--color-mid-gray)] hover:bg-[var(--notion-hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export const canvasToolbarOptions: CanvasToolbarOptionDef[] = [
  {
    id: "canvas-mode",
    label: "Canvas mode",
    render: ({ block, patchAttrs }) => {
      const mode = getCanvasMode(block.attrs);
      const setMode = (next: CanvasMode) => patchAttrs({ canvasMode: next });

      return (
        <div
          className="flex items-center gap-0.5 rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] p-0.5"
          role="group"
          aria-label="Canvas mode"
        >
          <ModeBtn
            active={mode === "infinite"}
            title="Infinite canvas (pan in all directions)"
            onClick={() => setMode("infinite")}
          >
            Infinite
          </ModeBtn>
          <ModeBtn
            active={mode === "doc_width"}
            title="Document width (vertical scroll only)"
            onClick={() => setMode("doc_width")}
          >
            Doc width
          </ModeBtn>
        </div>
      );
    },
  },
  {
    id: "divider-mode",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "canvas-tools",
    label: "Tools",
    render: ({ blockId }) => <CanvasToolsBar blockId={blockId} variant="inline" />,
  },
];
