import { z } from "zod";

export const aboutSchema = z.object({
  sectionTitle: z.string().default("Our Story"),
  heading: z.string().default("Baking Happiness Since 2010"),
  description: z.string().default(""),
  images: z.array(z.object({ url: z.string(), alt: z.string().default(""), order: z.number().default(0) })).default([]),
  stats: z.array(z.object({ label: z.string(), value: z.string(), icon: z.string().default("") })).default([]),
  teamMembers: z.array(z.object({ name: z.string(), role: z.string().default(""), image: z.string().default(""), bio: z.string().default("") })).default([]),
  isVisible: z.boolean().default(true),
});

export const updateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  coverImage: z.string().default(""),
  category: z.string().default("News"),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

export const visitSchema = z.object({
  sectionTitle: z.string().default("Visit Us"),
  heading: z.string().default("Come Experience the Magic"),
  description: z.string().default(""),
  address: z.object({
    street: z.string().default(""),
    city: z.string().default(""),
    state: z.string().default(""),
    zipCode: z.string().default(""),
    country: z.string().default("India"),
  }),
  phone: z.string().default(""),
  email: z.string().email().or(z.literal("")),
  businessHours: z.array(z.object({
    day: z.string(),
    openTime: z.string().default("09:00"),
    closeTime: z.string().default("18:00"),
    isClosed: z.boolean().default(false),
  })).default([]),
  mapEmbedUrl: z.string().default(""),
  images: z.array(z.object({ url: z.string(), alt: z.string().default("") })).default([]),
  isVisible: z.boolean().default(true),
});

export const footerSchema = z.object({
  logo: z.object({ imageUrl: z.string().default(""), altText: z.string().default("Sweet Delights Bakery") }),
  description: z.string().default(""),
  sections: z.array(z.object({
    title: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.string(), isExternal: z.boolean().default(false) })),
    order: z.number().default(0),
  })).default([]),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string(), icon: z.string().default("") })).default([]),
  copyrightText: z.string().default(""),
  newsletterEnabled: z.boolean().default(false),
});

export const customPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().default(""),
  metaTitle: z.string().default(""),
  metaDescription: z.string().default(""),
  coverImage: z.string().default(""),
  isPublished: z.boolean().default(false),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().default("Sweet Delights Bakery"),
  tagline: z.string().default(""),
  favicon: z.string().default(""),
  seo: z.object({
    defaultTitle: z.string().default(""),
    defaultDescription: z.string().default(""),
    ogImage: z.string().default(""),
  }),
  theme: z.object({
    primaryColor: z.string().default("#D4A574"),
    secondaryColor: z.string().default("#8B4513"),
    accentColor: z.string().default("#F5E6D3"),
    fontHeading: z.string().default("Playfair Display"),
    fontBody: z.string().default("Lato"),
  }),
  maintenance: z.object({
    isEnabled: z.boolean().default(false),
    message: z.string().default("We'll be back soon!"),
  }),
  paymentGateways: z.object({
    razorpay: z.object({
      enabled: z.boolean().default(true),
      displayName: z.string().default("Razorpay"),
      keyId: z.string().default(""),
      keySecret: z.string().default(""),
    }),
    stripe: z.object({
      enabled: z.boolean().default(false),
      displayName: z.string().default("Stripe"),
      publishableKey: z.string().default(""),
      secretKey: z.string().default(""),
    }),
    cod: z.object({
      enabled: z.boolean().default(false),
      displayName: z.string().default("Cash on Delivery"),
      instructions: z.string().default("Pay when your order is delivered."),
    }),
    bankTransfer: z.object({
      enabled: z.boolean().default(false),
      displayName: z.string().default("Bank Transfer"),
      instructions: z.string().default("Transfer the amount to our bank account."),
      accountDetails: z.string().default(""),
    }),
  }).default({}),
});

export type AboutInput = z.infer<typeof aboutSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type VisitInput = z.infer<typeof visitSchema>;
export type FooterInput = z.infer<typeof footerSchema>;
export type CustomPageInput = z.infer<typeof customPageSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
