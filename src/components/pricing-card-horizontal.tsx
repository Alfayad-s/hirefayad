"use client";

import { useRef, useState } from "react";
import { Check, Zap, Star, Crown } from "lucide-react";

export const TIER_META = [
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

export type TierMeta = (typeof TIER_META)[number];

/** Expanded horizontal pricing card with icon, label, price, delivery, and feature list (with show more). */
export function PricingCardHorizontal({
  tier,
  label: labelProp,
  price,
  features,
  highlight,
  selected,
  includeLabel,
  delivery,
  onSelect,
}: {
  tier: TierMeta;
  /** Override tier label (e.g. for translations) */
  label?: string;
  price: string;
  features: string[];
  highlight?: boolean;
  selected?: boolean;
  includeLabel?: string;
  delivery?: string;
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
  const label = labelProp ?? tier.label;

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
          boxShadow: highlight || selected
            ? "0 8px 32px rgba(245,197,24,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        className={`relative rounded-2xl border backdrop-blur-sm ${tier.border} ${tier.bg} ${
          selected ? "ring-2 ring-amber-400/80 dark:ring-yellow-500/80 ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {highlight && (
          <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 dark:bg-yellow-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
            Popular
          </span>
        )}

        <div className="flex items-center gap-4 px-5 pt-4 pb-3">
          <div className={`flex items-center gap-2 w-24 shrink-0 ${tier.color}`}>
            <Icon className="size-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              {label}
            </span>
          </div>

          <div
            className={`self-stretch w-px ${
              highlight ? "bg-amber-500/30 dark:bg-yellow-500/25" : "bg-zinc-700/50"
            }`}
          />

          <span
            className={`text-2xl font-black tabular-nums ${
              highlight ? "text-amber-600 dark:text-yellow-400" : "text-foreground"
            }`}
          >
            {price}
          </span>

          <div className="flex-1" />

          {selected && (
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-400 dark:bg-yellow-400 text-black"
              aria-hidden
            >
              <Check className="size-3.5" />
            </span>
          )}

          <span className="text-[11px] text-muted-foreground font-medium text-right min-w-0">
            One-time{delivery ? ` · ${delivery}` : ""}
          </span>
        </div>

        <div
          className={`mx-5 h-px ${
            highlight ? "bg-amber-500/25 dark:bg-yellow-500/20" : "bg-zinc-700/40"
          }`}
        />

        {includeLabel && (
          <div className="px-5 pt-3 text-[11px] font-medium text-muted-foreground">
            {includeLabel}
          </div>
        )}

        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 px-5 pt-2 pb-2">
          {visibleFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground/90">
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                  highlight
                    ? "bg-amber-500/20 text-amber-600 dark:bg-yellow-500/15 dark:text-yellow-400"
                    : "bg-zinc-700/60 text-zinc-400 dark:bg-zinc-600 dark:text-zinc-300"
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
