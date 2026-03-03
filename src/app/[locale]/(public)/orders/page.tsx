import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/layout/public-header";
import { MyOrdersContent } from "@/components/quote/my-orders-content";

type Props = { params: Promise<{ locale: string }> };

export default async function MyOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showBack session={session} />
      <MyOrdersContent locale={locale} />
    </div>
  );
}
