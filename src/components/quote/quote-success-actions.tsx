"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleLink } from "@/components/layout/locale-link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const REDIRECT_DELAY_MS = 4000;

type Props = {
  locale: string;
  viewToken: string | null;
};

export function QuoteSuccessActions({ locale, viewToken }: Props) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1000);
  const hasRedirected = useRef(false);

  // Countdown only: decrement every second
  useEffect(() => {
    if (!viewToken) return;
    const t = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [viewToken]);

  // Redirect when countdown reaches 0 (in a separate effect to avoid setState-during-render)
  useEffect(() => {
    if (!viewToken || countdown !== 0 || hasRedirected.current) return;
    hasRedirected.current = true;
    router.replace(`/${locale}/quote/view/${viewToken}`);
  }, [viewToken, locale, countdown, router]);

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {viewToken && (
        <>
          <Button
            asChild
            className="w-full max-w-xs rounded-full bg-yellow-400 font-bold text-black hover:bg-yellow-300"
          >
            <LocaleLink href={`/quote/view/${viewToken}`} locale={locale}>
              <FileText className="size-4 mr-2" />
              View quotation
            </LocaleLink>
          </Button>
          {countdown > 0 && (
            <p className="text-sm text-muted-foreground">
              Redirecting to your quotation in {countdown} second{countdown !== 1 ? "s" : ""}…
            </p>
          )}
        </>
      )}
      <Button asChild variant="outline" className="rounded-full">
        <LocaleLink href="/" locale={locale}>
          Back to home
        </LocaleLink>
      </Button>
    </div>
  );
}
