import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { LocaleLink } from "@/components/layout/locale-link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroAuthButtons } from "@/components/home/hero-auth-buttons";
import { PublicHeader } from "@/components/layout/public-header";
import { AboutSection } from "@/components/home/about-section";
import { WelcomeModal } from "@/components/home/welcome-modal";
import { GridBackground } from "@/components/home/grid-background";
import { ScrollToSection } from "@/components/home/scroll-to-section";
import { ServiceSection } from "@/components/home/service-section";
import { getServicesCollection, toJson } from "@/lib/db";
import { getServerT } from "@/lib/server-translations";
import type { Service } from "@/types";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const userName = session?.user?.name;
  const t = await getServerT(locale, "Hero");
  const col = await getServicesCollection();
  const services = await col.find({}).sort({ createdAt: 1 }).toArray();
  const list = services.map((s) => toJson(s)) as (Service & { _id: string })[];

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <PublicHeader session={session} />
      <WelcomeModal showForGuests={!session} />

      <main className="relative flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pt-16 sm:pt-[5.5rem]">
        <GridBackground />

        {/* ── HERO ── (100vh so content has space from header) */}
        <section
          id="hero"
          className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 py-16 md:py-20"
        >
          {/* Floating decorative squares */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-8 top-1/4 h-32 w-32 border border-yellow-500/20"
              style={{ animation: "float 8s ease-in-out infinite", ["--float-rotate" as string]: "12deg" }}
            />
            <div
              className="absolute right-16 bottom-1/3 h-16 w-16 border border-yellow-500/30"
              style={{ animation: "float 6s ease-in-out infinite 1s", ["--float-rotate" as string]: "-6deg" }}
            />
            <div
              className="absolute right-1/4 top-1/5 h-8 w-8 bg-yellow-500/10"
              style={{ animation: "float 7s ease-in-out infinite 0.5s", ["--float-rotate" as string]: "45deg" }}
            />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 px-5 py-2 text-sm font-medium text-yellow-400 backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              {userName ? t("welcomeBack") : t("badge")}
            </div>

            {/* Headline */}
            <h1
              className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", lineHeight: 1.05 }}
            >
              {userName ? (
                <>
                  {t("welcomeBack")},{" "}
                  <span
                    className="relative inline-block text-yellow-400"
                    style={{
                      textShadow: "0 0 40px rgba(245,197,24,0.4)",
                    }}
                  >
                    &quot;{userName}&quot;
                  </span>
                </>
              ) : (
                <>
                  {t("title")}{" "}
                  <span
                    className="relative inline-block text-yellow-400"
                    style={{
                      textShadow: "0 0 40px rgba(245,197,24,0.4)",
                    }}
                  >
                    {t("titleHighlight")}
                  </span>{" "}
                  <span className="text-muted-foreground">{t("titleSuffix")}</span>
                </>
              )}
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {userName ? t("welcomeQuote") : t("description")}
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {userName ? (
                <Button
                  size="lg"
                  asChild
                  className="group relative overflow-hidden rounded-full bg-yellow-400 px-8 text-black font-bold hover:bg-yellow-300 transition-all duration-300 shadow-[0_0_30px_rgba(245,197,24,0.3)] hover:shadow-[0_0_50px_rgba(245,197,24,0.5)]"
                >
                  <LocaleLink href="/#services" locale={locale}>
                    {t("seeServices")}
                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </LocaleLink>
                </Button>
              ) : (
                <HeroAuthButtons
                  getStartedLabel={t("getStarted")}
                  haveAccountLabel={t("haveAccount")}
                />
              )}
            </div>
          </div>

          {list.length > 0 && (
            <ScrollToSection href="#services" label={t("seeServices")} />
          )}

          {/* Hero character image - bottom right with spacing and soft bottom shadow */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-10 flex items-end justify-end pr-8 pb-6 md:pr-16 md:pb-10">
            <div className="relative">
              <Image
                src="/image.png"
                alt=""
                width={420}
                height={420}
                className="h-auto max-h-[60dvh] w-[min(360px,48vw)] max-w-full object-contain object-bottom"
                priority
              />
              {/* White/background shadow at bottom to hide image cut-off */}
              <div
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
                aria-hidden
              />
            </div>
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ── SERVICE SECTIONS ── */}
        {list.map((service, index) => (
          <ServiceSection
            key={service._id}
            service={service}
            locale={locale}
            id={index === 0 ? "services" : `service-${service._id}`}
            index={index}
            session={session}
          />
        ))}

        {/* ── ABOUT US ── */}
        <AboutSection />
      </main>
    </div>
  );
}