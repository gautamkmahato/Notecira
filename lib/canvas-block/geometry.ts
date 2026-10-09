import { getLineEndpoints, isLinearElement } from "./line-geometry";
import { CANVAS_MIN_SIZE, type CanvasElement } from "./types";

const LINE_HIT_THRESHOLD = 10;

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export type Point = { x: number; y: number };

export type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function normalizeDragBox(
  start: Point,
  current: Point,
  lockSquare: boolean,
): NormalizedBox {
  let x = Math.min(start.x, current.x);
  let y = Math.min(start.y, current.y);
  let width = Math.abs(current.x - start.x);
  let height = Math.abs(current.y - start.y);

  if (lockSquare) {
    const size = Math.max(width, height, CANVAS_MIN_SIZE);
    width = size;
    height = size;
    if (current.x < start.x) x = start.x - size;
    if (current.y < start.y) y = start.y - size;
  }

  return {
    x,
    y,
    width: Math.max(CANVAS_MIN_SIZE, width),
    height: Math.max(CANVAS_MIN_SIZE, height),
  };
}

export function hitTestElement(
  elements: CanvasElement[],
  point: Point,
): CanvasElement | null {
  for (let i = elements.length - 1; i >= 0; i -= 1) {
    const element = elements[i];

    if (isLinearElement(element.type)) {
      const { x1, y1, x2, y2 } = getLineEndpoints(element);
      if (
        distanceToSegment(point.x, point.y, x1, y1, x2, y2) <=
        LINE_HIT_THRESHOLD + element.strokeWidth / 2
      ) {
        return element;
      }
      continue;
    }

    if (
      point.x >= element.x &&
      point.y >= element.y &&
      point.x <= element.x + element.width &&
      point.y <= element.y + element.height
    ) {
      return element;
    }
  }

  return null;
}

export function pointerDistance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export const POINTER_DRAG_THRESHOLD = 5;

export function boxesIntersect(a: NormalizedBox, b: NormalizedBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function marqueeSelectionBox(start: Point, current: Point): NormalizedBox {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  return {
    x,
    y,
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  };
}

export function getElementAxisAlignedBounds(
  element: CanvasElement,
): NormalizedBox {
  if (isLinearElement(element.type)) {
    const { x1, y1, x2, y2 } = getLineEndpoints(element);
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    return {
      x,
      y,
      width: Math.max(1, Math.abs(x2 - x1)),
      height: Math.max(1, Math.abs(y2 - y1)),
    };
  }

  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

export function selectElementIdsInBox(
  elements: CanvasElement[],
  box: NormalizedBox,
): string[] {
  return elements
    .filter((element) =>
      boxesIntersect(getElementAxisAlignedBounds(element), box),
    )
    .map((element) => element.id);
}

export function unionElementBounds(
  elements: CanvasElement[],
): NormalizedBox | null {
  if (elements.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    const bounds = getElementAxisAlignedBounds(element);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function clientToCanvasPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Point {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const scaleX = viewBox.width / rect.width;
  const scaleY = viewBox.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX + viewBox.x,
    y: (clientY - rect.top) * scaleY + viewBox.y,
  };
}
