"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";

export function PublicFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="relative flex min-h-full w-full flex-col justify-between border-t border-border bg-card/50 px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-400 shadow-[0_0_12px_rgba(245,197,24,0.3)]">
              <Zap className="size-4 text-black fill-black" />
            </div>
            <span className="text-lg font-black tracking-tight">
              Service<span className="text-yellow-500 dark:text-yellow-400">Funnel</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="/#services"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("services")}
            </Link>
            <Link
              href="/#coupon"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("coupon")}
            </Link>
          </nav>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {year} ServiceFunnel. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
