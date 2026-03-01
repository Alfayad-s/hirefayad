"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Use in Server Components: pass locale so we don't need next-intl config.
 * Builds href as /{locale}{path} (e.g. /en/login).
 */
export function LocaleLink({
  href,
  locale,
  ...props
}: ComponentProps<typeof NextLink> & { locale: string }) {
  const path = typeof href === "string" ? href : href.pathname ?? "";
  const localized = path.startsWith("/") ? `/${locale}${path}` : `/${locale}/${path}`;
  return <NextLink href={localized} {...props} />;
}
