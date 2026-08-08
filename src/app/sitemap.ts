import type { MetadataRoute } from "next";
import {
  SEO_STATE_PAGES,
  SEO_TRADE_PAGES,
} from "@/lib/constants/seo-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://swmssorted.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refunds`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const seoPages: MetadataRoute.Sitemap = [
    ...SEO_STATE_PAGES,
    ...SEO_TRADE_PAGES,
  ].map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...seoPages];
}
