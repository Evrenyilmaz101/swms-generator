import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";
import { PROMO_FREE } from "@/lib/constants/promo";

export const metadata: Metadata = {
  title: {
    default: "SWMS Sorted | Professional Safe Work Method Statements in 60 Seconds",
    template: "%s | SWMS Sorted",
  },
  description:
    `Stop stuffing around with SWMS templates. Generate compliant Safe Work Method Statements in 60 seconds. No signup, no BS. ${PROMO_FREE ? "Free this launch run." : "From $7.99."}`,
  keywords: [
    "SWMS",
    "safe work method statement",
    "SWMS template",
    "SWMS generator",
    "WHS",
    "construction safety",
    "Australia",
  ],
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim()
  ),
  openGraph: {
    siteName: "SWMS Sorted",
    type: "website",
    locale: "en_AU",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SWMS Sorted — compliant Safe Work Method Statements in 60 seconds" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SWMS Sorted",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SWMS Sorted",
              url: (process.env.NEXT_PUBLIC_SITE_URL || "https://swmssorted.com.au").trim(),
              logo: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://swmssorted.com.au").trim()}/icon-512.png`,
              email: "support@swmssorted.com.au",
              areaServed: "AU",
            }),
          }}
        />
        {children}
        <PwaRegister />
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18379076001" />
        <Script id="google-ads-tag">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18379076001');`}
        </Script>
      </body>
    </html>
  );
}
