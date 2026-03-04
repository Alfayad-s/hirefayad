"use client";

import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/layout/locale-link";
import { usePrice } from "@/hooks/use-price";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { Check, Zap, Star, Crown } from "lucide-react";
import type { Service } from "@/types";
import type { Session } from "next-auth";

type Props = { service: Service; locale: string; id: string; index: number; session?: Session | null };

const TIER_META = [
  {
    id: "basic" as const,
    label: "Basic",
    icon: Zap,
    color: "text-zinc-400",
    border: "border-zinc-700",
    bg: "bg-zinc-900/80",
  },
  {
    id: "pro" as const,
    label: "Pro",
    icon: Star,
    color: "text-amber-600 dark:text-yellow-400",
    border: "border-amber-500/60 dark:border-yellow-500/50",
    bg: "bg-amber-500/10 dark:bg-yellow-500/5",
    highlight: true,
  },
  {
    id: "premium" as const,
    label: "Premium",
    icon: Crown,
    color: "text-zinc-200",
    border: "border-zinc-600",
    bg: "bg-zinc-800/80",
  },
];

/** Expanded horizontal pricing card with title, price row, divider, and feature list */
function PricingCardHorizontal({
  tier,
  price,
  features,
  highlight,
  selected,
  onSelect,
}: {
  tier: (typeof TIER_META)[0];
  price: string;
  features: string[];
  highlight?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px)");
   const [showAll, setShowAll] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015,1.015,1.015)`
    );
  }

  function handleMouseLeave() {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  }

  const Icon = tier.icon;

  const MAX_FEATURES_INITIAL = 6;
  const visibleFeatures = showAll ? features : features.slice(0, MAX_FEATURES_INITIAL);
  const hasMore = features.length > MAX_FEATURES_INITIAL;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      className="relative cursor-pointer"
      style={{ transition: "transform 0.15s ease-out" }}
    >
      {/* Glow behind highlighted card */}
      {(highlight || selected) && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
          style={{
            background: "linear-gradient(135deg, #f5c518 0%, transparent 55%)",
            filter: "blur(3px)",
          }}
        />
      )}

      <div
        style={{
          transform,
          transition: "transform 0.15s ease-out",
          boxShadow: highlight
            ? "0 8px 32px rgba(245,197,24,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        className={`relative rounded-2xl border backdrop-blur-sm ${tier.border} ${tier.bg} ${
          selected ? "ring-2 ring-amber-400/80" : ""
        }`}
      >
        {/* Popular badge */}
        {highlight && (
          <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 dark:bg-yellow-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
            Popular
          </span>
        )}

        {/* ── Top row: icon · label · price · tag ── */}
        <div className="flex items-center gap-4 px-5 pt-4 pb-3">
          {/* Icon + label */}
          <div className={`flex items-center gap-2 w-24 shrink-0 ${tier.color}`}>
            <Icon className="size-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              {tier.label}
            </span>
          </div>

          {/* Vertical divider */}
          <div
            className={`self-stretch w-px ${
              highlight ? "bg-amber-500/30 dark:bg-yellow-500/25" : "bg-zinc-700/50"
            }`}
          />

          {/* Price */}
          <span
            className={`text-2xl font-black tabular-nums ${
              highlight ? "text-amber-600 dark:text-yellow-400" : "text-white"
            }`}
          >
            {price}
          </span>

          <div className="flex-1" />

          {/* One-time tag */}
          <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
            One-time
          </span>
        </div>

        {/* ── Horizontal divider ── */}
        <div
          className={`mx-5 h-px ${
            highlight ? "bg-amber-500/25 dark:bg-yellow-500/20" : "bg-zinc-700/40"
          }`}
        />

        {/* ── Features list ── */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 px-5 pt-3 pb-2">
          {visibleFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                  highlight
                    ? "bg-amber-500/20 text-amber-600 dark:bg-yellow-500/15 dark:text-yellow-400"
                    : "bg-zinc-700/60 text-zinc-400"
                }`}
              >
                <Check className="size-2.5" />
              </span>
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAll((v) => !v);
            }}
            className="px-5 pb-3 text-[11px] font-medium text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline"
          >
            {showAll ? "Show fewer features" : `Show ${features.length - visibleFeatures.length} more features`}
          </button>
        )}
      </div>
    </div>
  );
}

export function ServiceSection({ service, locale, id, index, session }: Props) {
  const t = useTranslations("Services");
  const minPrice = Math.min(
    service.pricing.basic,
    service.pricing.pro,
    service.pricing.premium
  );
  const startingPrice = usePrice(minPrice);
  const basicPrice = usePrice(service.pricing.basic);
  const proPrice = usePrice(service.pricing.pro);
  const premiumPrice = usePrice(service.pricing.premium);

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedTier, setSelectedTier] =
    useState<"basic" | "pro" | "premium">("pro");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Per-tier features: always show common features + any tier-specific extras
  const baseFeatures = service.features ?? [];
  const tiered = (service as any).tieredFeatures as
    | { text: string; tiers: ("basic" | "pro" | "premium")[] }[]
    | undefined;

  const tiers = [
    {
      ...TIER_META[0],
      price: basicPrice,
      features: [
        ...baseFeatures,
        ...(tiered
          ? tiered
              .filter((f) => f.tiers?.includes("basic"))
              .map((f) => f.text)
              .filter((txt) => !baseFeatures.includes(txt))
          : []),
      ],
    },
    {
      ...TIER_META[1],
      price: proPrice,
      highlight: true as const,
      features: [
        ...baseFeatures,
        ...(tiered
          ? tiered
              .filter((f) => f.tiers?.includes("pro"))
              .map((f) => f.text)
              .filter((txt) => !baseFeatures.includes(txt))
          : []),
      ],
    },
    {
      ...TIER_META[2],
      price: premiumPrice,
      features: [
        ...baseFeatures,
        ...(tiered
          ? tiered
              .filter((f) => f.tiers?.includes("premium"))
              .map((f) => f.text)
              .filter((txt) => !baseFeatures.includes(txt))
          : []),
      ],
    },
  ] as (typeof TIER_META[number] & { price: string; features: string[] })[];

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative flex min-h-full flex-col justify-center overflow-hidden px-4 py-16"
    >
      {/* ── Main two-column grid ── */}
      <div
        className="relative mx-auto w-full max-w-6xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

          {/* ════════════════════════════════
              LEFT COLUMN — image + info
          ════════════════════════════════ */}
          <div className="flex flex-col gap-6">

            {/* Index label */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-500">
                Service {String(index + 1).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Service image */}
            <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-zinc-900 border border-zinc-800">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                /* Placeholder when no image is provided */
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-zinc-600 text-sm">No image</span>
                </div>
              )}
              {/* Subtle overlay for text legibility if you ever overlay anything */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Title */}
            <h2
              className="text-3xl font-black tracking-tight text-foreground md:text-4xl"
              style={{ lineHeight: 1.1 }}
            >
              {service.title}
            </h2>

            {/* Description */}
            <p className="text-base leading-relaxed text-muted-foreground">
              {service.description}
            </p>

            {/* Features */}
            <ul className="space-y-3">
              {service.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-foreground"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-16px)",
                    transition: `opacity 0.5s ease ${0.1 + i * 0.07}s, transform 0.5s ease ${0.1 + i * 0.07}s`,
                  }}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {session?.user ? (
                <>
                  <Button
                    size="lg"
                    className="rounded-full bg-yellow-400 px-8 font-bold text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(245,197,24,0.25)] hover:shadow-[0_0_40px_rgba(245,197,24,0.4)] transition-all duration-300"
                    onClick={() => {
                      document
                        .getElementById("coupon")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {t("applyCoupon")}
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full border-border bg-transparent text-foreground hover:bg-muted hover:border-ring px-8 transition-all duration-300"
                  >
                    <LocaleLink
                      href={`/quote?serviceId=${service._id}&tier=${selectedTier}`}
                      locale={locale}
                    >
                      {t("getQuote")}
                    </LocaleLink>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-yellow-400 px-8 font-bold text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(245,197,24,0.25)] hover:shadow-[0_0_40px_rgba(245,197,24,0.4)] transition-all duration-300"
                  >
                    <LocaleLink href="/signup" locale={locale}>
                      {t("applyCoupon")}
                    </LocaleLink>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-border bg-transparent text-foreground hover:bg-muted hover:border-ring px-8 transition-all duration-300"
                  >
                    <LocaleLink
                      href={`/login?callbackUrl=${encodeURIComponent(`/${locale}/quote?serviceId=${service._id}&tier=${selectedTier}`)}`}
                      locale={locale}
                    >
                      {t("getQuote")}
                    </LocaleLink>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ════════════════════════════════
              RIGHT COLUMN — title + pricing cards with features
          ════════════════════════════════ */}
          <div className="flex flex-col gap-5 lg:pt-10">

            {/* Service title + starting price above cards */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(-12px)",
                transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
              }}
            >
              <h2
                className="text-2xl font-black tracking-tight text-foreground md:text-3xl"
                style={{ lineHeight: 1.15 }}
              >
                {service.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("startingFrom")}{" "}
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {startingPrice}
                </span>
              </p>
            </div>

            {/* Tier cards — each with icon/price row + feature list */}
            <div className="flex flex-col gap-4">
              {tiers.map((tier, i) => (
                <div
                  key={tier.label}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(24px)",
                    transition: `opacity 0.5s ease ${0.25 + i * 0.1}s, transform 0.5s ease ${0.25 + i * 0.1}s`,
                  }}
                >
                  <PricingCardHorizontal
                    tier={tier}
                    price={tier.price}
                    features={tier.features}
                    highlight={tier.highlight}
                    selected={selectedTier === tier.id}
                    onSelect={() => setSelectedTier(tier.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}