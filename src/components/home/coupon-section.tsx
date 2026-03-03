"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Session } from "next-auth";

type Props = { session?: Session | null };

export function CouponSection({ session = null }: Props) {
  const t = useTranslations("Coupon");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    discount?: number;
  } | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult({
          type: "success",
          message: data.message ?? t("applied"),
          discount: data.discountPercentage,
        });
      } else {
        setResult({
          type: "error",
          message: data.error ?? t("invalid"),
        });
      }
    } catch {
      setResult({ type: "error", message: t("invalid") });
    } finally {
      setLoading(false);
    }
  }

  if (!session?.user) {
    return (
      <section id="coupon" className="min-h-full flex flex-col justify-center mx-auto max-w-6xl px-4 py-16">
        <Card className="mx-auto max-w-md border-2">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">{t("signInToApply")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="coupon" className="min-h-full flex flex-col justify-center mx-auto max-w-6xl px-4 py-16">
      <Card className="mx-auto max-w-md border-2">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleApply} className="flex gap-2">
            <Input
              placeholder={t("placeholder")}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "..." : t("apply")}
            </Button>
          </form>
          {result && (
            <p
              className={`mt-3 text-sm ${result.type === "success" ? "text-primary" : "text-destructive"}`}
            >
              {result.discount != null
                ? `${result.message} — ${result.discount}% off`
                : result.message}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
