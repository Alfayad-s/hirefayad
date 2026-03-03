import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders &amp; quotations</h1>
        <p className="mt-1 text-muted-foreground">
          View quote requests, edit quotations, generate PDFs, and send to customers.
        </p>
      </div>
      <AdminOrdersTable locale={locale} />
    </div>
  );
}
