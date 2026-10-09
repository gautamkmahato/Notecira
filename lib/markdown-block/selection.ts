export type TextSelection = {
  start: number;
  end: number;
};

export function readSelection(textarea: HTMLTextAreaElement): TextSelection {
  return {
    start: textarea.selectionStart ?? 0,
    end: textarea.selectionEnd ?? 0,
  };
}

export function writeSelection(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
) {
  textarea.focus();
  textarea.setSelectionRange(start, end);
}

export function getLineBounds(
  content: string,
  index: number,
): { lineStart: number; lineEnd: number } {
  const lineStart = content.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  const nextBreak = content.indexOf("\n", index);
  const lineEnd = nextBreak === -1 ? content.length : nextBreak;
  return { lineStart, lineEnd };
}

export function getLineRangeForSelection(
  content: string,
  selection: TextSelection,
): { start: number; end: number } {
  const anchor = selection.start === selection.end ? selection.start : selection.start;
  const focus = selection.start === selection.end ? selection.end : selection.end;
  const { lineStart } = getLineBounds(content, anchor);
  const { lineEnd } = getLineBounds(content, Math.max(focus - 1, 0));
  return { start: lineStart, end: lineEnd };
}
