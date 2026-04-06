import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Instant SWMS | Professional Safe Work Method Statements in 60 Seconds",
    template: "%s | Instant SWMS",
  },
  description:
    "Stop stuffing around with SWMS templates. Generate compliant Safe Work Method Statements in 60 seconds. No signup, no BS. From $7.99.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
