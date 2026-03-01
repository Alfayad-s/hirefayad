import { getServicesCollection, toJson } from "@/lib/db";
import { LocaleLink } from "@/components/layout/locale-link";
import { Button } from "@/components/ui/button";
import { getServerT } from "@/lib/server-translations";
import { PricingTable } from "./pricing-table";

export async function PricingSection({ locale }: { locale: string }) {
  const t = await getServerT(locale, "Pricing");
  const col = await getServicesCollection();
  const services = await col.find({}).sort({ createdAt: 1 }).toArray();
  const list = services.map((s) => toJson(s));

  if (list.length === 0) return null;

  return (
    <section id="pricing" className="min-h-full snap-start snap-always flex flex-col justify-center mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
        {t("title")}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
        {t("subtitle")}
      </p>
      <PricingTable services={list} />
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <LocaleLink href="/signup" locale={locale}>{t("getQuote")}</LocaleLink>
        </Button>
        <Button variant="outline" asChild>
          <LocaleLink href="/login" locale={locale}>{t("applyCoupon")}</LocaleLink>
        </Button>
      </div>
    </section>
  );
}
