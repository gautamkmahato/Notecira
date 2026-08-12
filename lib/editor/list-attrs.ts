import type { BlockAttrs } from "@/lib/domain/types";
import { htmlToPlainText, isEmptyHtml } from "./rich-text/html";

/** Normalize list items stored on a list block. */
export function ensureListItems(attrs: BlockAttrs, fallbackContent = ""): string[] {
  if (Array.isArray(attrs.items) && attrs.items.length > 0) {
    return attrs.items.map((item) => (typeof item === "string" ? item : ""));
  }
  return [fallbackContent || ""];
}

export function listItemsPlainText(items: string[]): string {
  return items
    .map((item) => htmlToPlainText(item))
    .filter((text) => text.trim().length > 0)
    .join("\n");
}

export function isEmptyList(items: string[]): boolean {
  return items.every((item) => isEmptyHtml(item));
}
