import { setRequestLocale } from "next-intl/server";
import { PublicHeader } from "@/components/layout/public-header";
import { auth } from "@/auth";
import { CheckCircle2 } from "lucide-react";
import { LocaleLink } from "@/components/layout/locale-link";
import { Button } from "@/components/ui/button";
import { getServerT } from "@/lib/server-translations";

type Props = { params: Promise<{ locale: string }> };

export default async function QuoteSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getServerT(locale, "Quote");

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showBack session={session} />
      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-4 pt-32 pb-16 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <CheckCircle2 className="size-12 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">{t("successTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("successMessage")}</p>
        <Button asChild className="mt-8 rounded-full bg-yellow-400 font-bold text-black hover:bg-yellow-300">
          <LocaleLink href="/" locale={locale}>
            Back to home
          </LocaleLink>
        </Button>
      </main>
    </div>
  );
}
