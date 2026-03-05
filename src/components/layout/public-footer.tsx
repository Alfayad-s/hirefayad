"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";
import GithubIcon from "@/components/ui/github-icon";
import LinkedinIcon from "@/components/ui/linkedin-icon";
import TwitterIcon from "@/components/ui/twitter-icon";
import { useTheme } from "@/components/providers/theme-provider";

const SOCIAL = {
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  twitter: "https://x.com",
} as const;

export function PublicFooter() {
  const t = useTranslations("Footer");
  const { theme } = useTheme();
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
              Hire<span className="text-yellow-500 dark:text-yellow-400">Fayad</span>
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
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("terms")}
            </Link>
          </nav>
      </div>

      {/* Full-width: call-me image (left) + small label & big "Alfayad" (right) — below nav */}
      <div className="w-full max-w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 mb-8 overflow-hidden px-0">
        <div className="relative shrink-0 w-[320px] h-[427px] sm:w-[400px] sm:h-[533px] md:w-[480px] md:h-[640px]">
          <Image
            src={theme === "light" ? "/call-me-white.png" : "/call-me.png"}
            alt=""
            fill
            className="object-contain object-center -scale-x-100"
            sizes="(max-width: 640px) 320px, (max-width: 768px) 400px, 480px"
          />
        </div>
        <div className="text-center sm:text-left">
          <span className="block text-sm md:text-base text-muted-foreground">
            {t("serviceProvidedBy")}
          </span>
          <span className="block w-full text-[clamp(3.5rem,16vw,8rem)] sm:text-[clamp(4.5rem,20vw,11rem)] md:text-[clamp(5.5rem,22vw,14rem)] lg:text-[clamp(7rem,26vw,18rem)] font-black tracking-tighter text-yellow-500 dark:text-yellow-400 leading-none mt-1">
            {t("alfayad")}
          </span>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-8 flex flex-wrap items-center justify-center gap-6 md:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{t("follow")}</span>
          <a
            href={SOCIAL.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-5"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-5"
            aria-label="LinkedIn"
          >
            <LinkedinIcon />
          </a>
          <a
            href={SOCIAL.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-5"
            aria-label="X (Twitter)"
          >
            <TwitterIcon />
          </a>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          © {year} Hire Fayad. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
