"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validations/quote";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Plus, Ticket, Trash2 } from "lucide-react";
import { LocaleLink } from "@/components/layout/locale-link";
import { usePrice } from "@/hooks/use-price";
import type { Service } from "@/types";
import { PricingCardHorizontal, TIER_META } from "@/components/pricing-card-horizontal";

type QuoteCheckoutFormProps = {
  locale: string;
  services: (Service & { _id: string })[];
  initialServiceId?: string;
  initialTier?: "basic" | "pro" | "premium";
};

const TIERS: Array<"basic" | "pro" | "premium"> = ["basic", "pro", "premium"];

/** Build feature list for a tier: common features + tier-specific tiered features. */
function getFeaturesForTier(
  service: Service | null,
  tier: "basic" | "pro" | "premium"
): string[] {
  if (!service) return [];
  const baseFeatures = service.features ?? [];
  const tiered = (service as {
    tieredFeatures?: { text: string; tiers: ("basic" | "pro" | "premium")[] }[];
  }).tieredFeatures;
  const tierTexts = tiered
    ? tiered.filter((f) => f.tiers?.includes(tier)).map((f) => f.text)
    : [];
  return Array.from(new Set([...baseFeatures, ...tierTexts]));
}

/** For Pro: only extras vs Basic. For Premium: only extras vs Pro. */
function getExtrasForTier(
  service: Service | null,
  tier: "basic" | "pro" | "premium"
): { features: string[]; includeLabel?: string } {
  if (!service) return { features: [] };
  const basicAll = getFeaturesForTier(service, "basic");
  const proAll = getFeaturesForTier(service, "pro");
  const premiumAll = getFeaturesForTier(service, "premium");
  if (tier === "basic") return { features: basicAll };
  if (tier === "pro") {
    const proExtras = proAll.filter((text) => !basicAll.includes(text));
    return {
      features: proExtras,
      includeLabel: basicAll.length ? "Includes everything in Basic plan" : undefined,
    };
  }
  const premiumExtras = premiumAll.filter((text) => !proAll.includes(text));
  return {
    features: premiumExtras,
    includeLabel: proAll.length ? "Includes everything in Pro plan" : undefined,
  };
}

type AvailableCoupon = { code: string; discountPercentage: number; expiryDate: string };

export function QuoteCheckoutForm({
  locale,
  services,
  initialServiceId,
  initialTier,
}: QuoteCheckoutFormProps) {
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

  const initialService =
    initialServiceId != null
      ? services.find((s) => s._id === initialServiceId)
      : undefined;
  const defaultServiceId =
    services.length > 0 ? (initialService?._id ?? services[0]._id) : undefined;
  const defaultTier: "basic" | "pro" | "premium" = initialTier ?? "pro";

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
        services.length > 0 && defaultServiceId
          ? [{ serviceId: defaultServiceId, tier: defaultTier, quantity: 1 }]
          : [],
      couponCode: "",
      quotationMode: "confirm_via_admin",
    },
  });

  const items = watch("items") ?? [];
  const selectedTier = items[0]?.tier ?? "pro";

  // Ensure the initially requested service (from home page) is selected
  // even after hydration/client navigation.
  useEffect(() => {
    if (!initialServiceId) return;
    const exists = services.some((s) => s._id === initialServiceId);
    if (!exists) return;
    const currentItems = (watch("items") ?? []) as QuoteRequestInput["items"];
    if (!currentItems.length) {
      setValue(
        "items",
        [{ serviceId: initialServiceId, tier: "pro", quantity: 1 }],
        { shouldValidate: true }
      );
      return;
    }
    if (currentItems[0]?.serviceId === initialServiceId) return;
    const [, ...rest] = currentItems;
    setValue(
      "items",
      [
        {
          ...currentItems[0],
          serviceId: initialServiceId,
        },
        ...rest,
      ],
      { shouldValidate: true }
    );
  }, [initialServiceId, services, watch, setValue]);

  // Keep plan cards in sync with the primary selected service
  // instead of showing a global minimum across all services.
  const primaryServiceId = items[0]?.serviceId;
  const primaryService =
    services.find((s) => s._id === primaryServiceId) ?? services[0] ?? null;

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
    const base = price * item.quantity;
    const addOnsTotal =
      (item.addOns ?? []).reduce(
        (acc, addOn) => acc + (addOn.priceInr ?? 0) * (addOn.quantity ?? 1),
        0
      ) ?? 0;
    return sum + base + addOnsTotal;
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
            addOns:
              i.addOns?.map((a) => ({
                name: a.name,
                priceInr: a.priceInr,
                quantity: a.quantity ?? 1,
              })) ?? undefined,
          })),
          couponCode: (appliedCoupon?.code ?? data.couponCode?.trim()) || undefined,
          quotationMode: data.quotationMode ?? "confirm_via_admin",
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
  const basicPriceLabel = usePrice(primaryService?.pricing.basic ?? 0);
  const proPriceLabel = usePrice(primaryService?.pricing.pro ?? 0);
  const premiumPriceLabel = usePrice(primaryService?.pricing.premium ?? 0);

  const formatInr = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

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

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Left: Plan cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t("tier")}
            </h2>
          <div className="flex flex-col gap-3">
            <PricingCardHorizontal
              tier={TIER_META[0]}
              label={tierLabels.basic}
              price={basicPriceLabel}
              features={getFeaturesForTier(primaryService ?? null, "basic")}
              selected={selectedTier === "basic"}
              delivery={primaryService?.deliveryTime?.basic}
              onSelect={() => selectTier("basic")}
            />
            <PricingCardHorizontal
              tier={TIER_META[1]}
              label={tierLabels.pro}
              price={proPriceLabel}
              features={getExtrasForTier(primaryService ?? null, "pro").features}
              highlight={TIER_META[1].highlight}
              selected={selectedTier === "pro"}
              includeLabel={getExtrasForTier(primaryService ?? null, "pro").includeLabel}
              delivery={primaryService?.deliveryTime?.pro}
              onSelect={() => selectTier("pro")}
            />
            <PricingCardHorizontal
              tier={TIER_META[2]}
              label={tierLabels.premium}
              price={premiumPriceLabel}
              features={getExtrasForTier(primaryService ?? null, "premium").features}
              selected={selectedTier === "premium"}
              includeLabel={getExtrasForTier(primaryService ?? null, "premium").includeLabel}
              delivery={primaryService?.deliveryTime?.premium}
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

            {items.map((item, index) => {
              const svc = services.find((s) => s._id === item.serviceId);
              const availableAddOns = svc?.addOns ?? [];
              const selectedAddOns = item.addOns ?? [];

              const toggleAddOn = (addonName: string, priceInr: number) => {
                const current = [...(item.addOns ?? [])];
                const existingIndex = current.findIndex(
                  (a) => a.name === addonName && a.priceInr === priceInr
                );
                let next;
                if (existingIndex >= 0) {
                  next = current.filter((_, i) => i !== existingIndex);
                } else {
                  next = [...current, { name: addonName, priceInr, quantity: 1 }];
                }
                const updatedItems = items.map((it, i) =>
                  i === index ? { ...it, addOns: next } : it
                );
                setValue("items", updatedItems, { shouldValidate: true });
              };

              const updateAddOnQty = (
                addonName: string,
                priceInr: number,
                quantity: number
              ) => {
                const current = [...(item.addOns ?? [])];
                const existingIndex = current.findIndex(
                  (a) => a.name === addonName && a.priceInr === priceInr
                );
                if (existingIndex < 0) return;
                current[existingIndex] = { ...current[existingIndex], quantity };
                const updatedItems = items.map((it, i) =>
                  i === index ? { ...it, addOns: current } : it
                );
                setValue("items", updatedItems, { shouldValidate: true });
              };

              return (
                <div
                  key={index}
                  className="space-y-3 rounded-xl border border-border bg-card/80 backdrop-blur p-4"
                >
                  <div className="flex flex-wrap items-end gap-3">
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
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
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

                  {/* Add-ons for this service */}
                  {availableAddOns.length > 0 && (
                    <div className="mt-2 space-y-2 rounded-lg border border-dashed border-border/70 bg-background/50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Optional add-ons
                      </p>
                      <div className="space-y-1.5">
                        {availableAddOns.map((addon) => {
                          const isSelected = selectedAddOns.some(
                            (a) =>
                              a.name === addon.name && a.priceInr === addon.price
                          );
                          const current =
                            selectedAddOns.find(
                              (a) =>
                                a.name === addon.name &&
                                a.priceInr === addon.price
                            ) ?? undefined;
                          return (
                            <div
                              key={addon.name + addon.price}
                              className="flex items-center gap-2"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  toggleAddOn(addon.name, addon.price)
                                }
                                className={`flex h-6 w-6 items-center justify-center rounded border text-xs ${
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground"
                                }`}
                              >
                                {isSelected ? "✓" : "+"}
                              </button>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-foreground">
                                  {addon.name}
                                </p>
                                {addon.description && (
                                  <p className="text-[11px] text-muted-foreground">
                                    {addon.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                <div className="font-semibold text-foreground">
                                  {formatInr(addon.price)}
                                </div>
                                {isSelected && (
                                  <input
                                    type="number"
                                    min={1}
                                    className="mt-1 w-16 rounded border border-input bg-background px-1.5 py-0.5 text-[11px]"
                                    value={current?.quantity ?? 1}
                                    onChange={(e) =>
                                      updateAddOnQty(
                                        addon.name,
                                        addon.price,
                                        Number(e.target.value || 1)
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {errors.items?.message && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}

            {/* Quotation type: just look or confirm when admin accepts */}
            <div className="space-y-3 rounded-xl border border-border bg-card/80 backdrop-blur p-4">
              <label className="block text-sm font-medium text-foreground">
                {t("quotationTypeQuestion")}
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/20 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                  <input
                    type="radio"
                    value="view_only"
                    {...register("quotationMode")}
                    className="mt-1 size-4"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t("viewOnlyLabel")}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("viewOnlyDescription")}
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/20 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
                  <input
                    type="radio"
                    value="confirm_via_admin"
                    {...register("quotationMode")}
                    className="mt-1 size-4"
                  />
                  <div>
                    <span className="font-medium text-foreground">{t("confirmViaAdminLabel")}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("confirmViaAdminDescription")}
                    </p>
                  </div>
                </label>
              </div>
            </div>

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
