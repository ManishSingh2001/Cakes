import { z } from "zod";

export const navLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Link is required"),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export const headerSchema = z.object({
  logo: z.object({
    imageUrl: z.string().default(""),
    altText: z.string().default("Sweet Delights Bakery"),
    linkTo: z.string().default("/"),
  }),
  navigation: z.array(navLinkSchema),
  ctaButton: z.object({
    text: z.string().default("Order Now"),
    href: z.string().default("/menu"),
    isVisible: z.boolean().default(true),
  }),
  isSticky: z.boolean().default(true),
});

export type HeaderInput = z.infer<typeof headerSchema>;
