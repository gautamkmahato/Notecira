import type { CanvasElement, CanvasShapeType } from "./types";
import { CANVAS_SHAPE_RADIUS, CANVAS_STICKY_FILL } from "./types";

export function isTextLikeElement(element: CanvasElement): boolean {
  return element.type === "text" || element.type === "sticky";
}

export function isImageElement(element: CanvasElement): boolean {
  return element.type === "image";
}

export function isShapeElement(element: CanvasElement): boolean {
  return !isTextLikeElement(element) && !isImageElement(element);
}

export function defaultCornerRadius(type: CanvasShapeType): number {
  if (type === "sticky") return 12;
  if (type === "text") return 6;
  if (type === "line" || type === "arrow") return 0;
  if (type === "image") return 0;
  return CANVAS_SHAPE_RADIUS;
}

export function elementCornerRadius(element: CanvasElement): number {
  if (typeof element.cornerRadius === "number" && element.cornerRadius >= 0) {
    return element.cornerRadius;
  }
  return defaultCornerRadius(element.type);
}

export function strokeDashArray(
  style: CanvasElement["strokeStyle"],
): string | undefined {
  switch (style) {
    case "dashed":
      return "10 6";
    case "dotted":
      return "2 6";
    default:
      return undefined;
  }
}

export function stickyFill(element: CanvasElement): string {
  if (element.fillColor && element.fillColor !== "transparent") {
    return element.fillColor;
  }
  return CANVAS_STICKY_FILL;
}
