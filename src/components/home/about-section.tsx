"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const ABOUT_LINK = "https://alfayad.vercel.app";

export function AboutSection() {
  const t = useTranslations("About");

  return (
    <section
      id="about"
      className="relative min-h-full snap-start snap-always flex flex-col justify-center overflow-hidden px-4 py-16 md:py-24"
    >
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          {/* Left: image with theme blur/fade on left edge to hide cut */}
          <div className="relative flex justify-center md:justify-start">
            <Image
              src="/image2.png"
              alt=""
              width={320}
              height={440}
              className="h-auto max-h-[55vh] w-[min(280px,40vw)] max-w-full object-contain object-left"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent md:w-28"
              aria-hidden
            />
          </div>

          {/* Right: content */}
          <div className="flex flex-col justify-center">
            <h2 className="text-6xl font-black tracking-tight text-yellow-500 dark:text-yellow-400 md:text-7xl lg:text-8xl xl:text-9xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("description")}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 rounded-full bg-yellow-400 px-8 font-bold text-black hover:bg-yellow-300 dark:bg-yellow-400 dark:hover:bg-yellow-300"
            >
              <a
                href={ABOUT_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("moreAboutMe")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
