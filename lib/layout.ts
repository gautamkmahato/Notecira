/** Columns at or below this count share width equally and stay centered. */
export const EQUAL_LAYOUT_MAX_COLUMNS = 2;

/** Default fixed column width (px) once the open path exceeds EQUAL_LAYOUT_MAX_COLUMNS. */
export const FIXED_COLUMN_WIDTH_PX = 450;

/** Solo / focused document max width — matches single-doc centered layout. */
export const SOLO_COLUMN_MAX_WIDTH_PX = 720;

export const MIN_COLUMN_WIDTH_PX = 280;
export const MAX_COLUMN_WIDTH_PX = 900;

export function isScrollColumnLayout(columnCount: number): boolean {
  return columnCount > EQUAL_LAYOUT_MAX_COLUMNS;
}

export function clampColumnWidth(width: number): number {
  return Math.min(MAX_COLUMN_WIDTH_PX, Math.max(MIN_COLUMN_WIDTH_PX, width));
}
