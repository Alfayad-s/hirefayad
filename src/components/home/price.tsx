"use client";

import { usePrice } from "@/hooks/use-price";

export function Price({ amountInr }: { amountInr: number }) {
  return <>{usePrice(amountInr)}</>;
}
