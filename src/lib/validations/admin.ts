import { z } from "zod";

const serviceTierSchema = z.enum(["basic", "pro", "premium"]);

export const serviceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  features: z.array(z.string().min(1)).min(1).max(20),
  pricing: z.object({
    basic: z.number().int().min(0),
    pro: z.number().int().min(0),
    premium: z.number().int().min(0),
  }),
  shortTagline: z.string().min(1).max(260).optional(),
  currency: z
    .string()
    .min(1)
    .max(10)
    .optional()
    .transform((v) => v || "INR"),
  // Optional per-tier delivery estimates; when present, all three tiers should be provided
  deliveryTime: z
    .object({
      basic: z.string().max(100),
      pro: z.string().max(100),
      premium: z.string().max(100),
    })
    .optional(),
  technologies: z
    .array(z.string().min(1).max(100))
    .max(50)
    .optional(),
  image: z
    .string()
    .url()
    .or(z.literal(""))
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  // Optional, richer mapping of which features belong to which plans
  tieredFeatures: z
    .array(
      z.object({
        text: z.string().min(1).max(200),
        tiers: z.array(serviceTierSchema).min(1).max(3),
      })
    )
    .max(50)
    .optional(),
});

export const couponSchema = z.object({
  code: z.string().min(1).max(50).transform((s) => s.trim().toUpperCase()),
  discountPercentage: z.number().int().min(1).max(100),
  expiryDate: z.union([z.string(), z.coerce.date()]),
  usageLimit: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
