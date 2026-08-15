"use client";

import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FIXED_COLUMN_WIDTH_PX } from "@/lib/layout";

const SCROLL_EDGE_THRESHOLD_PX = 8;

type CanvasScrollControlsProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  enabled?: boolean;
};

function getScrollStep(container: HTMLElement): number {
  const track = container.firstElementChild;
  if (!track) return FIXED_COLUMN_WIDTH_PX + 16;

  const column = track.children[0] as HTMLElement | undefined;
  if (!column) return FIXED_COLUMN_WIDTH_PX + 16;

  const style = getComputedStyle(track);
  const gap = parseFloat(style.columnGap || style.gap) || 16;
  return column.offsetWidth + gap;
}

export function CanvasScrollControls({
  scrollRef,
  enabled = true,
}: CanvasScrollControlsProps) {
  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const container = scrollRef.current;
    if (!container || !enabled) {
      setVisible(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > SCROLL_EDGE_THRESHOLD_PX;

    setVisible(hasOverflow);
    setCanScrollLeft(scrollLeft > SCROLL_EDGE_THRESHOLD_PX);
    setCanScrollRight(scrollLeft < maxScroll - SCROLL_EDGE_THRESHOLD_PX);
  }, [scrollRef, enabled]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !enabled) return;

    update();

    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    return () => {
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [scrollRef, enabled, update]);

  const scrollByColumn = useCallback(
    (direction: -1 | 1) => {
      const container = scrollRef.current;
      if (!container) return;

      const step = getScrollStep(container);
      container.scrollBy({
        left: direction * step,
        behavior: "smooth",
      });
    },
    [scrollRef],
  );

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => scrollByColumn(-1)}
        disabled={!canScrollLeft}
        className="canvas-scroll-btn absolute left-4 top-1/2 z-[var(--z-5)] -translate-y-1/2"
        aria-label="Scroll left one document"
      >
        <ChevronLeft size={20} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={() => scrollByColumn(1)}
        disabled={!canScrollRight}
        className="canvas-scroll-btn absolute right-4 top-1/2 z-[var(--z-5)] -translate-y-1/2"
        aria-label="Scroll right one document"
      >
        <ChevronRight size={20} strokeWidth={2} />
      </button>
    </>
  );
}
