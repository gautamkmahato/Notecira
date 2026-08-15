export const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
] as const;

export const DEFAULT_FONT_FAMILY = FONT_FAMILIES[0].value;

export function fontFamilyLabel(value: string | null | undefined): string {
  if (!value) return FONT_FAMILIES[0].label;
  const match = FONT_FAMILIES.find(
    (f) => f.value.replace(/['"]+/g, "") === value.replace(/['"]+/g, ""),
  );
  if (match) return match.label;
  const short = value.split(",")[0]?.replace(/['"]+/g, "").trim();
  return short || FONT_FAMILIES[0].label;
}
