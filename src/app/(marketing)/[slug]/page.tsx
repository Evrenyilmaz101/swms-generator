import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  SEO_STATE_PAGES,
  SEO_TRADE_PAGES,
} from "@/lib/constants/seo-pages";
import { SeoStatePageContent } from "@/components/seo/seo-state-page";
import { SeoTradePageContent } from "@/components/seo/seo-trade-page";

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

  const statePage = SEO_STATE_PAGES.find((p) => p.slug === slug);
  if (statePage) {
    return {
      title: statePage.title,
      description: statePage.metaDescription,
    };
  }

  const tradePage = SEO_TRADE_PAGES.find((p) => p.slug === slug);
  if (tradePage) {
    return {
      title: tradePage.title,
      description: tradePage.metaDescription,
    };
  }

  return { title: "Not Found" };
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `Do I need a SWMS in ${statePage.stateName}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: statePage.whyNeeded,
                  },
                },
                {
                  "@type": "Question",
                  name: `What legislation does a ${statePage.state} SWMS reference?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `A SWMS in ${statePage.stateName} should reference the ${statePage.primaryAct} and the ${statePage.regulations}. The regulator is ${statePage.regulator}.`,
                  },
                },
              ],
            }),
          }}
        />
        <SeoStatePageContent page={statePage} />
      </>
    );
  }

  // Check trade pages
  const tradePage = SEO_TRADE_PAGES.find((p) => p.slug === slug);
  if (tradePage) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: `${tradePage.trade} SWMS — Instant SWMS`,
              description: tradePage.metaDescription,
              offers: {
                "@type": "Offer",
                price: "7.99",
                priceCurrency: "AUD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        <SeoTradePageContent page={tradePage} />
      </>
    );
  }

  notFound();
}
