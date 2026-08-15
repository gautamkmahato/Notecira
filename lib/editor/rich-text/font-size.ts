export const DEFAULT_FONT_SIZE_PX = 16;
export const MIN_FONT_SIZE_PX = 8;
export const MAX_FONT_SIZE_PX = 72;

export function parseFontSizePx(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.trim().match(/^([\d.]+)(px|pt)?$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return null;
  const unit = (match[2] ?? "px").toLowerCase();
  return Math.round(unit === "pt" ? amount * (4 / 3) : amount);
}

export function clampFontSizePx(px: number): number {
  return Math.min(MAX_FONT_SIZE_PX, Math.max(MIN_FONT_SIZE_PX, Math.round(px)));
}
