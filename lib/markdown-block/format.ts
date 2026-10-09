import type { TextSelection } from "./selection";
import { getLineRangeForSelection } from "./selection";

export type FormatResult = {
  content: string;
  selection: TextSelection;
};

function replaceRegion(
  content: string,
  start: number,
  end: number,
  insert: string,
): FormatResult {
  const next = `${content.slice(0, start)}${insert}${content.slice(end)}`;
  const caret = start + insert.length;
  return { content: next, selection: { start: caret, end: caret } };
}

function toggleWrap(
  content: string,
  selection: TextSelection,
  before: string,
  after: string,
): FormatResult {
  const { start, end } = selection;
  const selected = content.slice(start, end);

  if (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after)
  ) {
    const inner = selected.slice(before.length, selected.length - after.length);
    const next = `${content.slice(0, start)}${inner}${content.slice(end)}`;
    return {
      content: next,
      selection: { start, end: start + inner.length },
    };
  }

  if (
    content.slice(start - before.length, start) === before &&
    content.slice(end, end + after.length) === after
  ) {
    const next = `${content.slice(0, start - before.length)}${selected}${content.slice(end + after.length)}`;
    return {
      content: next,
      selection: {
        start: start - before.length,
        end: start - before.length + selected.length,
      },
    };
  }

  const wrapped = `${before}${selected}${after}`;
  const next = `${content.slice(0, start)}${wrapped}${content.slice(end)}`;
  return {
    content: next,
    selection: {
      start: start + before.length,
      end: start + before.length + selected.length,
    },
  };
}

function wrapStyle(
  content: string,
  selection: TextSelection,
  style: string,
): FormatResult {
  const { start, end } = selection;
  const selected = content.slice(start, end);
  const wrapped = `<span style="${style}">${selected}</span>`;
  const next = `${content.slice(0, start)}${wrapped}${content.slice(end)}`;
  return {
    content: next,
    selection: {
      start: start + `<span style="${style}">`.length,
      end: start + `<span style="${style}">`.length + selected.length,
    },
  };
}

function toggleLinePrefix(
  content: string,
  selection: TextSelection,
  prefix: string,
  options?: { ordered?: boolean; stripHeading?: boolean },
): FormatResult {
  const { start, end } = getLineRangeForSelection(content, selection);
  const region = content.slice(start, end);
  const lines = region.split("\n");

  const normalizedPrefix = options?.ordered ? null : prefix;
  const allPrefixed = options?.ordered
    ? lines.every((line) => /^\d+\.\s/.test(line))
    : lines.every((line) => line.startsWith(prefix));

  const nextLines = lines.map((line, index) => {
    let body = line;
    if (options?.stripHeading) {
      body = body.replace(/^#{1,6}\s+/, "");
    }
    if (options?.ordered) {
      body = body.replace(/^\d+\.\s+/, "");
    } else {
      body = body.replace(/^[-*+]\s+/, "");
    }

    if (allPrefixed) return body;

    if (options?.ordered) {
      return `${index + 1}. ${body}`;
    }
    return `${normalizedPrefix}${body}`;
  });

  const insert = nextLines.join("\n");
  const result = replaceRegion(content, start, end, insert);
  if (selection.start === selection.end) {
    const offset = selection.start - start;
    return {
      content: result.content,
      selection: { start: start + offset, end: start + offset },
    };
  }
  return {
    content: result.content,
    selection: { start, end: start + insert.length },
  };
}

const TABLE_TEMPLATE = `| Column 1 | Column 2 |
| --- | --- |
|  |  |`;

export function applyBold(content: string, selection: TextSelection): FormatResult {
  return toggleWrap(content, selection, "**", "**");
}

export function applyItalic(content: string, selection: TextSelection): FormatResult {
  return toggleWrap(content, selection, "*", "*");
}

export function applyUnderline(content: string, selection: TextSelection): FormatResult {
  return toggleWrap(content, selection, "<u>", "</u>");
}

export function applyFontFamily(
  content: string,
  selection: TextSelection,
  fontFamily: string,
): FormatResult {
  return wrapStyle(content, selection, `font-family: ${fontFamily}`);
}

export function applyFontSize(
  content: string,
  selection: TextSelection,
  px: number,
): FormatResult {
  return wrapStyle(content, selection, `font-size: ${px}px`);
}

export function applyTextColor(
  content: string,
  selection: TextSelection,
  color: string,
): FormatResult {
  return wrapStyle(content, selection, `color: ${color}`);
}

export function applyHeading1(content: string, selection: TextSelection): FormatResult {
  return toggleLinePrefix(content, selection, "# ", { stripHeading: true });
}

export function applyHeading3(content: string, selection: TextSelection): FormatResult {
  return toggleLinePrefix(content, selection, "### ", { stripHeading: true });
}

export function applyBulletList(content: string, selection: TextSelection): FormatResult {
  return toggleLinePrefix(content, selection, "- ", { stripHeading: true });
}

export function applyOrderedList(content: string, selection: TextSelection): FormatResult {
  return toggleLinePrefix(content, selection, "", {
    ordered: true,
    stripHeading: true,
  });
}

export function applyCode(content: string, selection: TextSelection): FormatResult {
  const { start, end } = selection;
  const selected = content.slice(start, end);

  if (selected.includes("\n")) {
    const fenced = `\`\`\`\n${selected}\n\`\`\``;
    return replaceRegion(content, start, end, fenced);
  }

  if (
    selected.startsWith("`") &&
    selected.endsWith("`") &&
    selected.length >= 2
  ) {
    const inner = selected.slice(1, -1);
    const next = `${content.slice(0, start)}${inner}${content.slice(end)}`;
    return {
      content: next,
      selection: { start, end: start + inner.length },
    };
  }

  return toggleWrap(content, selection, "`", "`");
}

export function applyTable(content: string, selection: TextSelection): FormatResult {
  const { start, end } = selection;
  const selected = content.slice(start, end).trim();

  if (selected) {
    const cells = selected.split(/\t|\|/).map((cell) => cell.trim()).filter(Boolean);
    if (cells.length >= 2) {
      const header = `| ${cells.join(" | ")} |`;
      const divider = `| ${cells.map(() => "---").join(" | ")} |`;
      const table = `${header}\n${divider}\n| ${cells.map(() => "").join(" | ")} |`;
      return replaceRegion(content, start, end, table);
    }
  }

  const needsLeadingBreak = start > 0 && content[start - 1] !== "\n";
  const insert = `${needsLeadingBreak ? "\n" : ""}${TABLE_TEMPLATE}\n`;
  const result = replaceRegion(content, start, end, insert);
  const caret = start + insert.length - 1;
  return { content: result.content, selection: { start: caret, end: caret } };
}
