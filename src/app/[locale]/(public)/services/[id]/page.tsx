import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/layout/public-header";
import { GridBackground } from "@/components/home/grid-background";
import { ServiceSection } from "@/components/home/service-section";
import { getServicesCollection, toJson } from "@/lib/db";
import type { Service } from "@/types";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!id || !ObjectId.isValid(id)) {
    notFound();
  }

  const session = await auth();
  const col = await getServicesCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();

  const service = toJson(doc) as Service & { _id: string };

  return (
    <div className="relative min-h-screen bg-background">
      <PublicHeader session={session} showBack />
      <main className="relative mx-auto max-w-6xl px-4 pt-24 pb-16">
        <GridBackground />
        <ServiceSection
          service={service}
          locale={locale}
          id="service-detail"
          index={0}
          session={session}
          variant="detail"
        />
      </main>
    </div>
  );
}

