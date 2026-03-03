import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/layout/public-header";
import { ViewQuotationContent } from "@/components/quote/view-quotation-content";

type Props = { params: Promise<{ locale: string; token: string }> };

export default async function ViewQuotationPage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showBack session={session} />
      <ViewQuotationContent token={token} locale={locale} />
    </div>
  );
}
