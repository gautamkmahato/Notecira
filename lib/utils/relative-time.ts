export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = date.getTime() - Date.now();
  const absSec = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  const absMin = Math.round(absSec / 60);
  if (absMin < 60) return rtf.format(Math.round(diffMs / 60_000), "minute");
  const absHr = Math.round(absMin / 60);
  if (absHr < 24) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  const absDay = Math.round(absHr / 24);
  if (absDay < 30) return rtf.format(Math.round(diffMs / 86_400_000), "day");
  const absMonth = Math.round(absDay / 30);
  if (absMonth < 12) {
    return rtf.format(Math.round(diffMs / (86_400_000 * 30)), "month");
  }
  return rtf.format(Math.round(diffMs / (86_400_000 * 365)), "year");
}
