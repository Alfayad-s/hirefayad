/**
 * Currency: base prices in INR; convert and format for display.
 * Uses static rates for MVP (no external API). Extend with exchange rate API later.
 */

export const SUPPORTED_CURRENCIES = ["AED", "INR", "OMR", "QAR", "USD", "KWD"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

// Static rates vs INR (1 INR = x in target currency) – update or replace with API
// AED = UAE Dirham, OMR = Omani Rial
const RATES_VS_INR: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  AED: 0.044,
  OMR: 0.0046,
  QAR: 0.044,
  KWD: 0.0037,
};

export function convertFromINR(amountInr: number, currency: Currency): number {
  if (currency === "INR") return amountInr;
  return amountInr * RATES_VS_INR[currency];
}

export function formatPrice(
  amountInr: number,
  currency: Currency,
  locale: string = "en-IN"
): string {
  const amount = convertFromINR(amountInr, currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCurrencyFromLocale(locale: string): Currency {
  if (locale.startsWith("hi")) return "INR";
  if (locale.startsWith("en")) return "USD"; // or INR for en-IN
  return "INR";
}
