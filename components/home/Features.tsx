import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Folder,
  Layers,
  Link2,
  Maximize2,
  Search,
} from "lucide-react";
import { BRAND, LANDING_SECTION_PADDING } from "./constants";

const FOLDERS = [
  "Projects",
  "Design",
  "Marketing",
  "Resources",
  "Archive",
];

const BULLETS = [
  {
    icon: FileText,
    label: "Nested documents open beside your outline",
  },
  {
    icon: Maximize2,
    label: "Excalidraw-style canvas blocks in the same doc",
  },
  {
    icon: Link2,
    label: "Share links with view or edit access",
  },
  {
    icon: Layers,
    label: "Folders, trash, and versioned workspace sync",
  },
];

function TabletMock() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div
        className="absolute left-1/2 top-0 z-20 w-[148px] -translate-x-1/2 -translate-y-[42%] rounded-xl border border-[#f0f0f0] bg-white px-3 py-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.1)]"
      >
        <div className="flex items-center gap-2">
          <Folder className="h-3.5 w-3.5 text-[#0a0a0a]" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-[#0a0a0a]">
            Folders
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[#e5e5e5]" />
      </div>

      <div
        className="relative aspect-[16/9] rounded-[1.35rem] border-[7px] border-[#0a0a0a] bg-[#0a0a0a] p-1.5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
      >
        <div className="flex h-full overflow-hidden rounded-[0.95rem] bg-[#fafafa]">
          <aside className="w-[30%] shrink-0 border-r border-[#f0f0f0] bg-[#f5f5f5] px-2.5 py-3">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <Folder className="h-3 w-3 text-[#0a0a0a]" strokeWidth={2} />
              <span className="text-[9px] font-semibold text-[#737373]">
                Folders
              </span>
            </div>
            <ul className="space-y-1">
              {FOLDERS.map((name, index) => (
                <li
                  key={name}
                  className={`flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[10px] font-medium ${
                    index === 0
                      ? "bg-white text-[#0a0a0a] shadow-sm"
                      : "text-[#525252]"
                  }`}
                >
                  <Folder
                    className="h-3 w-3 shrink-0 text-[#0a0a0a]"
                    strokeWidth={2}
                  />
                  {name}
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col p-3">
            <div
              className="flex flex-1 items-center justify-center rounded-lg border border-[#f0f0f0] bg-white"
            >
              <FileText className="h-6 w-6 text-[#0a0a0a]" strokeWidth={1.5} />
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-[#0a0a0a]" strokeWidth={2} />
                <div className="h-1.5 flex-1 rounded-full bg-[#e5e5e5]" />
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-[#0a0a0a]" strokeWidth={2} />
                <div className="h-1.5 w-4/5 rounded-full bg-[#e5e5e5]" />
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-[#0a0a0a]" strokeWidth={2} />
                <div className="h-1.5 w-3/5 rounded-full bg-[#e5e5e5]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className={`bg-white ${LANDING_SECTION_PADDING}`}
      aria-labelledby="organise-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="organise-heading"
          className="text-center text-3xl font-semibold tracking-tight text-[#0a0a0a] md:text-4xl lg:text-[2.5rem]"
        >
          Organise effortlessly with {BRAND}
        </h2>

        <div
          className="mt-14 grid items-center gap-12 lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)_minmax(0,0.85fr)] lg:gap-8"
        >
          <div>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a0a0a] text-white"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3
              className="mt-5 text-2xl font-semibold tracking-tight text-[#0a0a0a] md:text-[1.75rem]"
            >
              Easy to navigate
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#64748b]">
              Jump between root documents and nested columns without losing your
              place. Your sidebar stays in sync as you drill into sub-pages.
            </p>
            <Link
              href="/documents"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#0a0a0a] px-6 text-sm font-semibold text-white transition hover:bg-[#262626]"
            >
              Get started
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          <TabletMock />

          <ul className="space-y-5">
            {BULLETS.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#0a0a0a] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="pt-1.5 text-sm leading-snug text-[#475569]">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
