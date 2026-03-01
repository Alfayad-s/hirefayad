import { AdminServiceForm } from "@/components/admin/admin-service-form";

type Props = { params: Promise<{ locale: string }> };

export default async function NewServicePage({ params }: Props) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Add service</h1>
      <p className="mt-1 text-muted-foreground">Create a new service offering.</p>
      <AdminServiceForm locale={locale} />
    </div>
  );
}
