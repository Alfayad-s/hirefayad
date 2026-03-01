import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LocaleLink } from "@/components/layout/locale-link";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user) redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  if (session.user.role !== "admin") redirect(`/${locale}`);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar locale={locale} />
      <div className="flex-1">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <span className="text-sm text-muted-foreground">Admin Dashboard</span>
          <LocaleLink href="/" locale={locale} className="text-sm text-primary hover:underline">
            ← Back to site
          </LocaleLink>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
