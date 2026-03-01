import { notFound } from "next/navigation";
import { getServicesCollection, toJson } from "@/lib/db";
import { ObjectId } from "mongodb";
import { AdminServiceForm } from "@/components/admin/admin-service-form";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditServicePage({ params }: Props) {
  const { locale, id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const col = await getServicesCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();
  const service = toJson(doc);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Edit service</h1>
      <p className="mt-1 text-muted-foreground">{service.title}</p>
      <AdminServiceForm locale={locale} service={service} />
    </div>
  );
}
