import type { CSSProperties } from "react";
import type { Block, BlockAttrs, BlockType } from "@/lib/domain/types";
import { defaultAttrsForType, isTextLikeBlockType } from "@/lib/domain/types";
import { ensureListItems, listItemsPlainText } from "@/lib/editor/list-attrs";
import { htmlToPlainText } from "@/lib/editor/rich-text/html";
import { toEditorHtml } from "@/lib/editor/rich-text/editor-html";

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: "Text",
  heading_1: "Heading 1",
  heading_2: "Heading 2",
  heading_3: "Heading 3",
  heading_4: "Heading 4",
  bulleted_list_item: "Bullet list",
  numbered_list_item: "Numbered list",
  table: "Table",
  code: "Code",
  image: "Image",
  video: "Video",
  pdf: "PDF",
};

export const INSERTABLE_BLOCK_TYPES: BlockType[] = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "heading_4",
  "bulleted_list_item",
  "numbered_list_item",
  "table",
  "code",
  "image",
  "video",
  "pdf",
];

export function fontSizeClass(size: BlockAttrs["fontSize"]): string {
  switch (size) {
    case "sm":
      return "text-sm";
    case "lg":
      return "text-lg";
    case "xl":
      return "text-xl";
    default:
      return "text-[15px]";
  }
}

export function textStyleFromAttrs(attrs: BlockAttrs): {
  className: string;
  style: CSSProperties;
} {
  const className = [
    fontSizeClass(attrs.fontSize),
    attrs.bold ? "font-bold" : "",
    attrs.italic ? "italic" : "",
    attrs.underline ? "underline" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    className,
    style: { color: attrs.color || "#1e293b" },
  };
}

export function canLinkBlock(block: Block): boolean {
  return isTextLikeBlockType(block.type);
}

export function ensureTableAttrs(attrs: BlockAttrs): {
  rows: number;
  cols: number;
  cells: string[][];
} {
  const rows = Math.max(1, attrs.rows ?? 3);
  const cols = Math.max(1, attrs.cols ?? 3);
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => attrs.cells?.[r]?.[c] ?? ""),
  );
  return { rows, cols, cells };
}

export function mediaWidthClass(width: BlockAttrs["width"]): string {
  switch (width) {
    case "sm":
      return "max-w-xs";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-2xl";
    default:
      return "max-w-full";
  }
}

export function mediaAlignClass(align: BlockAttrs["align"]): string {
  switch (align) {
    case "center":
      return "mx-auto";
    case "right":
      return "ml-auto";
    default:
      return "";
  }
}

function listModeForType(
  type: BlockType,
): "bulletList" | "orderedList" | null {
  if (type === "bulleted_list_item") return "bulletList";
  if (type === "numbered_list_item") return "orderedList";
  return null;
}

/** Build attrs when converting between block types without losing text. */
export function attrsForTypeChange(
  from: Block,
  toType: BlockType,
): { content: string; attrs: BlockAttrs; linkedDocumentId: string | null } {
  const keepLink =
    toType === "paragraph" ||
    toType.startsWith("heading_") ||
    toType === "bulleted_list_item" ||
    toType === "numbered_list_item";

  const fromList =
    from.type === "bulleted_list_item" || from.type === "numbered_list_item";
  const toListMode = listModeForType(toType);

  if (toListMode) {
    const content = toEditorHtml(from.content, toListMode, from.attrs);
    return {
      content,
      attrs: {},
      linkedDocumentId: keepLink ? from.linkedDocumentId : null,
    };
  }

  if (
    toType === "table" ||
    toType === "image" ||
    toType === "video" ||
    toType === "pdf"
  ) {
    return {
      content: "",
      attrs: defaultAttrsForType(toType),
      linkedDocumentId: null,
    };
  }

  if (toType === "code") {
    const content = fromList
      ? listItemsPlainText(ensureListItems(from.attrs, from.content)) ||
        htmlToPlainText(from.content)
      : htmlToPlainText(from.content);
    return {
      content,
      attrs: defaultAttrsForType("code"),
      linkedDocumentId: null,
    };
  }

  const content = fromList
    ? from.content.startsWith("<ol") || from.content.startsWith("<ul")
      ? htmlToPlainText(from.content)
          .split("\n")
          .filter(Boolean)
          .map((line) => `<p>${line}</p>`)
          .join("") || "<p></p>"
      : listItemsPlainText(ensureListItems(from.attrs, from.content))
    : from.content;

  return {
    content,
    attrs: defaultAttrsForType(toType),
    linkedDocumentId: keepLink ? from.linkedDocumentId : null,
  };
}

export function createBlockSeed(
  type: BlockType,
  overrides?: Partial<Pick<Block, "content" | "attrs">>,
): { type: BlockType; content: string; attrs: BlockAttrs } {
  const listMode = listModeForType(type);
  const base = defaultAttrsForType(type);
  const attrs = { ...base, ...overrides?.attrs };

  if (listMode) {
    const content =
      overrides?.content && overrides.content.length > 0
        ? toEditorHtml(overrides.content, listMode, attrs)
        : toEditorHtml("", listMode);
    return { type, content, attrs: {} };
  }

  return {
    type,
    content: overrides?.content ?? "",
    attrs,
  };
}
