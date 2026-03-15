import { z } from "zod";

export const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().default(""),
  backgroundImage: z.string().min(1, "Background image is required"),
  ctaText: z.string().default("Explore Our Cakes"),
  ctaLink: z.string().default("/menu"),
  overlayOpacity: z.number().min(0).max(1).default(0.4),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const heroSchema = z.object({
  slides: z.array(heroSlideSchema).min(1, "At least one slide is required"),
  autoplaySpeed: z.number().min(1000).default(5000),
});

export type HeroInput = z.infer<typeof heroSchema>;
