"use client";

import { useMemo, useState } from "react";
import { ServiceSection } from "@/components/home/service-section";
import { ServiceCardCompact } from "@/components/services/service-card-compact";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid, LayoutTemplate, Search } from "lucide-react";
import type { Service } from "@/types";
import type { Session } from "next-auth";

export type ViewType = "detailed" | "card" | "grid";
export type SortOption = "default" | "name" | "price-low" | "price-high";

type Props = {
  services: (Service & { _id: string })[];
  locale: string;
  session?: Session | null;
};

function filterServices(
  services: (Service & { _id: string })[],
  query: string
): (Service & { _id: string })[] {
  if (!query.trim()) return services;
  const q = query.trim().toLowerCase();
  return services.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.shortTagline && s.shortTagline.toLowerCase().includes(q))
  );
}

function sortServices(
  services: (Service & { _id: string })[],
  sort: SortOption
): (Service & { _id: string })[] {
  if (sort === "default") return [...services];
  const copy = [...services];
  if (sort === "name") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }
  if (sort === "price-low" || sort === "price-high") {
    copy.sort((a, b) => {
      const minA = Math.min(a.pricing.basic, a.pricing.pro, a.pricing.premium);
      const minB = Math.min(b.pricing.basic, b.pricing.pro, b.pricing.premium);
      return sort === "price-low" ? minA - minB : minB - minA;
    });
    return copy;
  }
  return copy;
}

export function ServicesListing({ services, locale, session }: Props) {
  const [view, setView] = useState<ViewType>("detailed");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  const filtered = useMemo(
    () => sortServices(filterServices(services, search), sort),
    [services, search, sort]
  );

  return (
    <section id="services" className="relative flex min-h-full flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Toolbar: filters + view options */}
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-background p-4 shadow-sm">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search services"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Sort services"
          >
            <option value="default">Sort: Default</option>
            <option value="name">Sort: Name A–Z</option>
            <option value="price-low">Sort: Price (low to high)</option>
            <option value="price-high">Sort: Price (high to low)</option>
          </select>
          <div className="flex items-center gap-1 rounded-lg border border-input bg-muted/30 p-1" role="group" aria-label="View type">
            <Button
              type="button"
              variant={view === "detailed" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("detailed")}
              title="Detailed view"
              aria-pressed={view === "detailed"}
            >
              <LayoutList className="size-4" />
              <span className="hidden sm:inline">Detailed</span>
            </Button>
            <Button
              type="button"
              variant={view === "card" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("card")}
              title="Card view"
              aria-pressed={view === "card"}
            >
              <LayoutTemplate className="size-4" />
              <span className="hidden sm:inline">Card</span>
            </Button>
            <Button
              type="button"
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("grid")}
              title="Grid view"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
          </div>
        </div>

        {/* Results count when filtering */}
        {search && (
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length === 0
              ? "No services match your search."
              : `${filtered.length} service${filtered.length === 1 ? "" : "s"} found.`}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center text-muted-foreground">
            Try a different search or clear the filter.
          </div>
        ) : view === "detailed" ? (
          <div className="space-y-0">
            {filtered.map((service, index) => (
              <ServiceSection
                key={service._id}
                service={service}
                locale={locale}
                id={index === 0 ? "services" : `service-${service._id}`}
                index={index}
                session={session}
                variant="home"
              />
            ))}
          </div>
        ) : (
          <div
            className={
              view === "card"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }
          >
            {filtered.map((service) => (
              <ServiceCardCompact key={service._id} service={service} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
