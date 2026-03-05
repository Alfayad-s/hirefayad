"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/providers/theme-provider";

export function MoreSection() {
  const t = useTranslations("More");
  const { theme } = useTheme();

  return (
    <section
      id="more"
      className="relative min-h-full flex flex-col justify-center overflow-hidden px-4 py-16 md:py-24 border-t border-border/50"
    >
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          {/* Left: content */}
          <div className="flex flex-col justify-center order-2 md:order-1">
            <h2 className="text-6xl font-black tracking-tight text-yellow-500 dark:text-yellow-400 md:text-7xl lg:text-8xl xl:text-9xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("description")}
            </p>
          </div>

          {/* Right: image with bottom shade */}
          <div className="relative flex justify-center md:justify-end order-1 md:order-2">
            <Image
              src={theme === "light" ? "/image3-white.png" : "/image3.png"}
              alt=""
              width={600}
              height={780}
              className="h-auto max-h-[85vh] w-[min(520px,62vw)] max-w-full object-contain object-right"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent md:h-32"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
