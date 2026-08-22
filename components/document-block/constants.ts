import type { SelectOption } from "@/components/ui/Select";
import type { DocumentInsertableType } from "@/lib/document-block/types";

export const DOCUMENT_ELEMENT_INSERT_OPTIONS: readonly SelectOption<DocumentInsertableType>[] =
  [
    { value: "heading_1", label: "Heading 1" },
    { value: "heading_2", label: "Heading 2" },
    { value: "heading_3", label: "Heading 3" },
    { value: "heading_4", label: "Heading 4" },
    { value: "bullet_list", label: "Bullet list" },
    { value: "numbered_list", label: "Numbered list" },
    { value: "code", label: "Code" },
  ] as const;
