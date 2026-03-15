export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { CustomPage } from "@/lib/models/CustomPage";
import { Update } from "@/lib/models/Update";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const [cakes, pages, updates] = await Promise.all([
    Cake.find({ isAvailable: true }).select("slug updatedAt").lean(),
    CustomPage.find({ isPublished: true }).select("slug updatedAt").lean(),
    Update.find({ isPublished: true }).select("slug updatedAt").lean(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/menu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const cakeRoutes: MetadataRoute.Sitemap = cakes.map((cake: any) => ({
    url: `${BASE_URL}/cake/${cake.slug}`,
    lastModified: cake.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page: any) => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...cakeRoutes, ...pageRoutes];
}
