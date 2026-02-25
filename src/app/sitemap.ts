import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://menur.app";

  const restaurants = await prisma.restaurant.findMany({
    where: {
      menus: { some: { status: "PUBLISHED", isActive: true } },
    },
    select: { slug: true, updatedAt: true },
  });

  const menuPages: MetadataRoute.Sitemap = restaurants.map((r) => ({
    url: `${baseUrl}/menu/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...menuPages,
  ];
}
