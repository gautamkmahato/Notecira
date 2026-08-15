"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-full w-[72px] shrink-0 flex-col items-center gap-1 bg-[var(--color-white-2)] py-4 shadow-[var(--shadow-lg)]"
      aria-label="Main navigation"
    >
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-dark-gray-2)] text-[var(--font-size-sm)] font-medium text-[var(--color-white)]">
        B
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex w-[60px] flex-col items-center gap-1 rounded-[var(--radius-xl)] px-1 py-2 text-center transition-colors duration-[var(--duration-fast)] ${
              isActive
                ? "bg-[var(--color-white)] text-[var(--color-dark-gray-2)] shadow-[var(--shadow-sm)]"
                : "text-[var(--color-mid-gray)] hover:bg-[var(--notion-hover)] hover:text-[var(--color-dark-gray-2)]"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[10px] font-medium leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
