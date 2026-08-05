import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Instant SWMS",
    short_name: "Instant SWMS",
    description:
      "Site-ready, WHS-compliant Safe Work Method Statements in minutes. Run toolbox talks and collect crew sign-offs from your phone.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F1E9",
    theme_color: "#1A1917",
    orientation: "portrait",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
