/** Lightweight HTML helpers for inline rich text (no DOM required). */

const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(/\u00a0/g, " ")
    .trimEnd();
}

export function isEmptyHtml(html: string): boolean {
  return htmlToPlainText(html).trim().length === 0;
}

export function normalizeEmptyHtml(html: string): string {
  return isEmptyHtml(html) ? "" : html;
}

/** Escape plain text for safe insertion into contentEditable HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** If content looks like plain text (no tags), keep as-is for contentEditable. */
export function ensureEditableHtml(content: string): string {
  if (!content) return "";
  if (/[<>]/.test(content)) return content;
  return escapeHtml(content).replace(/\n/g, "<br>");
}
