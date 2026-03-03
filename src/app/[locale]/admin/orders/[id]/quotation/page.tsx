import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminQuotationForm } from "@/components/admin/admin-quotation-form";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function AdminOrderQuotationPage({ params }: Props) {
  const { locale, id } = await params;
  if (!id) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-foreground">Quotation</h1>
      <p className="mt-1 text-muted-foreground">Edit content, payment terms, and live PDF preview. Save then send to customer.</p>
      <AdminQuotationForm locale={locale} orderId={id} />
    </div>
  );
}
