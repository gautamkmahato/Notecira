"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useDismissOnOutsideClick } from "@/lib/editor/toolbar/hooks/use-dismiss-on-outside-click";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export type SelectProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  placeholder?: string;
  groupLabel?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  getOptionStyle?: (option: SelectOption<T>) => CSSProperties | undefined;
};

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  groupLabel,
  disabled = false,
  className = "",
  menuClassName = "",
  getOptionStyle,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useDismissOnOutsideClick(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="inline-flex h-8 w-full min-w-[120px] items-center justify-between gap-2 rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-3 text-left text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] transition hover:border-[var(--color-mid-gray-4)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={`shrink-0 text-[var(--color-mid-gray)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          className={`absolute left-0 top-full z-[var(--z-14)] mt-1.5 min-w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] py-1.5 shadow-[var(--shadow-md)] ${menuClassName}`}
          role="listbox"
        >
          {groupLabel ? (
            <p className="px-3 pb-1 pt-0.5 text-[var(--font-size-2xs)] font-medium text-[var(--color-mid-gray)]">
              {groupLabel}
            </p>
          ) : null}
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                style={getOptionStyle?.(option)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[var(--font-size-sm)] text-[var(--color-dark-gray-2)] transition hover:bg-[var(--notion-hover)] ${
                  isSelected ? "bg-[var(--color-white)]" : ""
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <Check
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-[var(--color-dark-gray-2)]"
                  />
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
