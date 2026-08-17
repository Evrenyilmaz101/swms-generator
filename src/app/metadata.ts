import type { Metadata } from "next";
import { PROMO_FREE } from "@/lib/constants/promo";

export const homeMetadata: Metadata = {
  title: "SWMS Sorted | Professional Safe Work Method Statements for Tradies",
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
    "tradies",
  ],
};
