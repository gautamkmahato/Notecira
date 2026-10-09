"use client";

import { useEffect, useRef, useState } from "react";

const LOG_PREFIX = "[recreate-text/page]";

type BBox = {
  topLeftX: number;
  topLeftY: number;
  bottomRightX: number;
  bottomRightY: number;
};

type OCRBlock = {
  label?: string;
  text?: string;
  bbox: BBox;
  confidence?: unknown;
};

type TextElement = {
  id: string;
  text: string;
  role: string;
  bbox: BBox;
};

type TextStyle = {
  text: string;
  font_family: string;
  font_size: number;
  font_weight: number;
  color: string;
  letter_spacing: number;
  line_height: number;
  alignment: "left" | "center" | "right" | string;
  bbox?: BBox;
};

type ViewTab = "ocr" | "typography" | "recreate" | "refine";

function log(
  message: string,
  data?: unknown
) {
  if (data === undefined) {
    console.log(
      `${LOG_PREFIX} ${message}`
    );
    return;
  }

  console.log(
    `${LOG_PREFIX} ${message}`,
    data
  );
}

function normalizeBBox(
  raw: unknown
): BBox | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  const bbox =
    raw as Record<
      string,
      unknown
    >;

  /*
   * Our API already normalizes these,
   * but keep this tolerant.
   */

  if (
    typeof bbox.topLeftX ===
      "number" &&
    typeof bbox.topLeftY ===
      "number" &&
    typeof bbox.bottomRightX ===
      "number" &&
    typeof bbox.bottomRightY ===
      "number"
  ) {
    return {
      topLeftX: bbox.topLeftX,
      topLeftY: bbox.topLeftY,
      bottomRightX:
        bbox.bottomRightX,
      bottomRightY:
        bbox.bottomRightY,
    };
  }

  return null;
}

function normalizeBlocks(
  rawBlocks: unknown
): OCRBlock[] {
  if (!Array.isArray(rawBlocks)) {
    return [];
  }

  return rawBlocks
    .map((block) => {
      if (
        !block ||
        typeof block !==
          "object"
      ) {
        return null;
      }

      const entry =
        block as Record<
          string,
          unknown
        >;

      const bbox =
        normalizeBBox(
          entry.bbox
        );

      if (!bbox) {
        return null;
      }

      return {
        label:
          typeof entry.label ===
          "string"
            ? entry.label
            : undefined,

        text:
          typeof entry.text ===
          "string"
            ? entry.text
            : undefined,

        bbox,

        confidence:
          entry.confidence ??
          null,
      };
    })
    .filter(
      Boolean
    ) as OCRBlock[];
}

function normalizeTextElements(
  rawElements: unknown
): TextElement[] {
  if (
    !Array.isArray(
      rawElements
    )
  ) {
    return [];
  }

  return rawElements
    .map((element, index) => {
      if (
        !element ||
        typeof element !==
          "object"
      ) {
        return null;
      }

      const entry =
        element as Record<
          string,
          unknown
        >;

      const bbox =
        normalizeBBox(
          entry.bbox
        );

      if (!bbox) {
        return null;
      }

      return {
        id:
          typeof entry.id ===
          "string"
            ? entry.id
            : `text-${index}`,

        text:
          typeof entry.text ===
          "string"
            ? entry.text
            : "",

        role:
          typeof entry.role ===
          "string"
            ? entry.role
            : "other",

        bbox,
      };
    })
    .filter(
      Boolean
    ) as TextElement[];
}

function getFontWeight(role: string): number {
  if (role === "title" || role === "heading") {
    return 700;
  }
  if (
    role === "subheading" ||
    role === "button" ||
    role === "navigation"
  ) {
    return 600;
  }
  return 400;
}

function getRecreationItems(
  textElements: TextElement[],
  blocks: OCRBlock[],
): TextElement[] {
  /*
   * Native OCR bboxes are the real geometry.
   * Design-annotation boxes are LLM estimates and
   * will place text in the wrong size/spot.
   */
  if (blocks.length > 0) {
    return blocks
      .filter((block) => block.text?.trim())
      .map((block, index) => ({
        id: `block-${index}`,
        text: block.text!.trim(),
        role: block.label || "other",
        bbox: block.bbox,
      }));
  }

  return textElements.filter((element) => element.text.trim());
}

function getMeasureContext(): CanvasRenderingContext2D | null {
  const measureCanvas = document.createElement("canvas");
  return measureCanvas.getContext("2d");
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = words[0];

    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;

      if (ctx.measureText(next).width <= maxWidth) {
        current = next;
      } else {
        lines.push(current);
        current = words[i];
      }
    }

    lines.push(current);
  }

  return lines;
}

function bboxIoU(a: BBox, b: BBox): number {
  const left = Math.max(a.topLeftX, b.topLeftX);
  const top = Math.max(a.topLeftY, b.topLeftY);
  const right = Math.min(a.bottomRightX, b.bottomRightX);
  const bottom = Math.min(a.bottomRightY, b.bottomRightY);
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
  const areaA =
    Math.max(0, a.bottomRightX - a.topLeftX) *
    Math.max(0, a.bottomRightY - a.topLeftY);
  const areaB =
    Math.max(0, b.bottomRightX - b.topLeftX) *
    Math.max(0, b.bottomRightY - b.topLeftY);
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

function normalizeMatchText(text: string): string {
  return visibleText(text)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getStyleForItem(
  item: TextElement,
  styles: TextStyle[],
  used: Set<number>,
): TextStyle | null {
  let bestIndex = -1;
  let bestIoU = 0.3;

  styles.forEach((style, index) => {
    if (used.has(index) || !style.bbox) {
      return;
    }

    const iou = bboxIoU(item.bbox, style.bbox);

    if (iou > bestIoU) {
      bestIoU = iou;
      bestIndex = index;
    }
  });

  if (bestIndex >= 0) {
    used.add(bestIndex);
    return styles[bestIndex];
  }

  const needle = normalizeMatchText(item.text);
  const textIndex = styles.findIndex(
    (style, index) =>
      !used.has(index) && normalizeMatchText(style.text) === needle,
  );

  if (textIndex >= 0) {
    used.add(textIndex);
    return styles[textIndex];
  }

  return null;
}

function isNonVisualText(text: string): boolean {
  const value = text.trim();

  if (!value) {
    return true;
  }

  if (/^!\[.*\]\(.*\)/.test(value)) {
    return true;
  }

  if (/^!\[/.test(value)) {
    return true;
  }

  return false;
}

function visibleText(text: string): string {
  return text.replace(/^#{1,6}\s+/gm, "");
}

function resolveCoordSpace(
  items: TextElement[],
  ocrSize: { width: number; height: number },
  sourceSize: { width: number; height: number },
): { width: number; height: number } {
  let maxX = 0;
  let maxY = 0;

  for (const item of items) {
    maxX = Math.max(maxX, item.bbox.bottomRightX);
    maxY = Math.max(maxY, item.bbox.bottomRightY);
  }

  const fits = (
    size: { width: number; height: number },
  ) =>
    size.width > 0 &&
    size.height > 0 &&
    maxX <= size.width * 1.05 &&
    maxY <= size.height * 1.05;

  const ocrFits = fits(ocrSize);
  const sourceFits = fits(sourceSize);
  const sameSpace =
    sourceSize.width > 0 &&
    ocrSize.width > 0 &&
    Math.abs(ocrSize.width - sourceSize.width) < 2 &&
    Math.abs(ocrSize.height - sourceSize.height) < 2;

  if (sameSpace && sourceFits) {
    return sourceSize;
  }

  if (sourceFits && !ocrFits) {
    return sourceSize;
  }

  if (ocrFits) {
    return ocrSize;
  }

  if (maxX <= 1000.5 && maxY <= 1000.5) {
    return { width: 1000, height: 1000 };
  }

  return sourceSize.width > 0 ? sourceSize : ocrSize;
}

function mapBoxToCanvas(
  bbox: BBox,
  coordSpace: { width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
) {
  const scaleX =
    coordSpace.width > 0 ? canvasWidth / coordSpace.width : 1;
  const scaleY =
    coordSpace.height > 0 ? canvasHeight / coordSpace.height : 1;

  return {
    x: bbox.topLeftX * scaleX,
    y: bbox.topLeftY * scaleY,
    width: Math.max(1, (bbox.bottomRightX - bbox.topLeftX) * scaleX),
    height: Math.max(1, (bbox.bottomRightY - bbox.topLeftY) * scaleY),
    scaleX,
    scaleY,
  };
}

function measureLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
) {
  let width = 0;
  let ascent = fontSize * 0.8;
  let descent = fontSize * 0.2;

  for (const line of lines) {
    const metrics = ctx.measureText(line || " ");
    const extra =
      letterSpacing * Math.max(0, (line || "").length - 1);

    width = Math.max(width, metrics.width + extra);

    if (metrics.actualBoundingBoxAscent > 0) {
      ascent = Math.max(ascent, metrics.actualBoundingBoxAscent);
    }

    if (metrics.actualBoundingBoxDescent > 0) {
      descent = Math.max(descent, metrics.actualBoundingBoxDescent);
    }
  }

  const height =
    lines.length <= 1
      ? ascent + descent
      : ascent + (lines.length - 1) * fontSize * lineHeight + descent;

  return { width, height, ascent, descent };
}

function fitTextToBox(
  text: string,
  boxWidth: number,
  boxHeight: number,
  fontFamily: string,
  fontWeight: number,
  lineHeight: number,
  letterSpacing: number,
): { fontSize: number; lines: string[] } {
  const ctx = getMeasureContext();
  const fallbackLines = text.split("\n");

  if (!ctx || boxWidth <= 0 || boxHeight <= 0 || !text.trim()) {
    return {
      fontSize: Math.max(1, boxHeight),
      lines: fallbackLines,
    };
  }

  const hasBreaks = text.includes("\n");
  ctx.font = `${fontWeight} ${Math.max(1, boxHeight)}px "${fontFamily}", Arial, sans-serif`;
  const singleWidth =
    ctx.measureText(text.replace(/\n/g, " ")).width +
    letterSpacing * Math.max(0, text.replace(/\n/g, " ").length - 1);
  const shouldWrap =
    hasBreaks ||
    (singleWidth > boxWidth * 1.02 && boxHeight > boxWidth * 0.28);

  const layout = (size: number) => {
    ctx.font = `${fontWeight} ${size}px "${fontFamily}", Arial, sans-serif`;
    const lines = hasBreaks
      ? text.split("\n")
      : shouldWrap
        ? wrapLines(ctx, text, Math.max(1, boxWidth - letterSpacing))
        : [text];
    const measured = measureLines(
      ctx,
      lines,
      size,
      lineHeight,
      letterSpacing,
    );

    return {
      lines,
      fits:
        measured.width <= boxWidth + 0.75 &&
        measured.height <= boxHeight + 0.75,
    };
  };

  const explicitLines = Math.max(1, fallbackLines.length);
  let lo = 1;
  let hi = Math.max(
    2,
    Math.floor(boxHeight / (explicitLines * 0.65)),
  );
  let best = {
    fontSize: 1,
    lines: fallbackLines,
  };

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const result = layout(mid);

    if (result.fits) {
      best = { fontSize: mid, lines: result.lines };
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best.fontSize <= 1) {
    const size = Math.max(1, Math.floor(boxHeight * 0.8));
    best = {
      fontSize: size,
      lines: layout(size).lines,
    };
  }

  return best;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function fillStyledText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
) {
  if (!letterSpacing) {
    ctx.fillText(text, x, y);
    return;
  }

  const previousAlign = ctx.textAlign;
  let cursorX = x;

  if (previousAlign === "center" || previousAlign === "right") {
    const extra = letterSpacing * Math.max(0, text.length - 1);
    const total = ctx.measureText(text).width + extra;
    cursorX = previousAlign === "center" ? x - total / 2 : x - total;
  }

  ctx.textAlign = "left";

  for (const character of text) {
    ctx.fillText(character, cursorX, y);
    cursorX += ctx.measureText(character).width + letterSpacing;
  }

  ctx.textAlign = previousAlign;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toDataUrl(src: string): Promise<string> {
  if (src.startsWith("data:")) {
    return Promise.resolve(src);
  }

  return fetch(src)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Failed to read image"));
          reader.readAsDataURL(blob);
        }),
    );
}

async function renderHtmlOnBackground(
  bgImageUrl: string,
  html: string,
): Promise<string> {
  const bgImage = await loadImage(bgImageUrl);
  const width = bgImage.naturalWidth;
  const height = bgImage.naturalHeight;

  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;height:${height}px;overflow:hidden;margin:0;padding:0;`;

  const overlay = document.createElement("div");
  overlay.style.cssText = `position:absolute;left:0;top:0;width:${width}px;height:${height}px;margin:0;padding:0;`;
  overlay.innerHTML = html;
  host.appendChild(overlay);
  document.body.appendChild(host);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create canvas context");
    }

    ctx.drawImage(bgImage, 0, 0, width, height);
    ctx.textBaseline = "top";

    const hostRect = host.getBoundingClientRect();
    const elements = Array.from(overlay.querySelectorAll("*"));

    for (const node of elements) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      if (node.tagName === "IMG" || node.tagName === "SVG") {
        continue;
      }

      if (node.children.length > 0) {
        continue;
      }

      const text = (node.textContent || "").trimEnd();

      if (!text.trim()) {
        continue;
      }

      const style = window.getComputedStyle(node);

      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        continue;
      }

      const rect = node.getBoundingClientRect();
      const x = rect.left - hostRect.left;
      const y = rect.top - hostRect.top;
      const boxWidth = rect.width;
      const boxHeight = rect.height;

      if (boxWidth <= 0 || boxHeight <= 0) {
        continue;
      }

      const fontSize = parseFloat(style.fontSize) || 16;
      const letterSpacing =
        style.letterSpacing === "normal"
          ? 0
          : parseFloat(style.letterSpacing) || 0;
      const parsedLineHeight = parseFloat(style.lineHeight);
      const lineHeight =
        style.lineHeight === "normal" || !Number.isFinite(parsedLineHeight)
          ? 1.2
          : parsedLineHeight / fontSize;
      const alignment =
        style.textAlign === "center" || style.textAlign === "right"
          ? style.textAlign
          : "left";

      ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      ctx.fillStyle = style.color;
      ctx.textAlign = alignment;

      const drawX =
        alignment === "center"
          ? x + boxWidth / 2
          : alignment === "right"
            ? x + boxWidth
            : x;
      const lines = text.includes("\n")
        ? text.split("\n")
        : wrapLines(ctx, text, boxWidth);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, boxWidth, boxHeight);
      ctx.clip();

      let drawY = y;

      for (const line of lines) {
        fillStyledText(ctx, line, drawX, drawY, letterSpacing);
        drawY += fontSize * lineHeight;
      }

      ctx.restore();
    }

    return canvas.toDataURL("image/png");
  } finally {
    host.remove();
  }
}

async function renderRecreatedImage(
  bgImageUrl: string,
  items: TextElement[],
  ocrSize: { width: number; height: number },
  sourceSize: { width: number; height: number },
  styles: TextStyle[],
): Promise<{ dataUrl: string; html: string }> {
  const bgImage = await loadImage(bgImageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = bgImage.naturalWidth;
  canvas.height = bgImage.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  ctx.drawImage(bgImage, 0, 0);

  const drawableItems = items.filter(
    (item) =>
      !isNonVisualText(item.text) && visibleText(item.text).trim(),
  );
  const coordSpace = resolveCoordSpace(
    drawableItems,
    ocrSize,
    sourceSize,
  );
  const usedStyles = new Set<number>();
  const htmlNodes: string[] = [];

  ctx.textBaseline = "alphabetic";

  log("recreate coord space", {
    ocrSize,
    sourceSize,
    coordSpace,
    canvas: { width: canvas.width, height: canvas.height },
    items: drawableItems.length,
  });

  for (const item of drawableItems) {
    const text = visibleText(item.text).trimEnd();
    const style = getStyleForItem(item, styles, usedStyles);
    const box = mapBoxToCanvas(
      item.bbox,
      coordSpace,
      canvas.width,
      canvas.height,
    );

    const fontWeight =
      style?.font_weight ?? getFontWeight(item.role);
    const fontFamily = (style?.font_family || "Arial").replace(
      /"/g,
      "",
    );
    const color = style?.color || "#111111";
    const letterSpacing = (style?.letter_spacing ?? 0) * box.scaleX;
    const lineHeight = style?.line_height || 1.2;
    const alignment =
      style?.alignment === "center" || style?.alignment === "right"
        ? style.alignment
        : "left";

    const fitted = fitTextToBox(
      text,
      box.width,
      box.height,
      fontFamily,
      fontWeight,
      lineHeight,
      letterSpacing,
    );

    htmlNodes.push(
      `<div data-recreate-text="true" style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.width}px;height:${box.height}px;margin:0;padding:0;box-sizing:border-box;overflow:hidden;font-family:'${fontFamily}', Arial, sans-serif;font-size:${fitted.fontSize}px;font-weight:${fontWeight};color:${color};letter-spacing:${letterSpacing}px;line-height:${lineHeight};text-align:${alignment};white-space:${text.includes("\n") ? "pre-line" : "pre-wrap"};">${escapeHtml(text)}</div>`,
    );

    ctx.font = `${fontWeight} ${fitted.fontSize}px "${fontFamily}", Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = alignment;

    const metrics = measureLines(
      ctx,
      fitted.lines,
      fitted.fontSize,
      lineHeight,
      letterSpacing,
    );
    const drawX =
      alignment === "center"
        ? box.x + box.width / 2
        : alignment === "right"
          ? box.x + box.width
          : box.x;

    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.width, box.height);
    ctx.clip();

    let drawY = box.y + metrics.ascent;

    for (const line of fitted.lines) {
      fillStyledText(ctx, line, drawX, drawY, letterSpacing);
      drawY += fitted.fontSize * lineHeight;
    }

    ctx.restore();
  }

  const html = `<div data-recreate-root="true" style="position:relative;width:${canvas.width}px;height:${canvas.height}px;overflow:hidden;margin:0;padding:0;">${htmlNodes.join("")}</div>`;

  return {
    dataUrl: canvas.toDataURL("image/png"),
    html,
  };
}

export default function Home() {
  const [imageUrl, setImageUrl] =
    useState<string | null>(
      null
    );

  const [imageSize, setImageSize] =
    useState({
      width: 0,
      height: 0,
    });

  const [sourceImageSize, setSourceImageSize] =
    useState({
      width: 0,
      height: 0,
    });

  const [blocks, setBlocks] =
    useState<OCRBlock[]>(
      []
    );

  const [
    textElements,
    setTextElements,
  ] = useState<
    TextElement[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [bgImageUrl, setBgImageUrl] =
    useState<string | null>(null);

  const [bgImageSize, setBgImageSize] =
    useState({
      width: 0,
      height: 0,
    });

  const [
    recreatedImageUrl,
    setRecreatedImageUrl,
  ] = useState<string | null>(null);

  const [viewTab, setViewTab] =
    useState<ViewTab>("ocr");

  const [textStyles, setTextStyles] =
    useState<TextStyle[]>([]);

  const [
    generatingRecreation,
    setGeneratingRecreation,
  ] = useState(false);

  const [
    loadingTypography,
    setLoadingTypography,
  ] = useState(false);

  const [overlayHtml, setOverlayHtml] =
    useState("");

  const [refinedHtml, setRefinedHtml] =
    useState("");

  const [refinedImageUrl, setRefinedImageUrl] =
    useState<string | null>(null);

  const [refining, setRefining] =
    useState(false);

  const imageUrlRef =
    useRef<string | null>(
      null
    );

  const bgImageUrlRef =
    useRef<string | null>(
      null
    );

  const recreationItems =
    getRecreationItems(
      textElements,
      blocks
    );

  useEffect(() => {
    log("mounted");

    return () => {
      if (
        imageUrlRef.current
      ) {
        URL.revokeObjectURL(
          imageUrlRef.current
        );
      }

      if (
        bgImageUrlRef.current
      ) {
        URL.revokeObjectURL(
          bgImageUrlRef.current
        );
      }
    };
  }, []);

  function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      imageUrlRef.current
    ) {
      URL.revokeObjectURL(
        imageUrlRef.current
      );
    }

    const url =
      URL.createObjectURL(
        file
      );

    imageUrlRef.current =
      url;

    setImageUrl(url);
    setBlocks([]);
    setTextElements([]);
    setTextStyles([]);
    setRecreatedImageUrl(null);
    setOverlayHtml("");
    setRefinedHtml("");
    setRefinedImageUrl(null);
    setViewTab("ocr");
    setError("");
    setStatus("");

    setImageSize({
      width: 0,
      height: 0,
    });

    setSourceImageSize({
      width: 0,
      height: 0,
    });

    log(
      "image selected",
      {
        name: file.name,
        type: file.type,
        sizeBytes:
          file.size,
      }
    );

    const img =
      new Image();

    img.onload = () => {
      const size = {
        width:
          img.naturalWidth,

        height:
          img.naturalHeight,
      };

      setImageSize(size);
      setSourceImageSize(size);

      log(
        "image loaded",
        size
      );
    };

    img.onerror = () => {
      setError(
        "Failed to load image."
      );
    };

    img.src = url;
  }

  function handleBgUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      bgImageUrlRef.current
    ) {
      URL.revokeObjectURL(
        bgImageUrlRef.current
      );
    }

    const url =
      URL.createObjectURL(
        file
      );

    bgImageUrlRef.current =
      url;

    setBgImageUrl(url);
    setRecreatedImageUrl(null);
    setOverlayHtml("");
    setRefinedHtml("");
    setRefinedImageUrl(null);
    setViewTab("recreate");
    setError("");

    const img =
      new Image();

    img.onload = () => {
      setBgImageSize({
        width:
          img.naturalWidth,
        height:
          img.naturalHeight,
      });

      log(
        "background image loaded",
        {
          width:
            img.naturalWidth,
          height:
            img.naturalHeight,
        }
      );
    };

    img.onerror = () => {
      setError(
        "Failed to load background image."
      );
    };

    img.src = url;
  }

  async function generateRecreated() {
    if (
      !bgImageUrl ||
      !imageSize.width ||
      recreationItems.length ===
        0 ||
      textStyles.length === 0
    ) {
      return;
    }

    setGeneratingRecreation(
      true
    );
    setError("");

    try {
      const result =
        await renderRecreatedImage(
          bgImageUrl,
          recreationItems,
          imageSize,
          sourceImageSize.width > 0
            ? sourceImageSize
            : imageSize,
          textStyles
        );

      setRecreatedImageUrl(
        result.dataUrl
      );
      setOverlayHtml(result.html);
      setRefinedHtml("");
      setRefinedImageUrl(null);
      setViewTab(
        "recreate"
      );

      log(
        "recreated image generated",
        {
          items:
            recreationItems.length,
        }
      );
    } catch (error) {
      console.error(
        `${LOG_PREFIX} recreation failed`,
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to recreate text"
      );
    } finally {
      setGeneratingRecreation(
        false
      );
    }
  }

  async function detectText() {
    if (!imageUrl) {
      return;
    }

    setLoading(true);
    setError("");
    setBlocks([]);
    setTextElements([]);
    setTextStyles([]);
    setRecreatedImageUrl(null);
    setOverlayHtml("");
    setRefinedHtml("");
    setRefinedImageUrl(null);
    setViewTab("ocr");

    setStatus(
      "Analyzing design with Mistral OCR 4.1..."
    );

    try {
      /*
       * Convert browser object URL
       * into a File.
       */

      const imageResponse =
        await fetch(
          imageUrl
        );

      const blob =
        await imageResponse.blob();

      const file =
        new File(
          [blob],
          "design.png",
          {
            type:
              blob.type ||
              "image/png",
          }
        );

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      const response =
        await fetch(
          "/api/ocr",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "OCR failed"
        );
      }

      log(
        "API response",
        {
          nativeBlocks:
            data.blocks
              ?.length ?? 0,

          textElements:
            data.textElements
              ?.length ?? 0,
        }
      );

      const normalizedBlocks =
        normalizeBlocks(
          data.blocks
        );

      const normalizedTextElements =
        normalizeTextElements(
          data.textElements
        );

      setBlocks(
        normalizedBlocks
      );

      setTextElements(
        normalizedTextElements
      );

      if (
        data.width &&
        data.height
      ) {
        setImageSize({
          width: data.width,
          height: data.height,
        });
      }

      setStatus(
        `OCR blocks: ${normalizedBlocks.length} · Design text: ${normalizedTextElements.length}`
      );

      log(
        "normalized result",
        {
          blocks:
            normalizedBlocks,

          textElements:
            normalizedTextElements,
        }
      );
    } catch (error) {
      console.error(
        `${LOG_PREFIX} OCR failed`,
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "OCR failed"
      );

      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  async function extractTypography() {
    if (!imageUrl || recreationItems.length === 0) {
      return;
    }

    setLoadingTypography(true);
    setError("");

    try {
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const imageDataUrl = await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(String(reader.result));
          reader.onerror = () =>
            reject(new Error("Failed to read image"));
          reader.readAsDataURL(blob);
        },
      );

      const response = await fetch("/api/typography", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl,
          imageSize,
          items: recreationItems.map((item) => ({
            text: item.text,
            bbox: item.bbox,
            bboxWidth:
              item.bbox.bottomRightX - item.bbox.topLeftX,
            bboxHeight:
              item.bbox.bottomRightY - item.bbox.topLeftY,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Typography extraction failed",
        );
      }

      const styles = (
        Array.isArray(data.styles)
          ? (data.styles as TextStyle[])
          : []
      ).map((style, index) => ({
        ...style,
        bbox:
          style.bbox ??
          recreationItems[index]?.bbox,
      }));

      setTextStyles(styles);
      setViewTab("typography");

      log("typography extracted", {
        count: styles.length,
      });
    } catch (error) {
      console.error(
        `${LOG_PREFIX} typography failed`,
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Typography extraction failed",
      );
    } finally {
      setLoadingTypography(false);
    }
  }

  async function refineWithGemini() {
    if (
      !imageUrl ||
      !bgImageUrl ||
      !recreatedImageUrl ||
      !overlayHtml
    ) {
      return;
    }

    setRefining(true);
    setError("");

    try {
      const originalImageDataUrl = await toDataUrl(imageUrl);
      const generatedImageDataUrl = await toDataUrl(recreatedImageUrl);
      const bgImage = await loadImage(bgImageUrl);

      const response = await fetch("/api/refine-html", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalImageDataUrl,
          generatedImageDataUrl,
          html: overlayHtml,
          width: bgImage.naturalWidth,
          height: bgImage.naturalHeight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Refine failed");
      }

      const html =
        typeof data.html === "string" ? data.html : "";

      if (!html.trim()) {
        throw new Error("Model returned empty HTML");
      }

      const refinedDataUrl = await renderHtmlOnBackground(
        bgImageUrl,
        html,
      );

      setRefinedHtml(html);
      setRefinedImageUrl(refinedDataUrl);
      setViewTab("refine");

      log("refine complete", {
        htmlLength: html.length,
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} refine failed`, error);

      setError(
        error instanceof Error
          ? error.message
          : "Refine failed",
      );
    } finally {
      setRefining(false);
    }
  }

  /*
   * Convert original image coordinates
   * to percentages.
   */
  function getBoxStyle(
    bbox: BBox
  ) {
    const scaleX =
      100 /
      imageSize.width;

    const scaleY =
      100 /
      imageSize.height;

    const left =
      bbox.topLeftX *
      scaleX;

    const top =
      bbox.topLeftY *
      scaleY;

    const width =
      (bbox.bottomRightX -
        bbox.topLeftX) *
      scaleX;

    const height =
      (bbox.bottomRightY -
        bbox.topLeftY) *
      scaleY;

    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`,
    };
  }

  return (
    <main
      style={{
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
        minHeight:
          "100vh",

        background:
          "#111",

        color: "#fff",

        padding: 40,

        fontFamily:
          "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin:
            "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
          }}
        >
          Recreate Text
        </h1>

        <p
          style={{
            color: "#999",
            marginTop: 8,
            marginBottom: 30,
          }}
        >
          Upload an image for OCR, then place the
          detected text on a background image using
          exact bbox positions.
        </p>

        {/* MAIN TABS */}

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            borderBottom:
              "1px solid #333",
            paddingBottom: 12,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setViewTab("ocr")
            }
            style={{
              border:
                viewTab === "ocr"
                  ? "1px solid #7c3aed"
                  : "1px solid #444",
              borderRadius: 8,
              padding:
                "10px 18px",
              background:
                viewTab === "ocr"
                  ? "#2a1f4a"
                  : "#222",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            1. OCR detection
          </button>

          <button
            type="button"
            onClick={() =>
              setViewTab("typography")
            }
            style={{
              border:
                viewTab === "typography"
                  ? "1px solid #2563eb"
                  : "1px solid #444",
              borderRadius: 8,
              padding:
                "10px 18px",
              background:
                viewTab === "typography"
                  ? "#1e2a4a"
                  : "#222",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            2. Typography
          </button>

          <button
            type="button"
            onClick={() =>
              setViewTab(
                "recreate"
              )
            }
            style={{
              border:
                viewTab ===
                "recreate"
                  ? "1px solid #059669"
                  : "1px solid #444",
              borderRadius: 8,
              padding:
                "10px 18px",
              background:
                viewTab ===
                "recreate"
                  ? "#0f2f24"
                  : "#222",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            3. Recreate on background
          </button>

          <button
            type="button"
            onClick={() =>
              setViewTab("refine")
            }
            style={{
              border:
                viewTab === "refine"
                  ? "1px solid #d97706"
                  : "1px solid #444",
              borderRadius: 8,
              padding:
                "10px 18px",
              background:
                viewTab === "refine"
                  ? "#3a2a12"
                  : "#222",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            4. Align with original
          </button>
        </div>

        {error && (
          <div
            style={{
              background:
                "#3a1111",
              border:
                "1px solid #6b2222",
              padding: 15,
              borderRadius: 8,
              color:
                "#ff7777",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {viewTab === "ocr" && (
          <>
        {/* CONTROLS */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: 12,
            marginBottom: 25,
          }}
        >
          <label
            style={{
              background:
                "#fff",

              color:
                "#111",

              padding:
                "12px 18px",

              borderRadius: 8,

              cursor:
                "pointer",

              fontWeight:
                600,
            }}
          >
            Choose image

            <input
              type="file"
              accept="image/*"
              onChange={
                handleUpload
              }
              style={{
                display:
                  "none",
              }}
            />
          </label>

          <button
            onClick={
              detectText
            }
            disabled={
              !imageUrl ||
              loading
            }
            style={{
              border: 0,

              borderRadius:
                8,

              padding:
                "12px 20px",

              background:
                !imageUrl ||
                loading
                  ? "#444"
                  : "#7c3aed",

              color:
                "#fff",

              fontWeight:
                600,

              cursor:
                !imageUrl ||
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "Analyzing..."
              : "Detect text"}
          </button>

          <span
            style={{
              color:
                "#999",

              fontSize:
                14,
            }}
          >
            {status}
          </span>
        </div>

        {/* LEGEND */}

        {imageUrl && (
          <div
            style={{
              display:
                "flex",

              gap: 20,

              marginBottom:
                15,

              fontSize:
                13,

              color:
                "#aaa",
            }}
          >
            <span>
              <span
                style={{
                  display:
                    "inline-block",

                  width: 12,
                  height: 12,

                  border:
                    "2px solid #00ff88",

                  marginRight:
                    6,
                }}
              />

              Native OCR
              blocks
            </span>

            <span>
              <span
                style={{
                  display:
                    "inline-block",

                  width: 12,
                  height: 12,

                  border:
                    "2px solid #a855f7",

                  marginRight:
                    6,
                }}
              />

              Design text
              elements
            </span>
          </div>
        )}

        {/* IMAGE */}

        {imageUrl &&
          imageSize.width >
            0 && (
            <div
              style={{
                background:
                  "#222",

                padding: 20,

                borderRadius:
                  12,

                overflow:
                  "auto",
              }}
            >
              <div
                style={{
                  position:
                    "relative",

                  width:
                    "min(100%, 1000px)",

                  margin:
                    "0 auto",
                }}
              >
                <img
                  src={
                    imageUrl
                  }
                  alt="Uploaded design"
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    height:
                      "auto",
                  }}
                />

                {/* -------------------------------- */}
                {/* NATIVE OCR BLOCKS - GREEN       */}
                {/* -------------------------------- */}

                {blocks.map(
                  (
                    block,
                    index
                  ) => {
                    const style =
                      getBoxStyle(
                        block.bbox
                      );

                    return (
                      <div
                        key={`ocr-${index}`}
                        title={
                          block.text ||
                          ""
                        }
                        style={{
                          position:
                            "absolute",

                          ...style,

                          padding:
                            0,

                          margin:
                            0,

                          boxSizing:
                            "border-box",

                          border:
                            "1px solid #00ff88",

                          borderRadius:
                            3,

                          pointerEvents:
                            "none",

                          background:
                            "rgba(0,255,136,0.02)",
                        }}
                      />
                    );
                  }
                )}

                {/* -------------------------------- */}
                {/* DESIGN TEXT ELEMENTS - PURPLE   */}
                {/* -------------------------------- */}

                {textElements.map(
                  (
                    element
                  ) => {
                    const style =
                      getBoxStyle(
                        element.bbox
                      );

                    return (
                      <div
                        key={
                          element.id
                        }
                        title={`${element.role}: ${element.text}`}
                        style={{
                          position:
                            "absolute",

                          ...style,

                          padding:
                            0,

                          margin:
                            0,

                          boxSizing:
                            "border-box",

                          border:
                            "2px solid #a855f7",

                          borderRadius:
                            5,

                          pointerEvents:
                            "none",

                          background:
                            "rgba(168,85,247,0.04)",
                        }}
                      >
                        <span
                          style={{
                            position:
                              "absolute",

                            top:
                              -20,

                            left: 0,

                            background:
                              "#a855f7",

                            color:
                              "#fff",

                            fontSize:
                              10,

                            lineHeight:
                              "16px",

                            padding:
                              "0 4px",

                            borderRadius:
                              "3px 3px 0 0",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            element.role
                          }
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

        {/* -------------------------------- */}
        {/* DESIGN TEXT RESULTS              */}
        {/* -------------------------------- */}

        {textElements.length >
          0 && (
          <section
            style={{
              marginTop:
                30,

              background:
                "#1c1c1c",

              borderRadius:
                12,

              padding: 20,
            }}
          >
            <h2
              style={{
                marginTop:
                  0,

                fontSize:
                  18,
              }}
            >
              Design text
              elements
            </h2>

            <div
              style={{
                display:
                  "grid",

                gap: 8,
              }}
            >
              {textElements.map(
                (
                  element,
                  index
                ) => (
                  <div
                    key={
                      element.id
                    }
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "40px 110px 1fr",

                      gap: 15,

                      padding:
                        "10px 0",

                      borderBottom:
                        "1px solid #333",
                    }}
                  >
                    <span
                      style={{
                        color:
                          "#666",
                      }}
                    >
                      {index +
                        1}
                    </span>

                    <span
                      style={{
                        color:
                          "#a855f7",

                        fontSize:
                          13,
                      }}
                    >
                      {
                        element.role
                      }
                    </span>

                    <span>
                      {
                        element.text
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* -------------------------------- */}
        {/* NATIVE OCR RESULTS               */}
        {/* -------------------------------- */}

        {blocks.length >
          0 && (
          <section
            style={{
              marginTop:
                20,

              background:
                "#181818",

              borderRadius:
                12,

              padding: 20,
            }}
          >
            <h2
              style={{
                marginTop:
                  0,

                fontSize:
                  18,
              }}
            >
              Native OCR
              blocks
            </h2>

            <div
              style={{
                display:
                  "grid",

                gap: 6,
              }}
            >
              {blocks.map(
                (
                  block,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    style={{
                      padding:
                        "12px 0",

                      borderBottom:
                        "1px solid #2c2c2c",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "40px 100px 1fr",

                        gap: 15,

                        marginBottom:
                          10,
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#555",
                        }}
                      >
                        {index +
                          1}
                      </span>

                      <span
                        style={{
                          color:
                            "#00ff88",

                          fontSize:
                            12,
                        }}
                      >
                        {
                          block.label ||
                          "text"
                        }
                      </span>

                      <span>
                        {
                          block.text
                        }
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "grid",

                        gap: 6,

                        marginLeft:
                          55,

                        fontSize:
                          12,

                        color:
                          "#999",
                      }}
                    >
                      {Object.entries(
                        block
                      )
                        .filter(
                          ([
                            key,
                          ]) =>
                            key !==
                              "label" &&
                            key !==
                              "text"
                        )
                        .map(
                        ([
                          key,
                          value,
                        ]) => (
                          <div
                            key={
                              key
                            }
                            style={{
                              display:
                                "grid",

                              gridTemplateColumns:
                                "110px 1fr",

                              gap: 12,

                              alignItems:
                                "start",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#666",

                                textTransform:
                                  "lowercase",
                              }}
                            >
                              {
                                key
                              }
                            </span>

                            <span
                              style={{
                                fontFamily:
                                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

                                fontSize:
                                  11,

                                color:
                                  "#bbb",

                                whiteSpace:
                                  "pre-wrap",

                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {value ===
                                undefined ||
                              value ===
                                null
                                ? "—"
                                : typeof value ===
                                    "object"
                                  ? JSON.stringify(
                                      value,
                                      null,
                                      2
                                    )
                                  : String(
                                      value
                                    )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}
          </>
        )}

        {viewTab === "typography" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 25,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={extractTypography}
                disabled={
                  !imageUrl ||
                  loadingTypography ||
                  recreationItems.length === 0
                }
                style={{
                  border: 0,
                  borderRadius: 8,
                  padding: "12px 20px",
                  background:
                    !imageUrl ||
                    loadingTypography ||
                    recreationItems.length === 0
                      ? "#444"
                      : "#2563eb",
                  color: "#fff",
                  fontWeight: 600,
                  cursor:
                    !imageUrl ||
                    loadingTypography ||
                    recreationItems.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loadingTypography
                  ? "Extracting typography..."
                  : "Extract typography"}
              </button>

              {recreationItems.length === 0 && (
                <span
                  style={{
                    color: "#fbbf24",
                    fontSize: 13,
                  }}
                >
                  Run OCR in tab 1 first.
                </span>
              )}

              {textStyles.length > 0 && (
                <span
                  style={{
                    color: "#999",
                    fontSize: 14,
                  }}
                >
                  {textStyles.length} text styles
                </span>
              )}
            </div>

            {textStyles.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 240,
                  background: "#222",
                  borderRadius: 12,
                  color: "#666",
                  fontSize: 14,
                }}
              >
                Extract typography to see font, size, and color
                for each text.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {textStyles.map((style, index) => (
                  <pre
                    key={`${style.text}-${index}`}
                    style={{
                      margin: 0,
                      background: "#1c1c1c",
                      border: "1px solid #333",
                      borderRadius: 12,
                      padding: 20,
                      color: "#e5e5e5",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 13,
                      lineHeight: 1.5,
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {JSON.stringify(
                      {
                        text: style.text,
                        font_family: style.font_family,
                        font_size: style.font_size,
                        font_weight: style.font_weight,
                        color: style.color,
                        letter_spacing: style.letter_spacing,
                        line_height: style.line_height,
                        alignment: style.alignment,
                      },
                      null,
                      2,
                    )}
                  </pre>
                ))}
              </div>
            )}
          </>
        )}

        {viewTab ===
          "recreate" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 12,
                marginBottom: 25,
                flexWrap:
                  "wrap",
              }}
            >
              <label
                style={{
                  background:
                    "#fff",
                  color:
                    "#111",
                  padding:
                    "12px 18px",
                  borderRadius: 8,
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                }}
              >
                Upload bg image
                (no text)

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleBgUpload
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </label>

              <button
                onClick={
                  generateRecreated
                }
                disabled={
                  !bgImageUrl ||
                  generatingRecreation ||
                  !imageSize.width ||
                  recreationItems.length ===
                    0 ||
                  textStyles.length === 0
                }
                style={{
                  border: 0,
                  borderRadius:
                    8,
                  padding:
                    "12px 20px",
                  background:
                    !bgImageUrl ||
                    generatingRecreation ||
                    !imageSize.width ||
                    recreationItems.length ===
                      0 ||
                    textStyles.length === 0
                      ? "#444"
                      : "#059669",
                  color:
                    "#fff",
                  fontWeight:
                    600,
                  cursor:
                    !bgImageUrl ||
                    generatingRecreation ||
                    !imageSize.width ||
                    recreationItems.length ===
                      0 ||
                    textStyles.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {generatingRecreation
                  ? "Generating..."
                  : "Recreate text on bg"}
              </button>

              {recreationItems.length ===
                0 && (
                <span
                  style={{
                    color:
                      "#fbbf24",
                    fontSize:
                      13,
                  }}
                >
                  Run OCR in tab 1
                  first to detect
                  text positions.
                </span>
              )}

              {recreationItems.length >
                0 &&
                textStyles.length ===
                  0 && (
                <span
                  style={{
                    color:
                      "#fbbf24",
                    fontSize:
                      13,
                  }}
                >
                  Extract typography
                  in tab 2 first.
                </span>
              )}

              {bgImageUrl &&
                bgImageSize.width >
                  0 &&
                imageSize.width >
                  0 &&
                (bgImageSize.width !==
                  imageSize.width ||
                  bgImageSize.height !==
                    imageSize.height) && (
                  <span
                    style={{
                      color:
                        "#fbbf24",
                      fontSize:
                        13,
                    }}
                  >
                    Background size (
                    {bgImageSize.width}×
                    {bgImageSize.height}
                    ) differs from OCR
                    image (
                    {imageSize.width}×
                    {imageSize.height}
                    ).
                  </span>
                )}
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 20,
                alignItems:
                  "start",
              }}
            >
              <div
                style={{
                  background:
                    "#222",
                  borderRadius:
                    12,
                  padding: 20,
                  minHeight:
                    300,
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    fontSize:
                      15,
                    color:
                      "#ccc",
                  }}
                >
                  Background image
                </h3>

                {bgImageUrl ? (
                  <img
                    src={
                      bgImageUrl
                    }
                    alt="Background without text"
                    style={{
                      display:
                        "block",
                      width:
                        "100%",
                      height:
                        "auto",
                      borderRadius:
                        8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      minHeight:
                        240,
                      border:
                        "2px dashed #444",
                      borderRadius:
                        8,
                      color:
                        "#666",
                      fontSize:
                        14,
                    }}
                  >
                    Upload a
                    background image
                  </div>
                )}
              </div>

              <div
                style={{
                  background:
                    "#222",
                  borderRadius:
                    12,
                  padding: 20,
                  minHeight:
                    300,
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    fontSize:
                      15,
                    color:
                      "#ccc",
                  }}
                >
                  Final image
                </h3>

                {recreatedImageUrl ? (
                  <img
                    src={
                      recreatedImageUrl
                    }
                    alt="Recreated design with text"
                    style={{
                      display:
                        "block",
                      width:
                        "100%",
                      height:
                        "auto",
                      borderRadius:
                        8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      minHeight:
                        240,
                      border:
                        "2px dashed #444",
                      borderRadius:
                        8,
                      color:
                        "#666",
                      fontSize:
                        14,
                    }}
                  >
                    {generatingRecreation
                      ? "Generating..."
                      : "Click Recreate text on bg to generate"}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {viewTab === "refine" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 25,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={refineWithGemini}
                disabled={
                  !imageUrl ||
                  !bgImageUrl ||
                  !recreatedImageUrl ||
                  !overlayHtml ||
                  refining
                }
                style={{
                  border: 0,
                  borderRadius: 8,
                  padding: "12px 20px",
                  background:
                    !imageUrl ||
                    !bgImageUrl ||
                    !recreatedImageUrl ||
                    !overlayHtml ||
                    refining
                      ? "#444"
                      : "#d97706",
                  color: "#fff",
                  fontWeight: 600,
                  cursor:
                    !imageUrl ||
                    !bgImageUrl ||
                    !recreatedImageUrl ||
                    !overlayHtml ||
                    refining
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {refining
                  ? "Aligning with original..."
                  : "Align with original"}
              </button>

              {!recreatedImageUrl || !overlayHtml ? (
                <span
                  style={{
                    color: "#fbbf24",
                    fontSize: 13,
                  }}
                >
                  Generate the image in tab 3 first.
                </span>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: "#222",
                  borderRadius: 12,
                  padding: 20,
                  minHeight: 300,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: 15,
                    color: "#ccc",
                  }}
                >
                  Tab 3 generated image
                </h3>

                {recreatedImageUrl ? (
                  <img
                    src={recreatedImageUrl}
                    alt="Generated before refine"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 240,
                      border: "2px dashed #444",
                      borderRadius: 8,
                      color: "#666",
                      fontSize: 14,
                    }}
                  >
                    No generated image yet
                  </div>
                )}
              </div>

              <div
                style={{
                  background: "#222",
                  borderRadius: 12,
                  padding: 20,
                  minHeight: 300,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: 15,
                    color: "#ccc",
                  }}
                >
                  Aligned image
                </h3>

                {refinedImageUrl ? (
                  <img
                    src={refinedImageUrl}
                    alt="Aligned with original"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 240,
                      border: "2px dashed #444",
                      borderRadius: 8,
                      color: "#666",
                      fontSize: 14,
                      textAlign: "center",
                      padding: 16,
                    }}
                  >
                    {refining
                      ? "Comparing and fixing HTML..."
                      : "Click Align with original to refine"}
                  </div>
                )}
              </div>
            </div>

            {refinedHtml ? (
              <pre
                style={{
                  marginTop: 20,
                  background: "#1c1c1c",
                  border: "1px solid #333",
                  borderRadius: 12,
                  padding: 20,
                  color: "#e5e5e5",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 360,
                }}
              >
                {refinedHtml}
              </pre>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}