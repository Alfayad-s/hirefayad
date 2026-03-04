"use client";

import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/layout/locale-link";
import { usePrice } from "@/hooks/use-price";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Service } from "@/types";
import type { Session } from "next-auth";
import { PricingCardHorizontal, TIER_META } from "@/components/pricing-card-horizontal";

type Props = {
  service: Service;
  locale: string;
  id: string;
  index: number;
  session?: Session | null;
  variant?: "home" | "detail";
};

const TIER_META_LOCAL = TIER_META;

export function ServiceSection({
  service,
  locale,
  id,
  index,
  session,
  variant = "home",
}: Props) {
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

  // Per-tier features: Basic shows full list, higher tiers show only incremental extras
  const baseFeatures = service.features ?? [];
  const tiered = (service as any).tieredFeatures as
    | { text: string; tiers: ("basic" | "pro" | "premium")[] }[]
    | undefined;

  const collectForTier = (tier: "basic" | "pro" | "premium") => {
    const tierTexts = tiered
      ? tiered
          .filter((f) => f.tiers?.includes(tier))
          .map((f) => f.text)
      : [];
    return Array.from(new Set([...baseFeatures, ...tierTexts]));
  };

  const basicAll = collectForTier("basic");
  const proAll = collectForTier("pro");
  const premiumAll = collectForTier("premium");

  const proExtras = proAll.filter((text) => !basicAll.includes(text));
  const premiumExtras = premiumAll.filter((text) => !proAll.includes(text));

  const tiers = [
    {
      ...TIER_META_LOCAL[0],
      price: basicPrice,
      features: basicAll,
      delivery: service.deliveryTime?.basic,
    },
    {
      ...TIER_META_LOCAL[1],
      price: proPrice,
      highlight: true as const,
      features: proExtras,
      includeLabel: basicAll.length ? "Includes everything in Basic plan" : undefined,
      delivery: service.deliveryTime?.pro,
    },
    {
      ...TIER_META_LOCAL[2],
      price: premiumPrice,
      features: premiumExtras,
      includeLabel: proAll.length ? "Includes everything in Pro plan" : undefined,
      delivery: service.deliveryTime?.premium,
    },
  ] as (typeof TIER_META_LOCAL[number] & {
    price: string;
    features: string[];
    includeLabel?: string;
    delivery?: string;
  })[];

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

            {/* Tagline / description */}
            {service.shortTagline ? (
              <>
                <p className="text-sm font-medium text-yellow-500">
                  {service.shortTagline}
                </p>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </>
            ) : (
              <p className="text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            )}

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

            {/* Technologies */}
            {service.technologies?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {service.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-yellow-500/40 bg-yellow-500/5 px-3 py-1 text-xs font-medium text-yellow-500"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-full border-border bg-transparent text-foreground hover:bg-muted hover:border-ring px-8 transition-all duration-300"
              >
                <LocaleLink
                  href={`/services/${service._id}`}
                  locale={locale}
                >
                  View details
                </LocaleLink>
              </Button>
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
                  includeLabel={tier.includeLabel}
                  delivery={tier.delivery}
                  onSelect={() => setSelectedTier(tier.id)}
                />
              </div>
            ))}
          </div>

          {/* What's included / not included, add-ons, FAQ, process, guarantees */}
          {variant === "detail" &&
            (service.whatsIncluded ||
              service.whatsNotIncluded?.length ||
              service.addOns?.length ||
              service.faqs?.length ||
              service.process?.length ||
              service.guarantees?.length) && (
            <div className="mt-6 space-y-4">
              {(service.whatsIncluded ||
                service.whatsNotIncluded?.length) && (
                <div className="rounded-2xl border border-border bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    What’s included
                  </h3>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {service.whatsIncluded?.allTiers &&
                      service.whatsIncluded.allTiers.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            All plans
                          </p>
                          <ul className="mt-1 space-y-1.5 text-xs text-muted-foreground">
                            {service.whatsIncluded.allTiers.map(
                              (item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {service.whatsIncluded?.proAndAbove &&
                      service.whatsIncluded.proAndAbove.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Pro & above
                          </p>
                          <ul className="mt-1 space-y-1.5 text-xs text-muted-foreground">
                            {service.whatsIncluded.proAndAbove.map(
                              (item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {service.whatsIncluded?.premiumOnly &&
                      service.whatsIncluded.premiumOnly.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Premium only
                          </p>
                          <ul className="mt-1 space-y-1.5 text-xs text-muted-foreground">
                            {service.whatsIncluded.premiumOnly.map(
                              (item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {service.whatsNotIncluded &&
                      service.whatsNotIncluded.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Not included
                          </p>
                          <ul className="mt-1 space-y-1.5 text-xs text-xs text-zinc-400">
                            {service.whatsNotIncluded.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {service.addOns && service.addOns.length > 0 && (
                <div className="rounded-2xl border border-border bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Add-ons
                  </h3>
                  <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                    {service.addOns.map((addon, idx) => (
                      <li
                        key={idx}
                        className="flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {addon.name}
                          </p>
                          {addon.description && (
                            <p className="text-xs text-muted-foreground">
                              {addon.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs font-semibold text-yellow-400 whitespace-nowrap">
                          {(addon.currency || service.currency || "INR") +
                            " " +
                            addon.price.toLocaleString("en-IN")}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.faqs && service.faqs.length > 0 && (
                <div className="rounded-2xl border border-border bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    FAQs
                  </h3>
                  <div className="mt-2 space-y-3">
                    {service.faqs.map((faq, idx) => (
                      <div key={idx}>
                        <p className="text-xs font-semibold text-foreground">
                          {faq.question}
                        </p>
                          <p className="text-xs text-muted-foreground">
                            {faq.answer}
                          </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {service.process && service.process.length > 0 && (
                <div className="rounded-2xl border border-border bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    How the process works
                  </h3>
                  <ol className="mt-2 space-y-2 text-xs text-muted-foreground">
                    {service.process.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/15 text-[10px] font-semibold text-yellow-400">
                          {step.step ?? idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {service.guarantees && service.guarantees.length > 0 && (
                <div className="rounded-2xl border border-border bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Guarantees
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    {service.guarantees.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}