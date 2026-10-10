import Link from "next/link";
import { BRAND, HERO_NAV_LINKS } from "./constants";

export function HeroNav() {
  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-4">
      <div
        className="flex h-14 items-center justify-between gap-2 rounded-full border border-white/60 bg-white/55 px-3 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:gap-4 sm:px-6"
      >
        <Link
          href="/"
          className="shrink-0 text-sm font-bold tracking-tight text-[#0a0a0a] sm:text-lg"
        >
          {BRAND}
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-3 text-xs font-medium text-[#1a1a1a] sm:gap-6 sm:text-sm"
          aria-label="Primary"
        >
          {HERO_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap transition hover:text-[#525252]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/sign-in"
          className="shrink-0 rounded-full bg-[#0a0a0a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#262626] sm:px-5 sm:text-sm"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
