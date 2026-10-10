import Image from "next/image";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  UserRound,
} from "lucide-react";
import { HERO_BACKGROUND_IMAGE } from "./constants";

export type NotecardMockProps = {
  category: string;
  title: string;
  body: string;
};

export function NotecardMock({ category, title, body }: NotecardMockProps) {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="relative overflow-hidden rounded-[1.25rem] p-5 sm:rounded-[1.5rem] sm:p-7 md:p-9"
      >
        <Image
          src={HERO_BACKGROUND_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 90vw, 520px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#7ec8e8]/25 via-[#e8f4fc]/40 to-[#f8fbff]/55"
          aria-hidden
        />

        <article
          className="relative overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
        >
          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 md:px-6 md:pt-6">
            <p className="text-sm font-medium text-[#737373]">{category}</p>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-[#a3a3a3] transition hover:text-[#525252]"
              aria-label="Edit card"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="bg-[#f3f4f6]/90 px-5 py-5 md:px-6 md:py-6">
            <h4 className="text-xl font-bold tracking-tight text-[#0a0a0a] md:text-2xl">
              {title}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-[#525252] md:text-[15px]">
              {body}
            </p>
          </div>

          <footer className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5">
            <div className="flex items-center gap-4 text-[#a3a3a3]">
              <Heart className="h-4 w-4" strokeWidth={1.75} />
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              <UserRound className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <MoreHorizontal
              className="h-4 w-4 text-[#a3a3a3]"
              strokeWidth={1.75}
            />
          </footer>
        </article>
      </div>
    </div>
  );
}
