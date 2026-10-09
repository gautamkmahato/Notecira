import { createId } from "@/lib/domain/ids";
import type { Block, BlockAttrs } from "@/lib/domain/types";
import { defaultCornerRadius } from "./element-meta";
import {
  CANVAS_DEFAULT_FILL,
  CANVAS_DEFAULT_STROKE,
  CANVAS_DEFAULT_STROKE_WIDTH,
  CANVAS_DOC_MIN_HEIGHT,
  CANVAS_HAND_FONT,
  CANVAS_INFINITE_SIZE,
  CANVAS_MIN_SIZE,
  CANVAS_STICKY_FILL,
  type CanvasElement,
  type CanvasMode,
  type CanvasShapeType,
  type CanvasStrokeStyle,
  type CanvasTool,
} from "./types";

const SHAPE_TYPES: CanvasShapeType[] = [
  "text",
  "rectangle",
  "square",
  "decision",
  "circle",
  "arrow",
  "line",
  "sticky",
  "image",
];

export function getCanvasMode(attrs: BlockAttrs): CanvasMode {
  return attrs.canvasMode === "doc_width" ? "doc_width" : "infinite";
}

export function getCanvasElements(block: Block): CanvasElement[] {
  const stored = block.attrs.canvasElements;
  if (!Array.isArray(stored)) {
    return [];
  }

  return stored
    .map((raw) => normalizeCanvasElement(raw))
    .filter((element): element is CanvasElement => element !== null);
}

function normalizeCanvasElement(raw: unknown): CanvasElement | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const entry = raw as Record<string, unknown>;
  const type = entry.type;

  if (!SHAPE_TYPES.includes(type as CanvasShapeType)) {
    return null;
  }

  const x = Number(entry.x);
  const y = Number(entry.y);
  const width = Number(entry.width);
  const height = Number(entry.height);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }

  const shapeType = type as CanvasShapeType;

  if (shapeType === "image") {
    const imageSrc =
      typeof entry.imageSrc === "string" ? entry.imageSrc : "";
    if (!imageSrc) {
      return null;
    }
  }

  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    type: shapeType,
    x,
    y,
    width: Math.max(CANVAS_MIN_SIZE, width),
    height: Math.max(CANVAS_MIN_SIZE, height),
    rotation: Number.isFinite(Number(entry.rotation))
      ? Number(entry.rotation)
      : 0,
    strokeColor:
      typeof entry.strokeColor === "string"
        ? entry.strokeColor
        : CANVAS_DEFAULT_STROKE,
    fillColor:
      typeof entry.fillColor === "string"
        ? entry.fillColor
        : shapeType === "sticky"
          ? CANVAS_STICKY_FILL
          : CANVAS_DEFAULT_FILL,
    strokeWidth: Number.isFinite(Number(entry.strokeWidth))
      ? Number(entry.strokeWidth)
      : CANVAS_DEFAULT_STROKE_WIDTH,
    text: typeof entry.text === "string" ? entry.text : "",
    fontSize: Number.isFinite(Number(entry.fontSize))
      ? Number(entry.fontSize)
      : shapeType === "sticky"
        ? 18
        : 20,
    fontFamily:
      typeof entry.fontFamily === "string"
        ? entry.fontFamily
        : CANVAS_HAND_FONT,
    strokeStyle:
      entry.strokeStyle === "dashed" ||
      entry.strokeStyle === "dotted" ||
      entry.strokeStyle === "solid"
        ? (entry.strokeStyle as CanvasStrokeStyle)
        : "solid",
    cornerRadius: Number.isFinite(Number(entry.cornerRadius))
      ? Number(entry.cornerRadius)
      : defaultCornerRadius(shapeType),
    bold: Boolean(entry.bold),
    italic: Boolean(entry.italic),
    underline: Boolean(entry.underline),
    textAlign:
      entry.textAlign === "center" ||
      entry.textAlign === "right" ||
      entry.textAlign === "left"
        ? entry.textAlign
        : "left",
    imageSrc:
      shapeType === "image" && typeof entry.imageSrc === "string"
        ? entry.imageSrc
        : undefined,
    startX:
      Number.isFinite(Number(entry.startX)) ? Number(entry.startX) : undefined,
    startY:
      Number.isFinite(Number(entry.startY)) ? Number(entry.startY) : undefined,
    endX: Number.isFinite(Number(entry.endX)) ? Number(entry.endX) : undefined,
    endY: Number.isFinite(Number(entry.endY)) ? Number(entry.endY) : undefined,
  };
}

export function createImageElement(
  box: { x: number; y: number; width: number; height: number },
  imageSrc: string,
): CanvasElement {
  const width = Math.max(CANVAS_MIN_SIZE, box.width);
  const height = Math.max(CANVAS_MIN_SIZE, box.height);

  return {
    id: createId(),
    type: "image",
    x: box.x,
    y: box.y,
    width,
    height,
    rotation: 0,
    strokeColor: CANVAS_DEFAULT_STROKE,
    fillColor: "transparent",
    strokeWidth: 0,
    text: "",
    fontSize: 20,
    fontFamily: CANVAS_HAND_FONT,
    strokeStyle: "solid",
    cornerRadius: 0,
    bold: false,
    italic: false,
    underline: false,
    imageSrc,
  };
}

export function createCanvasElement(
  type: CanvasShapeType,
  box: { x: number; y: number; width: number; height: number },
  extra?: Partial<CanvasElement>,
): CanvasElement {
  const width = Math.max(CANVAS_MIN_SIZE, box.width);
  const height = Math.max(CANVAS_MIN_SIZE, box.height);
  const isSquare = type === "square";

  return {
    id: createId(),
    type,
    x: box.x,
    y: box.y,
    width: isSquare ? Math.max(width, height) : width,
    height: isSquare ? Math.max(width, height) : height,
    rotation: 0,
    strokeColor: CANVAS_DEFAULT_STROKE,
    fillColor:
      type === "sticky"
        ? CANVAS_STICKY_FILL
        : type === "text"
          ? "transparent"
          : CANVAS_DEFAULT_FILL,
    strokeWidth: CANVAS_DEFAULT_STROKE_WIDTH,
    text: type === "text" || type === "sticky" ? "" : "",
    fontSize: type === "sticky" ? 18 : 20,
    fontFamily: CANVAS_HAND_FONT,
    strokeStyle: "solid",
    cornerRadius: defaultCornerRadius(type),
    bold: false,
    italic: false,
    underline: false,
    textAlign: "left",
    ...extra,
  };
}

export function updateCanvasElement(
  elements: CanvasElement[],
  id: string,
  patch: Partial<CanvasElement>,
): CanvasElement[] {
  return elements.map((element) =>
    element.id === id ? { ...element, ...patch, id: element.id } : element,
  );
}

export function removeCanvasElement(
  elements: CanvasElement[],
  id: string,
): CanvasElement[] {
  return elements.filter((element) => element.id !== id);
}

export function canvasContentSize(
  elements: CanvasElement[],
  mode: CanvasMode,
  containerWidth: number,
  docModeMinHeightPx?: number,
): { width: number; height: number } {
  const padding = 48;
  const maxRight = elements.reduce(
    (max, element) => Math.max(max, element.x + element.width),
    0,
  );
  const maxBottom = elements.reduce(
    (max, element) => Math.max(max, element.y + element.height),
    0,
  );

  if (mode === "doc_width") {
    const contentHeight = Math.max(CANVAS_DOC_MIN_HEIGHT, maxBottom + padding);
    const minHeight = Math.max(
      CANVAS_DOC_MIN_HEIGHT,
      docModeMinHeightPx ?? CANVAS_DOC_MIN_HEIGHT,
    );
    return {
      width: Math.max(containerWidth, 1),
      height: Math.max(contentHeight, minHeight),
    };
  }

  return {
    width: CANVAS_INFINITE_SIZE,
    height: Math.max(CANVAS_INFINITE_SIZE, maxBottom + padding),
  };
}

export function clampBoxToDocWidth(
  box: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
) {
  const width = Math.min(box.width, canvasWidth);
  const x = Math.max(0, Math.min(box.x, canvasWidth - width));
  return { ...box, x, width };
}

export function toolToShapeType(
  tool: CanvasTool,
  lockSquare: boolean,
): CanvasShapeType | null {
  switch (tool) {
    case "rectangle":
      return lockSquare ? "square" : "rectangle";
    case "decision":
      return "decision";
    case "circle":
      return "circle";
    case "arrow":
      return "arrow";
    case "line":
      return "line";
    case "text":
      return "text";
    case "sticky":
      return "sticky";
    default:
      return null;
  }
}
