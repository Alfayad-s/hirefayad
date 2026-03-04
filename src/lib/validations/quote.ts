import { z } from "zod";

const serviceTierSchema = z.enum(["basic", "pro", "premium"]);

const quoteRequestAddOnSchema = z.object({
  name: z.string().min(1).max(200),
  priceInr: z.number().int().min(0),
  quantity: z.number().int().min(1).default(1),
});

export const quoteRequestItemSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  tier: serviceTierSchema,
  quantity: z.number().int().min(1).default(1),
  addOns: z.array(quoteRequestAddOnSchema).optional(),
});

export const quoteRequestSchema = z.object({
  items: z.array(quoteRequestItemSchema).min(1, "Select at least one service"),
  couponCode: z.string().trim().optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type QuoteRequestItemInput = z.infer<typeof quoteRequestItemSchema>;
export type QuoteRequestAddOnInput = z.infer<typeof quoteRequestAddOnSchema>;
