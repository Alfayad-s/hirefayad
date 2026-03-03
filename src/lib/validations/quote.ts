import { z } from "zod";

const serviceTierSchema = z.enum(["basic", "pro", "premium"]);

export const quoteRequestItemSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  tier: serviceTierSchema,
  quantity: z.number().int().min(1).default(1),
});

export const quoteRequestSchema = z.object({
  items: z.array(quoteRequestItemSchema).min(1, "Select at least one service"),
  couponCode: z.string().trim().optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type QuoteRequestItemInput = z.infer<typeof quoteRequestItemSchema>;
