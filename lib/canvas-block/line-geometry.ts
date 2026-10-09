import { CANVAS_MIN_SIZE, type CanvasElement, type CanvasShapeType } from "./types";

export type LineEndpoints = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const LINE_HIT_PADDING = 8;

export function isLinearElement(
  type: CanvasShapeType,
): type is "line" | "arrow" {
  return type === "line" || type === "arrow";
}

export function getLineEndpoints(element: CanvasElement): LineEndpoints {
  if (
    isLinearElement(element.type) &&
    element.startX != null &&
    element.startY != null &&
    element.endX != null &&
    element.endY != null
  ) {
    return {
      x1: element.startX,
      y1: element.startY,
      x2: element.endX,
      y2: element.endY,
    };
  }

  if (isLinearElement(element.type)) {
    const y = element.y + element.height / 2;
    return {
      x1: element.x,
      y1: y,
      x2: element.x + element.width,
      y2: y,
    };
  }

  return {
    x1: element.x,
    y1: element.y,
    x2: element.x + element.width,
    y2: element.y + element.height,
  };
}

export function elementPatchFromEndpoints(
  element: CanvasElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Pick<
  CanvasElement,
  "x" | "y" | "width" | "height" | "startX" | "startY" | "endX" | "endY"
> {
  const minX = Math.min(x1, x2) - LINE_HIT_PADDING;
  const minY = Math.min(y1, y2) - LINE_HIT_PADDING;
  const maxX = Math.max(x1, x2) + LINE_HIT_PADDING;
  const maxY = Math.max(y1, y2) + LINE_HIT_PADDING;

  return {
    x: minX,
    y: minY,
    width: Math.max(CANVAS_MIN_SIZE, maxX - minX),
    height: Math.max(CANVAS_MIN_SIZE, maxY - minY),
    startX: x1,
    startY: y1,
    endX: x2,
    endY: y2,
  };
}

export function createLinearElementPatch(
  type: "line" | "arrow",
  start: { x: number; y: number },
  end: { x: number; y: number },
): Pick<
  CanvasElement,
  "x" | "y" | "width" | "height" | "startX" | "startY" | "endX" | "endY"
> {
  let x2 = end.x;
  let y2 = end.y;
  const dist = Math.hypot(x2 - start.x, y2 - start.y);
  if (dist < CANVAS_MIN_SIZE) {
    const angle = dist === 0 ? 0 : Math.atan2(y2 - start.y, x2 - start.x);
    x2 = start.x + Math.cos(angle) * CANVAS_MIN_SIZE;
    y2 = start.y + Math.sin(angle) * CANVAS_MIN_SIZE;
  }

  return elementPatchFromEndpoints(
    { ...({} as CanvasElement), type },
    start.x,
    start.y,
    x2,
    y2,
  );
}

export type LinearResizeHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

export function applyLinearResize(
  origin: CanvasElement,
  handle: LinearResizeHandle,
  current: { x: number; y: number },
): Pick<
  CanvasElement,
  "x" | "y" | "width" | "height" | "startX" | "startY" | "endX" | "endY"
> {
  const { x1, y1, x2, y2 } = getLineEndpoints(origin);
  let nextX1 = x1;
  let nextY1 = y1;
  let nextX2 = x2;
  let nextY2 = y2;

  if (handle.includes("w") || handle === "nw" || handle === "sw") {
    nextX1 = current.x;
  }
  if (handle.includes("e") || handle === "ne" || handle === "se") {
    nextX2 = current.x;
  }
  if (handle.includes("n") || handle === "nw" || handle === "ne") {
    nextY1 = current.y;
  }
  if (handle.includes("s") || handle === "sw" || handle === "se") {
    nextY2 = current.y;
  }

  return elementPatchFromEndpoints(origin, nextX1, nextY1, nextX2, nextY2);
}

export function moveElementPatch(
  element: CanvasElement,
  dx: number,
  dy: number,
): Partial<CanvasElement> {
  if (!isLinearElement(element.type)) {
    return { x: element.x + dx, y: element.y + dy };
  }

  const { x1, y1, x2, y2 } = getLineEndpoints(element);
  return elementPatchFromEndpoints(element, x1 + dx, y1 + dy, x2 + dx, y2 + dy);
}

export function elementRotationCenter(element: CanvasElement) {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  };
}

export function rotatePoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  degrees: number,
): { x: number; y: number } {
  if (!degrees) return point;
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function rotationHandlePosition(element: CanvasElement) {
  const center = elementRotationCenter(element);
  const local = { x: center.x, y: element.y - 28 };
  return rotatePoint(local, center, element.rotation ?? 0);
}

export function svgRotationTransform(element: CanvasElement): string | undefined {
  const r = element.rotation ?? 0;
  if (!r) return undefined;
  const center = elementRotationCenter(element);
  return `rotate(${r} ${center.x} ${center.y})`;
}

export function canvasPointToElementLocal(
  element: CanvasElement,
  point: { x: number; y: number },
) {
  const center = elementRotationCenter(element);
  return rotatePoint(point, center, -(element.rotation ?? 0));
}

export type ResizeHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

export function resizeHandlePositions(element: CanvasElement): {
  handle: ResizeHandle;
  x: number;
  y: number;
}[] {
  const { x, y, width, height } = element;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return [
    { handle: "nw", x, y },
    { handle: "n", x: cx, y },
    { handle: "ne", x: x + width, y },
    { handle: "e", x: x + width, y: cy },
    { handle: "se", x: x + width, y: y + height },
    { handle: "s", x: cx, y: y + height },
    { handle: "sw", x, y: y + height },
    { handle: "w", x, y: cy },
  ];
}

export function hitResizeHandleAtPoint(
  element: CanvasElement,
  point: { x: number; y: number },
  hitSize = 10,
): ResizeHandle | null {
  const local = canvasPointToElementLocal(element, point);
  const half = hitSize / 2;

  for (const entry of resizeHandlePositions(element)) {
    if (
      local.x >= entry.x - half &&
      local.x <= entry.x + half &&
      local.y >= entry.y - half &&
      local.y <= entry.y + half
    ) {
      return entry.handle;
    }
  }

  return null;
}

export function hitRotateHandleAtPoint(
  element: CanvasElement,
  point: { x: number; y: number },
  hitRadius = 12,
) {
  const handle = rotationHandlePosition(element);
  return Math.hypot(point.x - handle.x, point.y - handle.y) <= hitRadius;
}

export function resizeHandleCursor(handle: ResizeHandle): string {
  switch (handle) {
    case "nw":
    case "se":
      return "nwse-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    default:
      return "default";
  }
}
