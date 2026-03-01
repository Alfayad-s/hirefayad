"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceInput } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Service } from "@/types";

type Props = {
  locale: string;
  service?: Service & { _id: string };
};

export function AdminServiceForm({ locale, service }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!service;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          title: service.title,
          description: service.description,
          features: service.features.length ? service.features : [""],
          pricing: service.pricing,
        }
      : {
          title: "",
          description: "",
          features: [""],
          pricing: { basic: 0, pro: 0, premium: 0 },
        },
  });

  const features = watch("features");

  async function onSubmit(data: ServiceInput) {
    setError(null);
    const features = data.features.filter((f) => f.trim().length > 0);
    if (features.length === 0) {
      setError("Add at least one feature");
      return;
    }
    const payload = { ...data, features };
    const url = isEdit ? `/api/admin/services/${service!._id}` : "/api/admin/services";
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
    router.push(`/${locale}/admin/services`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="e.g. Portfolio Website" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="min-h-[100px] w-full rounded-xl border-2 border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Features (one per line)</Label>
        {features.map((_, i) => (
          <div key={i} className="flex gap-2">
            <Input {...register(`features.${i}`)} placeholder={`Feature ${i + 1}`} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setValue("features", features.filter((_, j) => j !== i))}
            >
              −
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setValue("features", [...features, ""])}
        >
          + Add feature
        </Button>
        {errors.features && <p className="text-sm text-destructive">{errors.features.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="basic">Basic price (₹)</Label>
          <Input id="basic" type="number" min={0} {...register("pricing.basic", { valueAsNumber: true })} />
          {errors.pricing?.basic && <p className="text-sm text-destructive">{errors.pricing.basic.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pro">Pro price (₹)</Label>
          <Input id="pro" type="number" min={0} {...register("pricing.pro", { valueAsNumber: true })} />
          {errors.pricing?.pro && <p className="text-sm text-destructive">{errors.pricing.pro.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="premium">Premium price (₹)</Label>
          <Input id="premium" type="number" min={0} {...register("pricing.premium", { valueAsNumber: true })} />
          {errors.pricing?.premium && <p className="text-sm text-destructive">{errors.pricing.premium.message}</p>}
        </div>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Update service" : "Create service"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
