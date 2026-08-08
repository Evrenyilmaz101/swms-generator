import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://swmssorted.com.au").trim();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/documents/",
        "/sign/",
        "/download/",
        "/redeem",
        "/job",
        "/review",
        "/preview",
        "/checkout",
        "/details",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
