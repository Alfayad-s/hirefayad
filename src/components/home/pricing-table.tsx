"use client";

import { useTranslations } from "next-intl";
import { Price } from "./price";

type ServiceRow = {
  _id: string;
  title: string;
  pricing: { basic: number; pro: number; premium: number };
};

export function PricingTable({ services }: { services: ServiceRow[] }) {
  const t = useTranslations("Pricing");
  const featuredIndex = 1;

  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 font-semibold text-foreground" />
            <th className="pb-3 font-semibold text-foreground">{t("basic")}</th>
            <th className="pb-3 font-semibold text-foreground">{t("pro")}</th>
            <th className="pb-3 font-semibold text-foreground">{t("premium")}</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, rowIndex) => (
            <tr key={service._id} className="border-b border-border">
              <td className="py-3 font-medium text-foreground">{service.title}</td>
              <td className="py-3">
                <span
                  className={
                    rowIndex === featuredIndex
                      ? "rounded-lg bg-primary/10 px-2 py-1 font-medium text-primary"
                      : ""
                  }
                >
                  <Price amountInr={service.pricing.basic} />
                </span>
              </td>
              <td className="py-3">
                <span
                  className={
                    rowIndex === featuredIndex
                      ? "rounded-lg bg-primary/10 px-2 py-1 font-medium text-primary"
                      : ""
                  }
                >
                  <Price amountInr={service.pricing.pro} />
                </span>
              </td>
              <td className="py-3">
                <span
                  className={
                    rowIndex === featuredIndex
                      ? "rounded-lg bg-primary/10 px-2 py-1 font-medium text-primary"
                      : ""
                  }
                >
                  <Price amountInr={service.pricing.premium} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
