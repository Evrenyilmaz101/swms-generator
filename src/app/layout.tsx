import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SWMS Generator | AI-Powered Safe Work Method Statements",
    template: "%s | SWMS Generator",
  },
  description:
    "Generate compliant Australian SWMS in 60 seconds. AI-powered, mobile-first, no signup required. From $7.99 per document.",
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
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
