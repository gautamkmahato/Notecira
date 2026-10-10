import Image from "next/image";
import Link from "next/link";
import {
  HERO_BACKGROUND_IMAGE,
  HERO_MOCKUP_IMAGE,
  LANDING_SECTION_PADDING,
} from "./constants";
import { HeroNav } from "./HeroNav";
import { ArrowRightIcon, FolderGit } from "lucide-react";

export function Hero() {
  return (
    <section className="relative">
      <div
        className={`relative isolate overflow-hidden pt-4 md:pt-6 ${LANDING_SECTION_PADDING}`}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={HERO_BACKGROUND_IMAGE}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#e8f4fc]/25 via-[#f8fafc]/55 to-white"
            aria-hidden
          />
        </div>

        <div className="relative z-10">
          <HeroNav />

          <div className="mx-auto max-w-3xl px-6 pt-10 text-center md:pt-14">
            <h1
              className="mt-8 text-3xl font-bold leading-tight tracking-tight text-[#0a0a0a] md:text-5xl md:leading-[1.15]"
            >
              Organize Your Documents,
              <br className="hidden sm:block" />
              Blocks, and Ideas
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#737373] md:text-lg">
              Organize all your notes, nested pages, and canvas sketches in one
              clean workspace to stay focused, productive, and in control every
              day.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/documents"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#0a0a0a] px-10 text-sm font-semibold text-white transition hover:bg-[#262626]"
              >
                Try For Free
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/documents"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#0a0a0a] px-10 text-sm font-semibold text-white transition hover:bg-[#262626]"
              >
                <FolderGit className="mr-2 h-4 w-4" />
                Github
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-12 max-w-6xl px-4 md:mt-16 md:px-6">
            <Image
              src={HERO_MOCKUP_IMAGE}
              alt="Branch workspace preview"
              width={1200}
              height={720}
              priority
              unoptimized
              className="mx-auto w-full max-w-5xl rounded-2xl shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
