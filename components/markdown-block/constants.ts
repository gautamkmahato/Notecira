import type { SelectOption } from "@/components/ui/Select";

/** Placeholder insert options for future markdown-specific toolbar actions. */
export const MARKDOWN_INSERT_OPTIONS: readonly SelectOption<string>[] = [
  { value: "heading", label: "Heading" },
  { value: "list", label: "List" },
  { value: "code", label: "Code block" },
  { value: "quote", label: "Quote" },
] as const;
