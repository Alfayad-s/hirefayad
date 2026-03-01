"use client";

import { useLocale } from "next-intl";
import { formatPrice, type Currency } from "@/lib/currency";
import { useCurrency } from "@/components/providers/currency-provider";

export function usePrice(amountInr: number, currencyOverride?: Currency) {
  const locale = useLocale();
  const { currency: contextCurrency } = useCurrency();
  const targetCurrency = currencyOverride ?? contextCurrency;
  return formatPrice(amountInr, targetCurrency, locale);
}

export { type Currency } from "@/lib/currency";
