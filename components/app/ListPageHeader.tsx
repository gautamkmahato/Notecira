import type { LucideIcon } from "lucide-react";
import { Search, SlidersHorizontal } from "lucide-react";

type ListPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  sortLabel: string;
  onSortClick: () => void;
};

export function ListPageHeader({
  icon: Icon,
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder,
  sortLabel,
  onSortClick,
}: ListPageHeaderProps) {
  return (
    <header className="border-b border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <Icon
              className="h-6 w-6 shrink-0 text-[var(--color-dark-gray-2)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-dark-gray-2)]">
              {title}
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-[var(--font-size-sm)] leading-relaxed text-[var(--color-mid-gray)]">
            {description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          <label className="relative flex min-w-0 flex-1 sm:min-w-[220px] lg:w-56">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-mid-gray)]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] py-2 pl-10 pr-4 text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] outline-none ring-[var(--color-dark-gray-2)] placeholder:text-[var(--color-mid-gray)] focus:ring-2"
            />
          </label>
          <button
            type="button"
            onClick={onSortClick}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-4 text-[var(--font-size-sm)] font-medium text-[var(--color-dark-gray-2)] transition hover:bg-[var(--notion-hover)]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[var(--color-mid-gray)]" aria-hidden />
            {sortLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
