import { z } from "zod";

export const addonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  category: z.enum(["candles", "toppers", "decorations", "packaging", "extras"]),
  image: z.string().default(""),
  price: z.number().positive("Price must be positive"),
  stock: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  order: z.number().default(0),
});

export type AddonInput = z.infer<typeof addonSchema>;
