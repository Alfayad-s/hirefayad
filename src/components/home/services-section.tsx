import { getServicesCollection, toJson } from "@/lib/db";
import { ServiceCard } from "@/components/services/service-card";
import { getServerT } from "@/lib/server-translations";

export async function ServicesSection({ locale }: { locale: string }) {
  const t = await getServerT(locale, "Services");
  const col = await getServicesCollection();
  const services = await col.find({}).sort({ createdAt: 1 }).toArray();
  const list = services.map((s) => toJson(s));

  if (list.length === 0) return null;

  return (
    <section id="services" className="min-h-full snap-start snap-always flex flex-col justify-center mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
        {t("title")}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
        {t("subtitle")}
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((service) => (
          <ServiceCard key={service._id} service={service as import("@/types").Service} locale={locale} />
        ))}
      </div>
    </section>
  );
}
