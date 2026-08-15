import { ensureListItems } from "@/lib/editor/list-attrs";
import type { BlockAttrs } from "@/lib/domain/types";
import { ensureEditableHtml, escapeHtml } from "./html";

export type TextBlockMode = "text" | "bulletList" | "orderedList";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Normalize stored content into editable HTML. */
export function toEditorHtml(
  content: string,
  mode: TextBlockMode = "text",
  attrs?: BlockAttrs,
): string {
  if (mode === "bulletList" || mode === "orderedList") {
    return toListHtml(content, mode === "orderedList", attrs);
  }

  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split("\n")
    .map((line) => `<p>${escapeXml(line) || "<br>"}</p>`)
    .join("");
}

function wrapAsListItem(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "<li><p></p></li>";
  if (/^<li[\s>]/i.test(trimmed)) return trimmed;
  if (/^<p[\s>]/i.test(trimmed)) return `<li>${trimmed}</li>`;
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return `<li>${trimmed}</li>`;
  return `<li><p>${escapeXml(trimmed)}</p></li>`;
}

function toListHtml(
  content: string,
  ordered: boolean,
  attrs?: BlockAttrs,
): string {
  const tag = ordered ? "ol" : "ul";

  if (attrs && Array.isArray(attrs.items) && attrs.items.length > 0) {
    const items = ensureListItems(attrs, content);
    return `<${tag}>${items.map((item) => wrapAsListItem(item)).join("")}</${tag}>`;
  }

  const trimmed = content.trim();
  if (!trimmed) return `<${tag}><li><p></p></li></${tag}>`;

  if (trimmed.startsWith("<ol") || trimmed.startsWith("<ul")) {
    return trimmed;
  }

  if (!/<[a-z][\s\S]*>/i.test(trimmed) && trimmed.includes("\n")) {
    return `<${tag}>${trimmed
      .split("\n")
      .map((line) => wrapAsListItem(line))
      .join("")}</${tag}>`;
  }

  return `<${tag}>${wrapAsListItem(trimmed)}</${tag}>`;
}

/** Inner HTML of the first list item (for contentEditable editing). */
export function unwrapListItemHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (typeof document === "undefined") return trimmed;

  const holder = document.createElement("div");
  holder.innerHTML = trimmed;
  const li = holder.querySelector("li");
  if (li) return li.innerHTML;
  return ensureEditableHtml(trimmed);
}

/** Wrap editable inner HTML back into a single-item list block. */
export function wrapListItemHtml(inner: string, ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const body = inner.trim() || "<p></p>";
  return `<${tag}><li>${body}</li></${tag}>`;
}

/** Plain editable HTML for a block (unwraps list markup when needed). */
export function toEditableHtml(
  content: string,
  mode: TextBlockMode = "text",
  attrs?: BlockAttrs,
): string {
  if (mode === "bulletList" || mode === "orderedList") {
    return unwrapListItemHtml(toEditorHtml(content, mode, attrs));
  }
  return ensureEditableHtml(toEditorHtml(content, mode, attrs));
}

/** Persist list block content from editable inner HTML. */
export function fromEditableHtml(
  inner: string,
  mode: TextBlockMode,
): string {
  if (mode === "bulletList") return wrapListItemHtml(inner, false);
  if (mode === "orderedList") return wrapListItemHtml(inner, true);
  return inner;
}

export function escapePlainToParagraph(text: string): string {
  return `<p>${escapeHtml(text) || "<br>"}</p>`;
}
