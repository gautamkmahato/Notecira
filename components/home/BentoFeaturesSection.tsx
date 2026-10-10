import type { ReactNode } from "react";
import { BRAND, LANDING_SECTION_PADDING } from "./constants";
import {
  BentoSkyPanel,
  BlocksCanvasVisual,
  NestedColumnsVisual,
  ShareLinksVisual,
  SpacesVisual,
  WorkspaceVisual,
} from "./bento/BentoCardVisuals";

type BentoCardData = {
  title: string;
  description: string;
  visual: ReactNode;
  skyMinHeight?: string;
};

const ROW_ONE: BentoCardData[] = [
  {
    title: "All-in-one workspace",
    description:
      "Notion-style blocks, folders, and sidebar—nested documents, lists, and code in one calm library.",
    visual: <WorkspaceVisual />,
    skyMinHeight: "min-h-[200px] sm:min-h-[220px]",
  },
  {
    title: "Blocks & canvas",
    description:
      "Headings, checklists, code, and Excalidraw-style canvas blocks on the same page.",
    visual: <BlocksCanvasVisual />,
    skyMinHeight: "min-h-[200px] sm:min-h-[220px]",
  },
];

const ROW_TWO: BentoCardData[] = [
  {
    title: "Smart spaces",
    description:
      "Group work in folders, star daily pages, and keep drafts separate but one click away.",
    visual: <SpacesVisual />,
    skyMinHeight: "min-h-[148px]",
  },
  {
    title: "Rich document previews",
    description:
      "Open nested columns beside parents—see structure and sub-pages before you dive in.",
    visual: <NestedColumnsVisual />,
    skyMinHeight: "min-h-[148px]",
  },
  {
    title: "Instant share links",
    description:
      "Send view or edit links without exporting PDFs. Reviewers open live docs in Branch.",
    visual: <ShareLinksVisual />,
    skyMinHeight: "min-h-[148px]",
  },
];

function BentoCard({
  title,
  description,
  visual,
  skyMinHeight,
}: BentoCardData) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#e8ecef] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]"
    >
      <BentoSkyPanel minHeight={skyMinHeight}>{visual}</BentoSkyPanel>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
        <h3
          className="text-xl font-semibold leading-snug tracking-tight text-[#0f172a] sm:text-[1.35rem]"
        >
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-[#64748b]">
          {description}
        </p>
      </div>
    </article>
  );
}

function BentoRow({
  cards,
  columns,
}: {
  cards: BentoCardData[];
  columns: "2" | "3";
}) {
  const gridClass =
    columns === "2"
      ? "grid gap-4 sm:gap-5 md:grid-cols-2"
      : "grid gap-4 sm:gap-5 md:grid-cols-3";

  return (
    <div className={gridClass}>
      {cards.map((card) => (
        <BentoCard key={card.title} {...card} />
      ))}
    </div>
  );
}

export function BentoFeaturesSection() {
  return (
    <section
      className={`bg-white ${LANDING_SECTION_PADDING}`}
      aria-labelledby="bento-features-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex rounded-full bg-[#ecfdf5] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#047857] md:text-[11px]"
          >
            Product
          </span>
          <h2
            id="bento-features-heading"
            className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
          >
            One workspace for notes, docs, and canvas
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#737373] md:text-lg">
            {BRAND} combines nested documents, block editing, and sketch
            surfaces—so you plan, write, and diagram without leaving the page.
          </p>
        </header>

        <div className="mt-12 flex flex-col gap-4 sm:mt-14 sm:gap-5">
          <BentoRow cards={ROW_ONE} columns="2" />
          <BentoRow cards={ROW_TWO} columns="3" />
        </div>
      </div>
    </section>
  );
}
