import Link from "next/link";
import {
  FileStack,
  Globe,
  Link2,
  MessageCircle,
  Monitor,
  Share2,
} from "lucide-react";
import { BRAND, LANDING_SECTION_PADDING } from "./constants";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#all-features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Get started", href: "/documents" },
  ],
  Company: [
    { label: "About", href: "/" },
    { label: "Careers", href: "/sign-in" },
    { label: "Contact", href: "/sign-in" },
  ],
  Resources: [
    { label: "Blog", href: "/sign-in" },
    { label: "Help center", href: "/sign-in" },
    { label: "Self-host guide", href: "#self-host" },
  ],
} as const;

function BranchLogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#22c55e] text-white shadow-sm"
      aria-hidden
    >
      <FileStack className="h-5 w-5" strokeWidth={2} />
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={`bg-white px-4 sm:px-6 ${LANDING_SECTION_PADDING}`}>
      <div
        className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-[#87BEEF] px-6 py-10 shadow-[0_24px_60px_rgba(59,130,246,0.18)] sm:rounded-[2rem] sm:px-10 sm:py-12 md:px-12"
      >
        <div
          className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16"
        >
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BranchLogoMark />
              <span
                className="text-2xl font-bold text-white"
              >
                {BRAND}
              </span>
            </Link>
            <p
              className="mt-4 text-base leading-relaxed text-white/95 sm:text-lg"
            >
              Built for nested documents, canvas blocks, and calm organization—
              write and sketch in one workspace.
            </p>

            <p
              className="mt-8 text-sm font-semibold text-[#ecfccb]"
            >
              Get the app
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/documents"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#0f172a] shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition hover:bg-[#f8fafc]"
              >
                <Monitor className="h-4 w-4" strokeWidth={2} />
                Open in web app
              </Link>
              <Link
                href="#self-host"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#0f172a] shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition hover:bg-[#f8fafc]"
              >
                <Globe className="h-4 w-4" strokeWidth={2} />
                Self-host setup
              </Link>
            </div>

            <p
              className="mt-8 text-sm font-semibold text-white"
            >
              Social media
            </p>
            <div className="mt-3 flex gap-2.5">
              {[
                { icon: MessageCircle, label: "Community" },
                { icon: Share2, label: "Share" },
                { icon: Link2, label: "Links" },
              ].map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="/sign-in"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#334155] shadow-sm transition hover:bg-white"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6 lg:justify-items-end"
          >
            {(
              Object.entries(FOOTER_LINKS) as [
                keyof typeof FOOTER_LINKS,
                (typeof FOOTER_LINKS)[keyof typeof FOOTER_LINKS],
              ][]
            ).map(([title, links]) => (
              <div key={title}>
                <p
                  className="text-sm font-bold text-white"
                >
                  {title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/90 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-10 border-t border-white/25 pt-6 sm:mt-12 sm:flex sm:items-center sm:justify-between sm:gap-4"
        >
          <p className="text-xs text-white/90 sm:text-sm">
            © {year} {BRAND}. All rights reserved.
          </p>
          <div
            className="mt-4 flex flex-wrap gap-6 sm:mt-0"
          >
            <Link
              href="/sign-in"
              className="text-xs text-white/90 hover:text-white sm:text-sm"
            >
              Privacy policy
            </Link>
            <Link
              href="/sign-in"
              className="text-xs text-white/90 hover:text-white sm:text-sm"
            >
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
