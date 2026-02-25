import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://menur.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu/*"],
        disallow: ["/dashboard/*", "/admin/*", "/auth/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
