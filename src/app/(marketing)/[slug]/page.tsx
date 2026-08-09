import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  SEO_STATE_PAGES,
  SEO_TRADE_PAGES,
  type SeoFaq,
} from "@/lib/constants/seo-pages";
import { SeoStatePageContent } from "@/components/seo/seo-state-page";
import { SeoTradePageContent } from "@/components/seo/seo-trade-page";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://swmssorted.com.au").trim();

// Generate all static paths at build time
export function generateStaticParams() {
  const stateSlugs = SEO_STATE_PAGES.map((p) => ({ slug: p.slug }));
  const tradeSlugs = SEO_TRADE_PAGES.map((p) => ({ slug: p.slug }));
  return [...stateSlugs, ...tradeSlugs];
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const page =
    SEO_STATE_PAGES.find((p) => p.slug === slug) ||
    SEO_TRADE_PAGES.find((p) => p.slug === slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `${SITE_URL}/${page.slug}`,
      type: "website",
    },
  };
}

function jsonLd(obj: object) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
    />
  );
}

function faqSchema(faq: SeoFaq[] | undefined, fallback: { name: string; text: string }[]) {
  const entries = faq?.length
    ? faq.map(({ q, a }) => ({ name: q, text: a }))
    : fallback;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.name,
      acceptedAnswer: { "@type": "Answer", text: e.text },
    })),
  };
}

function breadcrumbSchema(name: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SWMS Sorted", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}/${slug}` },
    ],
  };
}

function productSchema(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: { "@type": "Brand", name: "SWMS Sorted" },
    offers: {
      "@type": "Offer",
      price: "7.99",
      priceCurrency: "AUD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/job`,
    },
  };
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check state pages first
  const statePage = SEO_STATE_PAGES.find((p) => p.slug === slug);
  if (statePage) {
    return (
      <>
        {jsonLd(
          faqSchema(statePage.faq, [
            { name: `Do I need a SWMS in ${statePage.stateName}?`, text: statePage.whyNeeded },
            {
              name: `What legislation does a ${statePage.state} SWMS reference?`,
              text: `A SWMS in ${statePage.stateName} should reference the ${statePage.primaryAct} and the ${statePage.regulations}. The regulator is ${statePage.regulator}.`,
            },
          ])
        )}
        {jsonLd(breadcrumbSchema(statePage.h1, statePage.slug))}
        {jsonLd(productSchema(`${statePage.state} SWMS — SWMS Sorted`, statePage.metaDescription))}
        <SeoStatePageContent page={statePage} />
      </>
    );
  }

  // Check trade pages
  const tradePage = SEO_TRADE_PAGES.find((p) => p.slug === slug);
  if (tradePage) {
    return (
      <>
        {tradePage.faq?.length
          ? jsonLd(faqSchema(tradePage.faq, []))
          : null}
        {jsonLd(breadcrumbSchema(tradePage.h1, tradePage.slug))}
        {jsonLd(productSchema(`${tradePage.trade} SWMS — SWMS Sorted`, tradePage.metaDescription))}
        <SeoTradePageContent page={tradePage} />
      </>
    );
  }

  notFound();
}
