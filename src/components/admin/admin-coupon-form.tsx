"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Coupon } from "@/types";

type CouponForForm = Omit<Coupon, "usedCount" | "createdAt"> & {
  expiryDate: string;
};

type Props = {
  locale: string;
  coupon?: CouponForForm;
};

export function AdminCouponForm({ locale, coupon }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!coupon;

  const toDatetimeLocal = (d: Date | string) => {
    const date = typeof d === "string" ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CouponInput & { expiryDate: string }>({
    resolver: zodResolver(couponSchema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          expiryDate: coupon.expiryDate.slice(0, 16),
          usageLimit: coupon.usageLimit,
          isActive: coupon.isActive,
        }
      : {
          code: "",
          discountPercentage: 10,
          expiryDate: toDatetimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          usageLimit: 100,
          isActive: true,
        },
  });

  const isActive = watch("isActive");

  async function onSubmit(data: CouponInput & { expiryDate: string }) {
    setError(null);
    const payload = {
      ...data,
      expiryDate: new Date(data.expiryDate).toISOString(),
    };
    const url = isEdit ? `/api/admin/coupons/${coupon!._id}` : "/api/admin/coupons";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      return;
    }
    router.push(`/${locale}/admin/coupons`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 max-w-xl space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          {...register("code")}
          placeholder="e.g. SAVE20"
          className="font-mono uppercase"
          readOnly={isEdit}
        />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="discountPercentage">Discount (%)</Label>
        <Input
          id="discountPercentage"
          type="number"
          min={1}
          max={100}
          {...register("discountPercentage", { valueAsNumber: true })}
        />
        {errors.discountPercentage && (
          <p className="text-sm text-destructive">{errors.discountPercentage.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiryDate">Expiry (local)</Label>
        <Input id="expiryDate" type="datetime-local" {...register("expiryDate")} />
        {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="usageLimit">Usage limit</Label>
        <Input id="usageLimit" type="number" min={0} {...register("usageLimit", { valueAsNumber: true })} />
        {errors.usageLimit && <p className="text-sm text-destructive">{errors.usageLimit.message}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          className="size-4 rounded border-border"
          {...register("isActive")}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      {errors.isActive && <p className="text-sm text-destructive">{errors.isActive.message}</p>}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Update coupon" : "Create coupon"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
