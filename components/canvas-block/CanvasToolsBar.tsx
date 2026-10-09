"use client";

import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Minus,
  MousePointer2,
  Square,
  StickyNote,
  Type,
} from "lucide-react";
import { useActiveCanvas } from "@/lib/canvas-block/active-canvas";
import type { CanvasTool } from "@/lib/canvas-block/types";
import { CanvasMoreMenu } from "./CanvasMoreMenu";

const TOOLS: {
  tool: CanvasTool;
  title: string;
  icon: typeof MousePointer2;
}[] = [
  { tool: "select", title: "Select", icon: MousePointer2 },
  { tool: "rectangle", title: "Rectangle / square (hold Shift)", icon: Square },
  { tool: "decision", title: "Decision", icon: Diamond },
  { tool: "circle", title: "Circle", icon: Circle },
  { tool: "arrow", title: "Arrow", icon: ArrowRight },
  { tool: "line", title: "Line", icon: Minus },
  { tool: "text", title: "Text", icon: Type },
  { tool: "sticky", title: "Sticky note", icon: StickyNote },
  { tool: "eraser", title: "Eraser", icon: Eraser },
];

type CanvasToolsBarProps = {
  blockId: string | null;
  variant?: "inline" | "floating";
};

export function CanvasToolsBar({
  blockId,
  variant = "inline",
}: CanvasToolsBarProps) {
  const active = useActiveCanvas(blockId);
  const api = active?.api;

  const shellClass =
    variant === "floating"
      ? "pointer-events-auto absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-1.5 py-1 shadow-[0_4px_24px_rgba(15,23,42,0.12)]"
      : "flex items-center gap-0.5 overflow-visible rounded-xl bg-[var(--color-white)] px-1.5 py-1";

  return (
    <div
      className={shellClass}
      role="toolbar"
      aria-label="Canvas tools"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {TOOLS.map(({ tool, title, icon: Icon }) => (
        <button
          key={tool}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={api?.tool === tool}
          disabled={!api}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => api?.setTool(tool)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-40 ${
            api?.tool === tool
              ? "bg-[#ece9ff] text-[#6965db]"
              : "text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      ))}
      <CanvasMoreMenu blockId={blockId} />
    </div>
  );
}
