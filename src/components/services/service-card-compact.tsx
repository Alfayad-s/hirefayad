"use client";

import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/layout/locale-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/types";

const DESCRIPTION_MAX = 100;

type ServiceCardCompactProps = {
  service: Service;
  locale: string;
};

function shortDescription(service: Service): string {
  const text = service.shortTagline ?? service.description ?? "";
  if (text.length <= DESCRIPTION_MAX) return text;
  return text.slice(0, DESCRIPTION_MAX).trim() + "…";
}

export function ServiceCardCompact({ service, locale }: ServiceCardCompactProps) {
  const t = useTranslations("Services");

  return (
    <Card className="flex h-full flex-col border-2 overflow-hidden transition-shadow hover:shadow-lg">
      {service.image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{service.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{shortDescription(service)}</p>
      </CardHeader>
      <CardFooter className="mt-auto flex gap-2">
        <Button variant="outline" size="sm" className="gap-1" asChild>
          <LocaleLink href="/#contact" locale={locale}>
            {t("getQuote")}
            <ArrowRight className="size-3.5" />
          </LocaleLink>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <LocaleLink href={`/${locale}/services/${service._id}`} locale={locale}>
            View details
          </LocaleLink>
        </Button>
      </CardFooter>
    </Card>
  );
}
