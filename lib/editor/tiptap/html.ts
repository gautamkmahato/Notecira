import { ensureListItems } from "@/lib/editor/list-attrs";
import type { BlockAttrs } from "@/lib/domain/types";
import type { TipTapBlockMode } from "./extensions";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Normalize stored content into TipTap-ready HTML. */
export function toEditorHtml(
  content: string,
  mode: TipTapBlockMode = "text",
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

  // Prefer legacy attrs.items if present
  if (attrs && Array.isArray(attrs.items) && attrs.items.length > 0) {
    const items = ensureListItems(attrs, content);
    return `<${tag}>${items.map((item) => wrapAsListItem(item)).join("")}</${tag}>`;
  }

  const trimmed = content.trim();
  if (!trimmed) return `<${tag}><li><p></p></li></${tag}>`;

  if (trimmed.startsWith("<ol") || trimmed.startsWith("<ul")) {
    return trimmed;
  }

  // Multiple legacy plain lines → multiple list items
  if (!/<[a-z][\s\S]*>/i.test(trimmed) && trimmed.includes("\n")) {
    return `<${tag}>${trimmed
      .split("\n")
      .map((line) => wrapAsListItem(line))
      .join("")}</${tag}>`;
  }

  return `<${tag}>${wrapAsListItem(trimmed)}</${tag}>`;
}
