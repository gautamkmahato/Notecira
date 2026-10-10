/** Dark document card shell (grid + list). */
export const documentCardShell =
  "group relative overflow-hidden border border-white/[0.06] bg-[#1a1c1e] text-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition duration-200 hover:border-white/[0.12] hover:shadow-[0_16px_48px_rgba(15,23,42,0.18)]";

export const documentCardPattern =
  "pointer-events-none absolute inset-0 opacity-[0.22] [background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='0.6' d='M0 220c40-30 80-30 120 0s80 30 120 0 80-30 120 0 80 30 120 0'/%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='0.6' d='M0 120c50-35 100-35 150 0s100 35 150 0 100-35 150 0 100 35 150 0'/%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='0.6' d='M0 320c35-25 70-25 105 0s70 25 105 0 70-25 105 0 70 25 105 0'/%3E%3C/svg%3E\")] [background-size:280px_280px]";

export function formatDocumentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
