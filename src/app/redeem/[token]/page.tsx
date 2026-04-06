"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui/button";

interface TokenInfo {
  valid: boolean;
  error?: string;
  plan?: string;
  creditsUsed?: number;
  creditsTotal?: number;
}

export default function RedeemPage() {
  const params = useParams();
  const router = useRouter();
  const { setRedemptionToken, reset } = useBuilderStore();

  const token = params.token as string;
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validate() {
      try {
        const response = await fetch(
          `/api/redeem/validate?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();
        setTokenInfo(data);
      } catch {
        setTokenInfo({ valid: false, error: "Failed to validate link" });
      } finally {
        setLoading(false);
      }
    }

    if (token) validate();
  }, [token]);

  function handleStart() {
    // Reset builder and set the redemption token
    reset();
    setRedemptionToken(token);
    router.push("/details");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white py-3 px-4">
        <div className="max-w-2xl mx-auto">
          <a href="/" className="text-lg font-bold">
            <span className="text-accent">Instant</span> SWMS
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-accent/30 animate-spin border-t-accent mx-auto" />
            <p className="text-muted font-medium">Validating your link...</p>
          </div>
        ) : tokenInfo?.valid ? (
          <div className="text-center space-y-6">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-primary">
                Your SWMS Credit is Ready
              </h1>
              <p className="text-muted mt-2">
                This link entitles you to one professional SWMS document.
              </p>
            </div>

            {tokenInfo.creditsTotal && tokenInfo.creditsTotal > 1 && (
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Credits used</span>
                  <span className="font-medium">
                    {tokenInfo.creditsUsed} of {tokenInfo.creditsTotal}
                  </span>
                </div>
              </div>
            )}

            <Button size="lg" onClick={handleStart} className="w-full">
              Create Your SWMS
            </Button>

            <p className="text-xs text-muted">
              You&apos;ll fill in your business and job details, then download
              your PDF — no payment required.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-6">
            {/* Error icon */}
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-primary">
                Link Not Valid
              </h1>
              <p className="text-muted mt-2">
                {tokenInfo?.error === "Token already used"
                  ? "This redemption link has already been used to create a SWMS."
                  : tokenInfo?.error === "Token expired"
                    ? "This redemption link has expired (12 month limit)."
                    : "This redemption link is not valid or has been removed."}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                Back to Home
              </Button>
              <p className="text-xs text-muted">
                Need help? Email{" "}
                <a
                  href="mailto:support@swmsgenerator.com.au"
                  className="text-accent hover:underline"
                >
                  support@swmsgenerator.com.au
                </a>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
