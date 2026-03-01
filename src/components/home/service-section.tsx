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
  { label: "Basic", icon: Zap, color: "text-zinc-400", border: "border-zinc-700", bg: "bg-zinc-900" },
  { label: "Pro", icon: Star, color: "text-amber-700 dark:text-yellow-400", border: "border-amber-500/50 dark:border-yellow-500/50", bg: "bg-amber-500/10 dark:bg-yellow-500/5", highlight: true },
  { label: "Premium", icon: Crown, color: "text-zinc-200", border: "border-zinc-600", bg: "bg-zinc-800/80" },
];

function PricingCard({
  tier,
  price,
  highlight,
}: {
  tier: (typeof TIER_META)[0];
  price: string;
  highlight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px)");

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -18;
    const rotateY = ((x / rect.width) - 0.5) * 18;
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04,1.04,1.04)`
    );
  }

  function handleMouseLeave() {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  }

  const Icon = tier.icon;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-default"
      style={{ transition: "transform 0.15s ease-out" }}
    >
      {/* Glow behind highlighted card */}
      {highlight && (
        <div
          className="absolute -inset-px rounded-2xl opacity-60"
          style={{
            background: "linear-gradient(135deg, #f5c518, transparent 60%)",
            filter: "blur(1px)",
          }}
        />
      )}

      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur-sm ${tier.border} ${tier.bg}`}
        style={{
          transform,
          transition: "transform 0.15s ease-out",
          boxShadow: highlight
            ? "0 20px 60px rgba(245,197,24,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {highlight && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 dark:bg-yellow-400 px-3 py-0.5 text-xs font-bold text-black">
            POPULAR
          </div>
        )}

        <div className={`flex items-center gap-2 ${tier.color}`}>
          <Icon className="size-4" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            {tier.label}
          </span>
        </div>

        <div className="mt-2">
          <span className={`text-3xl font-black ${highlight ? "text-amber-700 dark:text-yellow-400" : "text-white"}`}>
            {price}
          </span>
        </div>

        {/* Decorative line */}
        <div
          className={`h-px w-full ${highlight ? "bg-amber-500/40 dark:bg-yellow-500/30" : "bg-zinc-700/50"}`}
        />

        <p className={`text-xs ${highlight ? "text-zinc-600 dark:text-zinc-500" : "text-zinc-500"}`}>One-time project</p>
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

  // Scroll-reveal
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tiers = [
    { ...TIER_META[0], price: basicPrice },
    { ...TIER_META[1], price: proPrice, highlight: true },
    { ...TIER_META[2], price: premiumPrice },
  ];

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative min-h-full snap-start snap-always flex flex-col justify-center overflow-hidden px-4 py-16"
    >
      {/* Content */}
      <div
        className="relative mx-auto w-full max-w-5xl px-8 py-12 md:px-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Index label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-500">
            Service {String(index + 1).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: title, desc, features */}
          <div>
            <h2
              className="text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl"
              style={{ lineHeight: 1.1 }}
            >
              {service.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {service.description}
            </p>

            <ul className="mt-8 space-y-3">
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

            <div className="mt-10 flex flex-wrap gap-3">
              {session?.user ? (
                <Button
                  size="lg"
                  className="rounded-full bg-yellow-400 px-8 font-bold text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(245,197,24,0.25)] hover:shadow-[0_0_40px_rgba(245,197,24,0.4)] transition-all duration-300"
                  onClick={() => {
                    const el = document.getElementById("coupon");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {t("applyCoupon")}
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-yellow-400 px-8 font-bold text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(245,197,24,0.25)] hover:shadow-[0_0_40px_rgba(245,197,24,0.4)] transition-all duration-300"
                >
                  <LocaleLink href="/signup" locale={locale}>
                    {t("applyCoupon")}
                  </LocaleLink>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-border bg-transparent text-foreground hover:bg-muted hover:border-ring px-8 transition-all duration-300"
              >
                <LocaleLink href="/signup" locale={locale}>
                  {t("getQuote")}
                </LocaleLink>
              </Button>
            </div>
          </div>

          {/* Right: 3D pricing cards */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("startingFrom")}{" "}
              <span className="text-yellow-600 dark:text-yellow-400">{startingPrice}</span>
            </p>
            <div className="grid gap-4">
              {tiers.map((tier) => (
                <PricingCard
                  key={tier.label}
                  tier={tier}
                  price={tier.price}
                  highlight={tier.highlight}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}