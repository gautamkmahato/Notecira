import Link from "next/link";
import { NotecardMock, type NotecardMockProps } from "./NotecardMock";
import { BRAND, LANDING_SECTION_PADDING } from "./constants";

function StartNowButton() {
  return (
    <Link
      href="/documents"
      className="inline-flex h-11 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#0a0a0a] px-8 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_4px_14px_rgba(0,0,0,0.12)] transition hover:bg-[#262626]"
    >
      Start Now
    </Link>
  );
}

type FeatureRowProps = {
  heading: string;
  description: string;
  card: NotecardMockProps;
  reverse?: boolean;
};

function FeatureRow({ heading, description, card, reverse }: FeatureRowProps) {
  return (
    <div
      className="mt-16 grid items-center gap-10 md:mt-20 md:gap-14 lg:grid-cols-2 lg:gap-16"
    >
      <div className={reverse ? "lg:order-2" : ""}>
        <h3
          className="text-2xl font-bold leading-tight tracking-tight text-[#0a0a0a] md:text-3xl lg:text-[2rem]"
        >
          {heading}
        </h3>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[#737373]">
          {description}
        </p>
        <div className="mt-8">
          <StartNowButton />
        </div>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <NotecardMock {...card} />
      </div>
    </div>
  );
}

const FEATURES: {
  heading: string;
  description: string;
  card: NotecardMockProps;
  reverse?: boolean;
}[] = [
  {
    heading: "Notion-style organization, built in",
    description:
      "Folders, starred pages, trash, and share links—plus rich blocks for text, lists, code, and more. Everything stays in one synced workspace.",
    card: {
      category: "Workspace",
      title: "Your whole library in one sidebar",
      body:
        "Group documents in folders, star what you open daily, and invite teammates with view or edit access. Block editing feels familiar, with less tab-hopping.",
    },
  },
  {
    reverse: true,
    heading: "Nested documents in columns",
    description:
      "Open sub-pages beside the parent instead of losing context. Drill into outlines, jump back with one click, and keep multiple levels visible at once.",
    card: {
      category: "Documents",
      title: "Branch without losing your place",
      body:
        "Each document can nest more documents in side columns—like an outline that expands horizontally. Perfect for specs, research, and long-form projects.",
    },
  },
  {
    heading: "Canvas blocks for visual thinking",
    description:
      "Sketch wireframes, diagrams, and whiteboard notes on an infinite canvas—embedded in the same doc as your prose, with shapes, arrows, stickies, and freehand draw.",
    card: {
      category: "Canvas",
      title: "Excalidraw-style boards inline",
      body:
        "Add a canvas block anywhere in a document. Select, resize, rotate, and multi-select elements. Keep visuals next to the words they explain.",
    },
  },
];

export function DigitalNotecardsSection() {
  return (
    <section
      className={`bg-white ${LANDING_SECTION_PADDING}`}
      aria-labelledby="notecards-heading"
      id="features"
    >
      <div className="mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex rounded-full bg-gradient-to-r from-[#dbeafe] via-[#e0e7ff] to-[#ede9fe] px-4 py-1.5 text-xs font-semibold text-[#1e3a5f] md:text-sm"
          >
            Why {BRAND}
          </span>
          <h2
            id="notecards-heading"
            className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
          >
            Write, organize, and sketch in one place
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#737373] md:text-lg">
            The three things teams reach for {BRAND} for: a familiar workspace,
            documents that nest in columns, and canvas blocks for ideas that
            do not fit in a paragraph.
          </p>
        </header>

        {FEATURES.map((feature) => (
          <FeatureRow key={feature.heading} {...feature} />
        ))}
      </div>
    </section>
  );
}
