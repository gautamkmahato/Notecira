/** Normalize pasted or stored markdown source for consistent rendering. */
export function normalizeMarkdownSource(source: string): string {
  return source.replace(/\r\n/g, "\n").trimEnd();
}

export function isEmptyMarkdown(source: string): boolean {
  return normalizeMarkdownSource(source).trim().length === 0;
}
