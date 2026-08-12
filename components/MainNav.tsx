"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M7 4h7l3 3v13H7z" />
        <path d="M14 4v4h4" />
        <path d="M10 12h6M10 16h6" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    ),
  },
  {
    href: "/trash",
    label: "Trash",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12" />
        <path d="M10 11v5M14 11v5" />
      </svg>
    ),
  },
] as const;

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-full w-[72px] shrink-0 flex-col items-center gap-1 border-r border-slate-200/90 bg-[#eef2f6] py-4"
      aria-label="Main navigation"
    >
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-serif text-sm text-white">
        B
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex w-[60px] flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition ${
              isActive
                ? "bg-white text-teal-800 shadow-sm"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
