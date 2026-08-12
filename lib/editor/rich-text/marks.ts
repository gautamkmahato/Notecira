import type { BlockAttrs } from "@/lib/domain/types";
import { normalizeEmptyHtml } from "./html";

export type InlineMarkState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string | null;
  fontSize: BlockAttrs["fontSize"] | null;
};

export const FONT_SIZE_PX: Record<NonNullable<BlockAttrs["fontSize"]>, string> = {
  sm: "13px",
  md: "15px",
  lg: "18px",
  xl: "22px",
};

export function emptyInlineState(): InlineMarkState {
  return {
    bold: false,
    italic: false,
    underline: false,
    color: null,
    fontSize: null,
  };
}

export function queryInlineState(): InlineMarkState {
  if (typeof document === "undefined") return emptyInlineState();

  const bold = document.queryCommandState("bold");
  const italic = document.queryCommandState("italic");
  const underline = document.queryCommandState("underline");

  let color: string | null = null;
  let fontSize: BlockAttrs["fontSize"] | null = null;

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    const node = sel.anchorNode?.nodeType === Node.ELEMENT_NODE
      ? (sel.anchorNode as Element)
      : sel.anchorNode?.parentElement;
    if (node) {
      const style = window.getComputedStyle(node);
      color = style.color || null;
      const px = style.fontSize;
      fontSize =
        (Object.entries(FONT_SIZE_PX).find(([, value]) => value === px)?.[0] as
          | BlockAttrs["fontSize"]
          | undefined) ?? null;
    }
  }

  return { bold, italic, underline, color, fontSize };
}

function selectionInside(root: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const node = sel.anchorNode;
  if (!node) return false;
  return root.contains(node.nodeType === Node.TEXT_NODE ? node.parentNode : node);
}

/** Apply a mark to the current selection inside `root`. No-op if selection is outside. */
export function applyInlineCommand(
  root: HTMLElement,
  command: "bold" | "italic" | "underline" | "foreColor" | "fontSize",
  value?: string,
): boolean {
  if (!selectionInside(root)) return false;
  root.focus();

  if (command === "fontSize" && value) {
    return wrapSelectionWithSpan(root, { fontSize: value });
  }

  if (command === "foreColor" && value) {
    document.execCommand("styleWithCSS", false, "true");
    return document.execCommand("foreColor", false, value);
  }

  document.execCommand("styleWithCSS", false, "true");
  return document.execCommand(command, false);
}

function wrapSelectionWithSpan(
  root: HTMLElement,
  styles: { fontSize?: string; color?: string },
): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
  if (!selectionInside(root)) return false;

  const range = sel.getRangeAt(0);
  const span = document.createElement("span");
  if (styles.fontSize) span.style.fontSize = styles.fontSize;
  if (styles.color) span.style.color = styles.color;

  try {
    range.surroundContents(span);
  } catch {
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }

  sel.removeAllRanges();
  const next = document.createRange();
  next.selectNodeContents(span);
  sel.addRange(next);
  return true;
}

/** Split editable HTML at the current caret into before/after HTML strings. */
export function splitHtmlAtCaret(root: HTMLElement): {
  before: string;
  after: string;
} {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    return { before: root.innerHTML, after: "" };
  }

  const range = sel.getRangeAt(0);

  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(root);
  beforeRange.setEnd(range.startContainer, range.startOffset);

  const afterRange = document.createRange();
  afterRange.selectNodeContents(root);
  afterRange.setStart(range.endContainer, range.endOffset);

  return {
    before: normalizeEmptyHtml(fragmentToHtml(beforeRange.cloneContents())),
    after: normalizeEmptyHtml(fragmentToHtml(afterRange.cloneContents())),
  };
}

function fragmentToHtml(fragment: DocumentFragment): string {
  const holder = document.createElement("div");
  holder.appendChild(fragment);
  return holder.innerHTML;
}

/** Place caret at a plain-text offset inside a contentEditable root. */
export function setCaretPlainOffset(root: HTMLElement, offset: number): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(0, offset);
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent ?? "";
    if (remaining <= text.length) {
      const range = document.createRange();
      range.setStart(node, remaining);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return;
    }
    remaining -= text.length;
    node = walker.nextNode();
  }

  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
