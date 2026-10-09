"use client";

import { useEffect, useRef, useState } from "react";
import type { Block } from "@/lib/domain/types";
import { findScrollParent } from "@/lib/canvas-block/find-scroll-parent";
import { CanvasSelectionSubToolbar } from "./CanvasSelectionSubToolbar";
import { CanvasSurface } from "./CanvasSurface";

type CanvasBlockProps = {
  block: Block;
  isSelected?: boolean;
  editable?: boolean;
  onFocused: () => void;
};

export function CanvasBlock({
  block,
  isSelected = false,
  editable = true,
  onFocused,
}: CanvasBlockProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [panelLeft, setPanelLeft] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updatePosition = () => {
      const rect = root.getBoundingClientRect();
      const inset = 12;
      const minLeft = 80;
      setPanelLeft(Math.max(minLeft, rect.left + inset));
    };

    updatePosition();

    const scrollParent = findScrollParent(root);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    scrollParent?.addEventListener("scroll", updatePosition, { passive: true });

    const observer = new ResizeObserver(updatePosition);
    observer.observe(root);
    if (scrollParent) {
      observer.observe(scrollParent);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      scrollParent?.removeEventListener("scroll", updatePosition);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={rootRef} className="relative -ml-12 w-[calc(100%+3rem)] min-w-0">
        <CanvasSurface
          block={block}
          isActive={isSelected}
          editable={editable}
          onFocused={onFocused}
        />
      </div>
      {panelLeft !== null ? (
        <CanvasSelectionSubToolbar
          blockId={block.id}
          layout="floating"
          className="pointer-events-auto fixed z-[var(--z-8)] -translate-y-1/2"
          style={{ left: panelLeft, top: "50%" }}
        />
      ) : null}
    </>
  );
}
