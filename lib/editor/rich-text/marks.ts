import {
  clampFontSizePx,
  parseFontSizePx,
} from "./font-size";
import { normalizeEmptyHtml } from "./html";

export type InlineMarkState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string | null;
  fontFamily: string | null;
  fontSizePx: number | null;
};

export function emptyInlineState(): InlineMarkState {
  return {
    bold: false,
    italic: false,
    underline: false,
    color: null,
    fontFamily: null,
    fontSizePx: null,
  };
}

function selectionInside(root: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const node = sel.anchorNode;
  if (!node) return false;
  return root.contains(node.nodeType === Node.TEXT_NODE ? node.parentNode : node);
}

function styleTarget(root: HTMLElement): Element | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  if (!selectionInside(root)) return null;

  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
  return (node as Element | null) ?? null;
}

export function queryInlineState(root: HTMLElement): InlineMarkState {
  if (typeof document === "undefined") return emptyInlineState();

  const bold = document.queryCommandState("bold");
  const italic = document.queryCommandState("italic");
  const underline = document.queryCommandState("underline");

  const target = styleTarget(root);
  if (!target) {
    return { bold, italic, underline, color: null, fontFamily: null, fontSizePx: null };
  }

  const style = window.getComputedStyle(target);
  const color = style.color || null;
  const fontFamily = style.fontFamily?.replace(/['"]+/g, "") || null;
  const fontSizePx = parseFontSizePx(style.fontSize);

  return { bold, italic, underline, color, fontFamily, fontSizePx };
}

/** Apply a mark to the current selection inside `root`. */
export function applyInlineCommand(
  root: HTMLElement,
  command:
    | "bold"
    | "italic"
    | "underline"
    | "foreColor"
    | "fontSize"
    | "fontFamily",
  value?: string,
): boolean {
  if (!selectionInside(root)) return false;
  root.focus();

  if ((command === "fontSize" || command === "fontFamily") && value) {
    const styles =
      command === "fontSize"
        ? { fontSize: value }
        : { fontFamily: value };
    return wrapSelectionWithSpan(root, styles);
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
  styles: { fontSize?: string; fontFamily?: string; color?: string },
): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  if (!selectionInside(root)) return false;

  const range = sel.getRangeAt(0);
  if (sel.isCollapsed) {
    const span = document.createElement("span");
    if (styles.fontSize) span.style.fontSize = styles.fontSize;
    if (styles.fontFamily) span.style.fontFamily = styles.fontFamily;
    if (styles.color) span.style.color = styles.color;
    span.appendChild(document.createTextNode("\u200b"));
    range.insertNode(span);
    const next = document.createRange();
    next.setStart(span.firstChild!, 1);
    next.collapse(true);
    sel.removeAllRanges();
    sel.addRange(next);
    return true;
  }

  const span = document.createElement("span");
  if (styles.fontSize) span.style.fontSize = styles.fontSize;
  if (styles.fontFamily) span.style.fontFamily = styles.fontFamily;
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

export { clampFontSizePx };
