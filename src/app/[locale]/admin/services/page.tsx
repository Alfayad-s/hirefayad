import Link from "next/link";
import { getServicesCollection, toJson } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AdminServicesTable } from "@/components/admin/admin-services-table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminServicesPage({ params }: Props) {
  const { locale } = await params;
  const col = await getServicesCollection();
  const services = await col.find({}).sort({ createdAt: 1 }).toArray();
  const list = services.map((s) => toJson(s));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="mt-1 text-muted-foreground">
            Manage portfolio, e‑commerce, and other service offerings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/admin/services/bulk`}>Bulk import</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/${locale}/admin/services/new`}>Add service</Link>
          </Button>
        </div>
      </div>
      <AdminServicesTable locale={locale} services={list} />
    </div>
  );
}
