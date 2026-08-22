/**
 * Domain types mirror a future Postgres schema so the UI/store can
 * stay stable when swapping localStorage for a real DB.
 *
 * Suggested tables:
 *   folders(id, name, parent_folder_id, sort_order, created_at, updated_at)
 *   documents(id, title, folder_id, parent_block_id, sort_order, deleted_at, created_at, updated_at)
 *   blocks(id, document_id, parent_block_id, type, content, attrs jsonb, position, linked_document_id, created_at, updated_at)
 */

export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "heading_4"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "table"
  | "code"
  | "image"
  | "video"
  | "pdf"
  | "document";

/** Legacy block-level text attrs (inline marks in content HTML are preferred). */
export type TextFormatAttrs = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontSize?: "sm" | "md" | "lg" | "xl";
};

export type TableAttrs = {
  rows: number;
  cols: number;
  /** Row-major cell plain text. */
  cells: string[][];
};

export type MediaAttrs = {
  src?: string;
  name?: string;
  alt?: string;
  /** image / video display width */
  width?: "sm" | "md" | "lg" | "full";
  align?: "left" | "center" | "right";
  /** image object-fit when displayed */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /** custom display size (px) — set via corner resize */
  imageWidthPx?: number;
  imageHeightPx?: number;
  /**
   * video playback:
   * - auto: YouTube URLs → iframe, otherwise file
   * - file: HTML5 video
   * - iframe: embed URL / YouTube iframe
   */
  videoMode?: "auto" | "file" | "iframe";
};

export type CodeAttrs = {
  language?: string;
  wrap?: boolean;
  theme?: "dark" | "light";
  showLineNumbers?: boolean;
  /** "auto" grows with content; number = fixed height in px */
  codeHeight?: "auto" | number;
};

/** Multi-item list stored on one block (Google Docs–style within a block). */
export type ListAttrs = {
  /** HTML strings, one per list item */
  items?: string[];
};

/** Document block (Google Docs–style canvas) attrs. */
export type DocumentBlockAttrs = {
  elements?: Array<{
    id: string;
    type:
      | "paragraph"
      | "heading_1"
      | "heading_2"
      | "heading_3"
      | "heading_4"
      | "bullet_list"
      | "numbered_list"
      | "code";
    content: string;
  }>;
};

/** Type-specific JSON attrs (maps to jsonb in Postgres). */
export type BlockAttrs = TextFormatAttrs &
  Partial<TableAttrs> &
  Partial<MediaAttrs> &
  Partial<CodeAttrs> &
  Partial<ListAttrs> &
  Partial<DocumentBlockAttrs>;

/** Row shape for `folders` */
export type Folder = {
  id: string;
  name: string;
  parentFolderId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Row shape for `documents` */
export type Document = {
  id: string;
  title: string;
  folderId: string | null;
  parentBlockId: string | null;
  sortOrder: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Row shape for `blocks` */
export type Block = {
  id: string;
  documentId: string;
  type: BlockType;
  content: string;
  attrs: BlockAttrs;
  position: number;
  linkedDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceSnapshot = {
  version: 5;
  folders: Record<string, Folder>;
  documents: Record<string, Document>;
  blocks: Record<string, Block>;
  rootFolderIds: string[];
  rootDocumentIds: string[];
};

export type SidebarDocNode = {
  kind: "document";
  documentId: string;
  title: string;
  depth: number;
  children: SidebarDocNode[];
};

export type SidebarFolderNode = {
  kind: "folder";
  folderId: string;
  name: string;
  depth: number;
  folders: SidebarFolderNode[];
  documents: SidebarDocNode[];
};

export type SidebarForest = {
  folders: SidebarFolderNode[];
  documents: SidebarDocNode[];
};

export type TrashedDocumentItem = {
  document: Document;
  parentTitle: string | null;
};

export const TEXT_LIKE_BLOCK_TYPES: BlockType[] = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "heading_4",
  "bulleted_list_item",
  "numbered_list_item",
];

export function isTextLikeBlockType(type: BlockType): boolean {
  return TEXT_LIKE_BLOCK_TYPES.includes(type);
}

export function defaultAttrsForType(type: BlockType): BlockAttrs {
  switch (type) {
    case "table":
      return {
        rows: 3,
        cols: 3,
        cells: [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ],
      };
    case "code":
      return {
        language: "plain",
        wrap: true,
        theme: "dark",
        showLineNumbers: false,
        codeHeight: "auto",
      };
    case "image":
      return {
        src: "",
        name: "",
        alt: "",
        width: "full",
        align: "left",
        objectFit: "contain",
      };
    case "video":
      return {
        src: "",
        name: "",
        width: "full",
        align: "left",
        videoMode: "auto",
      };
    case "pdf":
      return { src: "", name: "" };
    case "document":
      return {};
    case "bulleted_list_item":
    case "numbered_list_item":
      return {};
    default:
      return {};
  }
}
