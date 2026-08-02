"use client";

// The redesigned flow folds company/site details into Step 1 (/job).
// This route stays only so old links and the redeem flow don't 404.
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DetailsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/job"); }, [router]);
  return null;
}
