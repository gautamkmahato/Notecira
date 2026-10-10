import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Columns3,
  FolderTree,
  Link2,
  PencilRuler,
  TextCursorInput,
} from "lucide-react";
import { BRAND, HERO_BACKGROUND_IMAGE, LANDING_SECTION_PADDING } from "./constants";

type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: FeatureItem[] = [
  {
    title: "Nested columns",
    description:
      "Open child documents beside the parent so your outline and deep pages stay visible at once.",
    icon: Columns3,
  },
  {
    title: "Rich block editor",
    description:
      "Write with blocks for text, checklists, code, and more—structured like Notion, tuned for focus.",
    icon: TextCursorInput,
  },
  {
    title: "Canvas blocks",
    description:
      "Drop an infinite sketch surface into any doc—draw, diagram, and annotate next to your words.",
    icon: PencilRuler,
  },
  {
    title: "Folders & favorites",
    description:
      "Organize pages in folders, star what you open daily, and restore from trash when you need it.",
    icon: FolderTree,
  },
  {
    title: "Share links",
    description:
      "Invite teammates or clients with view or edit links—review drafts without exporting PDFs.",
    icon: Link2,
  },
  {
    title: "Synced workspace",
    description:
      "Documents and blocks persist to your workspace so updates follow you across sessions.",
    icon: Cloud,
  },
];

function FeatureCard({ title, description, icon: Icon }: FeatureItem) {
  return (
    <article className="flex flex-col">
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden rounded-[1.25rem] p-8 sm:h-48 sm:rounded-[1.5rem]"
      >
        <Image
          src={HERO_BACKGROUND_IMAGE}
          alt=""
          fill
          unoptimized
          className="scale-[1.12] object-cover object-center blur-[10px] sm:blur-[12px]"
          sizes="(max-width: 1024px) 50vw, 360px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/55 via-[#f8fbff]/45 to-white/60"
          aria-hidden
        />
        <div
          className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06]"
        >
          <Icon
            className="h-9 w-9 text-[#0a0a0a]"
            strokeWidth={2.25}
            aria-hidden
          />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-[#0a0a0a]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#737373]">
        {description}
      </p>
    </article>
  );
}

export function FeaturesGridSection() {
  return (
    <section
      className={`bg-white ${LANDING_SECTION_PADDING}`}
      aria-labelledby="features-grid-heading"
      id="all-features"
    >
      <div className="mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex rounded-full bg-gradient-to-r from-[#dbeafe] via-[#e8f4fc] to-white px-4 py-1.5 text-xs font-semibold text-[#1e3a5f] ring-1 ring-[#e0f2fe] md:text-sm"
          >
            Features
          </span>
          <h2
            id="features-grid-heading"
            className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
          >
            Everything you need in one app
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#737373] md:text-lg">
            Organize, write, and sketch in {BRAND}—nested docs, block editing,
            canvas blocks, and sharing without switching tools.
          </p>
        </header>

        <div
          className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:mt-16 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-14 flex justify-center md:mt-16">
          <Link
            href="/documents"
            className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-[#0a0a0a] px-10 text-sm font-semibold text-white transition hover:bg-[#262626]"
          >
            See All Features
          </Link>
        </div>
      </div>
    </section>
  );
}
