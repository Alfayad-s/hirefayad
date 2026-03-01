"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const WHATSAPP_NUMBER = "919876543210"; // Replace with real number
const WHATSAPP_MESSAGE = "Hi, I'm interested in your development services.";

export function ContactSection() {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="min-h-full snap-start snap-always flex flex-col justify-center mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
        {t("title")}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
        {t("subtitle")}
      </p>
      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-center">
        <Card className="w-full max-w-md border-2">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("message")}</Label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "..." : t("send")}
              </Button>
              {status === "success" && (
                <p className="text-sm text-primary">Thank you. We&apos;ll get back to you soon.</p>
              )}
              {status === "error" && (
                <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
              )}
            </form>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-green-600 bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
          >
            {t("whatsapp")}
          </a>
        </div>
      </div>
    </section>
  );
}
