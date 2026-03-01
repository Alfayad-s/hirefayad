import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  features: z.array(z.string().min(1)).min(1).max(20),
  pricing: z.object({
    basic: z.number().int().min(0),
    pro: z.number().int().min(0),
    premium: z.number().int().min(0),
  }),
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
