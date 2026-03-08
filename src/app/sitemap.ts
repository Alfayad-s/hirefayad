import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://hirefayad.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales as string[];
  const baseEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  const quoteEntry = {
    url: `${siteUrl}/en/quote`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  };

  return [...baseEntries, quoteEntry];
}
