import { AdminServiceForm } from "@/components/admin/admin-service-form";

type Props = { params: Promise<{ locale: string }> };

export default async function NewServicePage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add service</h1>
        <p className="mt-1 text-muted-foreground">Create a new service offering.</p>
      </div>
      <AdminServiceForm locale={locale} />
    </div>
  );
}
