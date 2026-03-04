import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { QuoteCheckoutForm } from "@/components/quote/quote-checkout-form";
import { GridBackground } from "@/components/home/grid-background";
import { getServicesCollection, toJson } from "@/lib/db";
import type { Service } from "@/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ serviceId?: string; tier?: string }>;
};

export default async function QuotePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  const { serviceId: selectedServiceId, tier } = (await searchParams) ?? {};
  const selectedTier =
    tier === "basic" || tier === "pro" || tier === "premium"
      ? tier
      : undefined;

  if (!session?.user) {
    const base = new URL(`/${locale}/quote`, "http://dummy");
    if (selectedServiceId) base.searchParams.set("serviceId", selectedServiceId);
    if (selectedTier) base.searchParams.set("tier", selectedTier);
    const callbackUrl = base.pathname + base.search;
    redirect(`/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const col = await getServicesCollection();
  const services = await col.find({}).sort({ createdAt: 1 }).toArray();
  const list = services.map((s) => toJson(s)) as (Service & { _id: string })[];

  return (
    <div className="min-h-screen bg-background relative">
      <PublicHeader showBack session={session} />
      <main className="relative mx-auto max-w-6xl px-4 pt-24 pb-16">
        <GridBackground />
        <div className="relative">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Request a quote</h1>
          <p className="mb-8 text-muted-foreground">
            Select services and tiers. We&apos;ll send you a formal quotation shortly.
          </p>
          <QuoteCheckoutForm
            locale={locale}
            services={list}
            initialServiceId={selectedServiceId}
            initialTier={selectedTier}
          />
        </div>
      </main>
    </div>
  );
}
