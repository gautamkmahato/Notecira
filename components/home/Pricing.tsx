import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  BRAND,
  FREE_CLOUD_DOCUMENT_LIMIT,
  HERO_BACKGROUND_IMAGE,
  LANDING_SECTION_PADDING,
} from "./constants";

type Plan = {
  name: string;
  priceLabel: string;
  price: string;
  features: string[];
  footer: string;
  cta: string;
  href: string;
  variant: "default" | "highlight";
  popular?: boolean;
  primaryCta?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    priceLabel: "Hosted",
    price: "$0",
    features: [
      `Up to ${FREE_CLOUD_DOCUMENT_LIMIT} documents`,
      "Nested columns & sub-documents",
      "Block editor & canvas blocks",
      "Folders, stars & trash",
      "Share links (view & edit)",
    ],
    footer: "No credit card required",
    cta: "Get started free",
    href: "/documents",
    variant: "default",
  },
  {
    name: "Self-hosted",
    priceLabel: "Your infrastructure",
    price: "$0",
    popular: true,
    features: [
      "Unlimited documents",
      "Everything in Free",
      "Run on your server or laptop",
      "You own the data & backups",
      "Deploy with Node.js & your database",
    ],
    footer: "Full app, no document cap",
    cta: "Self-host Branch",
    href: "#self-host",
    variant: "highlight",
    primaryCta: true,
  },
];

function PlanCard(plan: Plan) {
  const headerBg =
    plan.variant === "highlight"
      ? "relative min-h-[148px] overflow-hidden rounded-2xl p-3"
      : "rounded-2xl bg-gradient-to-b from-[#e0f2fe]/70 via-[#f0f9ff]/30 to-white p-6 pb-5";

  return (
    <article
      className={`flex flex-col rounded-[1.5rem] border border-[#e5e5e5] bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)] ${
        plan.popular ? "lg:-mt-1 lg:shadow-[0_20px_50px_rgba(15,23,42,0.08)]" : ""
      }`}
    >
      <div className={headerBg}>
        {plan.variant === "highlight" ? (
          <>
            <Image
              src={HERO_BACKGROUND_IMAGE}
              alt=""
              fill
              className="object-cover object-center"
              sizes="360px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#7ec8e8]/20 via-[#e8f4fc]/50 to-[#f8fbff]/80"
              aria-hidden
            />
            <div className="relative rounded-xl bg-white/95 p-5 backdrop-blur-sm">
              <PlanCardHeader plan={plan} />
            </div>
          </>
        ) : (
          <PlanCardHeader plan={plan} />
        )}
      </div>

      <Link
        href={plan.href}
        className={`mt-5 flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
          plan.primaryCta
            ? "bg-[#0a0a0a] text-white hover:bg-[#262626]"
            : "border border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
        }`}
      >
        {plan.cta}
      </Link>

      <ul className="mt-6 flex-1 space-y-3.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm text-[#525252]"
          >
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d4d4d4] bg-white"
            >
              <Check className="h-3 w-3 text-[#0a0a0a]" strokeWidth={2.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-xs font-bold text-[#0a0a0a]">
        {plan.footer}
      </p>
    </article>
  );
}

function PlanCardHeader({ plan }: { plan: Plan }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-[#0a0a0a]">{plan.name}</h3>
        {plan.popular ? (
          <span
            className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b45309]"
          >
            Popular
          </span>
        ) : null}
      </div>
      <div
        className="mt-4 flex items-center justify-between border-b border-[#e5e5e5] pb-4 text-sm"
      >
        <span className="text-[#737373]">{plan.priceLabel}</span>
        <span className="text-2xl font-bold text-[#0a0a0a]">{plan.price}</span>
      </div>
    </>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className={`bg-white ${LANDING_SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex rounded-full bg-gradient-to-r from-[#dbeafe] via-[#e8f4fc] to-white px-4 py-1.5 text-xs font-semibold text-[#1e3a5f] ring-1 ring-[#e0f2fe] md:text-sm"
          >
            Pricing
          </span>
          <h2
            className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
          >
            Simple pricing for {BRAND}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#737373] md:text-lg">
            Use the hosted app free with up to {FREE_CLOUD_DOCUMENT_LIMIT}{" "}
            documents, or self-host for unlimited docs and full control.
          </p>
        </header>

        <div
          className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2 lg:mt-16 lg:items-stretch lg:gap-8"
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
