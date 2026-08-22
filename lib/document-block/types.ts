export type DocumentElementType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "heading_4"
  | "bullet_list"
  | "numbered_list"
  | "code";

export type DocumentElement = {
  id: string;
  type: DocumentElementType;
  content: string;
};

export type DocumentInsertableType = Exclude<DocumentElementType, "paragraph">;

export function isDocumentListElementType(
  type: DocumentElementType,
): type is "bullet_list" | "numbered_list" {
  return type === "bullet_list" || type === "numbered_list";
}
