"use client";

import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/layout/locale-link";
import { usePrice } from "@/hooks/use-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/types";

type ServiceCardProps = {
  service: Service;
  locale: string;
};

export function ServiceCard({ service, locale }: ServiceCardProps) {
  const t = useTranslations("Services");
  const formatPrice = usePrice(service.pricing.basic);
  const minPrice = Math.min(
    service.pricing.basic,
    service.pricing.pro,
    service.pricing.premium
  );
  const startingPrice = usePrice(minPrice);

  return (
    <Card className="flex h-full flex-col border-2 overflow-hidden">
      {service.image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{service.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{service.description}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <ul className="space-y-1.5 text-sm text-foreground">
          {service.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              {f}
            </li>
          ))}
        </ul>
        <p className="text-lg font-semibold text-primary">
          {t("startingFrom")} {startingPrice}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <LocaleLink href="/#contact" locale={locale}>{t("getQuote")}</LocaleLink>
        </Button>
        <Button size="sm" asChild>
          <LocaleLink href="/signup" locale={locale}>{t("applyCoupon")}</LocaleLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
