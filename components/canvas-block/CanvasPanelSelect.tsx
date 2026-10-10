"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useDismissOnOutsideClick } from "@/lib/editor/toolbar/hooks/use-dismiss-on-outside-click";
import { canvasToolRing } from "@/lib/ui/notion";

export type CanvasPanelSelectOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type CanvasPanelSelectProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly CanvasPanelSelectOption<T>[];
  title?: string;
  ariaLabel?: string;
  className?: string;
};

export function CanvasPanelSelect<T extends string = string>({
  value,
  onChange,
  options,
  title,
  ariaLabel,
  className = "",
}: CanvasPanelSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useDismissOnOutsideClick(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`} title={title}>
      <button
        type="button"
        aria-label={ariaLabel ?? title}
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-8 w-full min-w-0 items-center justify-between gap-1 rounded-lg border bg-white px-2 text-[11px] text-[var(--color-dark-gray-2)] transition ${
          open
            ? canvasToolRing
            : "border-[var(--color-border)] hover:border-[var(--color-mid-gray-4)]"
        }`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={`shrink-0 text-[var(--color-mid-gray)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-[var(--z-14)] mt-1 max-h-52 w-full min-w-[120px] overflow-auto rounded-lg border border-[var(--color-light-gray-2)] bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-[12px] text-[var(--color-dark-gray-2)] transition hover:bg-[var(--notion-hover)] ${
                  isSelected ? "bg-[var(--notion-hover)]" : ""
                }`}
              >
                {option.icon ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {option.icon}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected ? (
                  <Check size={14} strokeWidth={2.25} className="shrink-0 text-[var(--color-dark-gray-2)]" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
