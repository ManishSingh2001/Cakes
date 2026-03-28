import { z } from "zod";

export const priceOptionSchema = z.object({
  weight: z.coerce.number().positive("Weight must be positive"),
  costPrice: z.coerce.number().min(0, "Cost price must be non-negative"),
  sellPrice: z.coerce.number().positive("Sell price must be positive"),
});

export const cakeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  caketype: z.enum(["cake", "pastries"]),
  type: z.enum(["eggless", "egg"]),
  category: z.string().min(1, "Category is required"),
  slug: z.string().min(1, "Slug is required"),
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().default("") }))
    .default([]),
  prices: z.array(priceOptionSchema).min(1, "At least one price option is required"),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  order: z.coerce.number().default(0),
});

export const reviewSchema = z.object({
  cakeId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().default(""),
});

export type CakeInput = z.infer<typeof cakeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
