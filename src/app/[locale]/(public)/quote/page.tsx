import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { QuoteCheckoutForm } from "@/components/quote/quote-checkout-form";
import { GridBackground } from "@/components/home/grid-background";
import { getServicesCollection, toJson } from "@/lib/db";
import type { Service } from "@/types";

type Props = { params: Promise<{ locale: string }> };

export default async function QuotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/quote`);
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
          <QuoteCheckoutForm locale={locale} services={list} />
        </div>
      </main>
    </div>
  );
}
