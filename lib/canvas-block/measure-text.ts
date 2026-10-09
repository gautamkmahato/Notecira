import { CANVAS_HAND_FONT, CANVAS_MIN_SIZE, type CanvasElement } from "./types";

export function measureTextElementHeight(
  element: CanvasElement,
  text: string,
  widthPx: number,
): number {
  if (typeof document === "undefined") {
    return Math.max(CANVAS_MIN_SIZE, element.height);
  }

  const fontSize = element.fontSize ?? 20;
  const fontFamily = element.fontFamily ?? CANVAS_HAND_FONT;
  const fontWeight = element.bold ? "700" : "400";
  const fontStyle = element.italic ? "italic" : "normal";
  const padding = element.type === "sticky" ? 20 : 8;
  const lineHeight = 1.35;

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.left = "-9999px";
  probe.style.top = "0";
  probe.style.width = `${Math.max(1, widthPx - padding)}px`;
  probe.style.fontSize = `${fontSize}px`;
  probe.style.fontFamily = fontFamily;
  probe.style.fontWeight = fontWeight;
  probe.style.fontStyle = fontStyle;
  probe.style.lineHeight = String(lineHeight);
  probe.style.whiteSpace = "pre-wrap";
  probe.style.wordBreak = "break-word";
  probe.style.boxSizing = "border-box";
  probe.textContent = text || " ";

  document.body.appendChild(probe);
  const measured = probe.getBoundingClientRect().height + padding;
  document.body.removeChild(probe);

  const min =
    element.type === "sticky"
      ? Math.max(120, element.height)
      : Math.max(32, element.height);

  return Math.max(CANVAS_MIN_SIZE, Math.ceil(measured), min);
}
