import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminServiceBulkForm } from "@/components/admin/admin-service-bulk-form";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminServicesBulkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  return <AdminServiceBulkForm locale={locale} />;
}

