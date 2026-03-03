"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validations/quote";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, Plus, Ticket, Trash2, Zap, Star, Crown } from "lucide-react";
import { LocaleLink } from "@/components/layout/locale-link";
import { usePrice } from "@/hooks/use-price";
import type { Service } from "@/types";

type QuoteCheckoutFormProps = {
  locale: string;
  services: (Service & { _id: string })[];
};

const TIERS: Array<"basic" | "pro" | "premium"> = ["basic", "pro", "premium"];

const TIER_META = [
  { id: "basic" as const, icon: Zap, color: "text-zinc-400", border: "border-zinc-700", bg: "bg-zinc-900", featureKeys: ["planBasic1", "planBasic2", "planBasic3"] as const },
  { id: "pro" as const, icon: Star, color: "text-amber-700 dark:text-yellow-400", border: "border-amber-500/50 dark:border-yellow-500/50", bg: "bg-amber-500/10 dark:bg-yellow-500/5", featureKeys: ["planPro1", "planPro2", "planPro3", "planPro4"] as const },
  { id: "premium" as const, icon: Crown, color: "text-zinc-200", border: "border-zinc-600", bg: "bg-zinc-800/80", featureKeys: ["planPremium1", "planPremium2", "planPremium3", "planPremium4", "planPremium5"] as const },
];

type AvailableCoupon = { code: string; discountPercentage: number; expiryDate: string };

function PlanCard({
  tierMeta,
  label,
  priceLabel,
  features,
  isSelected,
  onSelect,
}: {
  tierMeta: (typeof TIER_META)[number];
  label: string;
  priceLabel: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState("perspective(1000px)");

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`
    );
  }

  function handleMouseLeave() {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  }

  const Icon = tierMeta.icon;

  return (
    <button
      type="button"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      className="relative w-full cursor-pointer text-left outline-none"
      style={{ transition: "transform 0.15s ease-out" }}
    >
      {isSelected && (
        <div
          className="absolute -inset-px rounded-2xl opacity-70"
          style={{
            background: "linear-gradient(135deg, rgba(245,197,24,0.5), transparent 60%)",
            filter: "blur(1px)",
          }}
        />
      )}
      <div
        className={`relative flex flex-col gap-3 rounded-2xl border p-5 backdrop-blur-sm transition-all ${tierMeta.border} ${tierMeta.bg} ${
          isSelected ? "ring-2 ring-yellow-400 dark:ring-yellow-500 ring-offset-2 ring-offset-background" : ""
        }`}
        style={{
          transform,
          boxShadow: isSelected
            ? "0 20px 60px rgba(245,197,24,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 20px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${tierMeta.color}`}>
            <Icon className="size-4" />
            <span className="text-sm font-semibold uppercase tracking-widest">{label}</span>
          </div>
          {isSelected && (
            <span className="flex size-6 items-center justify-center rounded-full bg-yellow-400 text-black">
              <Check className="size-3.5" />
            </span>
          )}
        </div>
        <div className="text-xl font-bold text-foreground">{priceLabel}</div>
        <p className="text-xs text-muted-foreground">One-time project</p>
        {features.length > 0 && (
          <ul className="mt-1 space-y-1.5 border-t border-border/50 pt-3">
            {features.map((text, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  );
}

export function QuoteCheckoutForm({ locale, services }: QuoteCheckoutFormProps) {
  const t = useTranslations("Quote");
  const tCoupon = useTranslations("Coupon");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  const [validateError, setValidateError] = useState<string | null>(null);

  const tierLabels: Record<string, string> = {
    basic: t("basic"),
    pro: t("pro"),
    premium: t("premium"),
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      items:
        services.length > 0
          ? [{ serviceId: services[0]._id, tier: "pro", quantity: 1 }]
          : [],
      couponCode: "",
    },
  });

  const items = watch("items") ?? [];
  const selectedTier = items[0]?.tier ?? "pro";

  useEffect(() => {
    fetch("/api/coupons/available")
      .then((res) => res.json())
      .then((data) => setAvailableCoupons(data.coupons ?? []))
      .catch(() => setAvailableCoupons([]));
  }, []);

  const subtotalInr = items.reduce((sum, item) => {
    const svc = services.find((s) => s._id === item.serviceId);
    if (!svc) return sum;
    const price = svc.pricing[item.tier] ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const discountAmountInr = appliedCoupon
    ? Math.round((subtotalInr * appliedCoupon.discountPercentage) / 100)
    : 0;
  const totalInr = subtotalInr - discountAmountInr;

  const selectTier = (tier: "basic" | "pro" | "premium") => {
    setValue(
      "items",
      items.map((it) => ({ ...it, tier })),
      { shouldValidate: true }
    );
  };

  const addItem = () => {
    const next = services[0];
    if (!next) return;
    setValue("items", [...items, { serviceId: next._id, tier: selectedTier, quantity: 1 }], {
      shouldValidate: true,
    });
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setValue(
      "items",
      items.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const applyCouponByCode = async () => {
    const code = watch("couponCode")?.trim().toUpperCase();
    if (!code) return;
    setValidateError(null);
    setCouponLoading(true);
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid && data.code) {
        setAppliedCoupon({ code: data.code, discountPercentage: data.discountPercentage });
        setValue("couponCode", data.code);
      } else {
        setAppliedCoupon(null);
        setValidateError(data.error ?? tCoupon("invalid"));
      }
    } catch {
      setAppliedCoupon(null);
      setValidateError(tCoupon("invalid"));
    } finally {
      setCouponLoading(false);
    }
  };

  const applyCouponFromList = async (coupon: AvailableCoupon) => {
    setValidateError(null);
    setCouponLoading(true);
    setValue("couponCode", coupon.code);
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code }),
      });
      const data = await res.json();
      if (data.valid && data.code) {
        setAppliedCoupon({ code: data.code, discountPercentage: data.discountPercentage });
      } else {
        setAppliedCoupon(null);
        setValidateError(data.error ?? tCoupon("invalid"));
      }
    } catch {
      setAppliedCoupon(null);
      setValidateError(tCoupon("invalid"));
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setValidateError(null);
    setValue("couponCode", "");
  };

  async function onSubmit(data: QuoteRequestInput) {
    setError(null);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: data.items.map((i) => ({
            serviceId: i.serviceId,
            tier: i.tier,
            quantity: i.quantity ?? 1,
          })),
          couponCode: (appliedCoupon?.code ?? data.couponCode?.trim()) || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong");
        return;
      }
      router.push(`/${locale}/quote/success`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    }
  }

  const subtotalFormatted = usePrice(subtotalInr);
  const discountFormatted = usePrice(discountAmountInr);
  const totalFormatted = usePrice(totalInr);

  const minPriceBasic = services.length ? Math.min(...services.map((s) => s.pricing.basic)) : 0;
  const minPricePro = services.length ? Math.min(...services.map((s) => s.pricing.pro)) : 0;
  const minPricePremium = services.length ? Math.min(...services.map((s) => s.pricing.premium)) : 0;
  const basicPriceLabel = usePrice(minPriceBasic);
  const proPriceLabel = usePrice(minPricePro);
  const premiumPriceLabel = usePrice(minPricePremium);

  return (
    <div className="w-full">
      <LocaleLink
        href="/#services"
        locale={locale}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to services
      </LocaleLink>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left: Plan cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("tier")}
            </h2>
            <div className="flex flex-col gap-3">
              <PlanCard
                tierMeta={TIER_META[0]}
                label={tierLabels.basic}
                priceLabel={basicPriceLabel}
                features={TIER_META[0].featureKeys.map((k) => t(k))}
                isSelected={selectedTier === "basic"}
                onSelect={() => selectTier("basic")}
              />
              <PlanCard
                tierMeta={TIER_META[1]}
                label={tierLabels.pro}
                priceLabel={proPriceLabel}
                features={TIER_META[1].featureKeys.map((k) => t(k))}
                isSelected={selectedTier === "pro"}
                onSelect={() => selectTier("pro")}
              />
              <PlanCard
                tierMeta={TIER_META[2]}
                label={tierLabels.premium}
                priceLabel={premiumPriceLabel}
                features={TIER_META[2].featureKeys.map((k) => t(k))}
                isSelected={selectedTier === "premium"}
                onSelect={() => selectTier("premium")}
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={items.length >= services.length}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Add service
              </Button>
            </div>

            {items.map((_, index) => (
              <div
                key={index}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/80 backdrop-blur p-4"
              >
                <div className="min-w-[180px] flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {t("service")}
                  </label>
                  <select
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    {...register(`items.${index}.serviceId`)}
                  >
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[100px]">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {t("quantity")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {errors.items?.message && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}

            {/* Coupon: input + Apply + available list */}
            <div className="space-y-3 rounded-xl border border-border bg-card/80 backdrop-blur p-4">
              <label className="block text-sm font-medium text-foreground">
                {t("couponOptional")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase placeholder:normal-case"
                  {...register("couponCode")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyCouponByCode}
                  disabled={couponLoading}
                  className="shrink-0"
                >
                  {couponLoading ? <Loader2 className="size-4 animate-spin" /> : tCoupon("apply")}
                </Button>
              </div>
              {validateError && (
                <p className="text-sm text-destructive">{validateError}</p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                  <span>
                    {tCoupon("applied")}: <strong>{appliedCoupon.code}</strong> (−{appliedCoupon.discountPercentage}%)
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={removeCoupon}>
                    Remove
                  </Button>
                </div>
              )}

              {availableCoupons.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("availableCoupons")} — {t("clickToApply")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((c) => {
                      const isLive = !appliedCoupon || appliedCoupon.code === c.code;
                      const expiry = new Date(c.expiryDate);
                      const validUntil = expiry.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => applyCouponFromList(c)}
                          disabled={couponLoading}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            appliedCoupon?.code === c.code
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-muted/50 hover:bg-muted hover:border-primary/50"
                          }`}
                        >
                          <Ticket className="size-4" />
                          <span className="font-medium">{c.code}</span>
                          <span className="text-muted-foreground">−{c.discountPercentage}%</span>
                          <span className="text-xs text-muted-foreground" title={t("validUntil")}>
                            {validUntil}
                          </span>
                          {isLive && (
                            <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-600 dark:text-green-400">
                              {t("live")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">{subtotalFormatted}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-primary">
                  <span>{t("discount")} ({appliedCoupon.code})</span>
                  <span>−{discountFormatted}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>{t("total")}</span>
                <span className="text-primary">{totalFormatted}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-yellow-400 font-bold text-black hover:bg-yellow-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("adding")}
                </>
              ) : (
                t("requestQuote")
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
