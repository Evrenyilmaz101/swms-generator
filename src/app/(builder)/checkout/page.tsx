"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const { generatedSwms, businessDetails, setCurrentStep } = useBuilderStore();
  const [selectedPlan, setSelectedPlan] = useState<"single" | "three_pack">(
    "single"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generatedSwms) {
      router.push("/details");
      return;
    }
    setCurrentStep("checkout");
  }, []);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      // Store SWMS data in sessionStorage so success page can access it
      // The session ID links the payment to the generated SWMS
      const swmsSessionId = `swms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(
        `swms_data_${swmsSessionId}`,
        JSON.stringify({
          business_name: businessDetails.business_name,
          abn: businessDetails.abn,
          contact_name: businessDetails.contact_name,
          phone: businessDetails.phone,
          state: businessDetails.state,
          logo_base64: businessDetails.logo_base64,
          swms_data: generatedSwms,
          compliance_score: useBuilderStore.getState().complianceScore,
          document_reference: `SWMS-${Date.now()}`,
          revision_number: 1,
          created_at: new Date().toLocaleDateString("en-AU"),
        })
      );

      // Also store the session ID so success page knows which data to load
      sessionStorage.setItem("pending_swms_session", swmsSessionId);

      // Create Stripe Checkout Session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          swms_session_id: swmsSessionId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!generatedSwms) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Get Your SWMS</h1>
        <p className="text-muted mt-1">
          Choose your plan and download your professional SWMS document.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Single */}
        <button
          type="button"
          onClick={() => setSelectedPlan("single")}
          className={`
            p-5 rounded-xl border-2 text-left transition-all cursor-pointer
            ${
              selectedPlan === "single"
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-border hover:border-accent/50"
            }
          `}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-primary">Single SWMS</span>
            <span className="text-2xl font-bold text-accent">$7.99</span>
          </div>
          <p className="text-sm text-muted mt-2">
            One SWMS document, ready to download as a professional PDF.
          </p>
          <ul className="mt-3 space-y-1">
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              Professional A4 PDF
            </li>
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              Your branding & logo
            </li>
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              Toolbox talk included
            </li>
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              Signature blocks
            </li>
          </ul>
        </button>

        {/* Three-pack */}
        <button
          type="button"
          onClick={() => setSelectedPlan("three_pack")}
          className={`
            relative p-5 rounded-xl border-2 text-left transition-all cursor-pointer
            ${
              selectedPlan === "three_pack"
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-border hover:border-accent/50"
            }
          `}
        >
          {/* Best value badge */}
          <span className="absolute -top-3 right-4 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full">
            SAVE 17%
          </span>

          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-primary">3-Pack</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-accent">$19.99</span>
              <span className="text-xs text-muted block">$6.66 each</span>
            </div>
          </div>
          <p className="text-sm text-muted mt-2">
            Three SWMS documents. Links emailed to you — use anytime within 12
            months.
          </p>
          <ul className="mt-3 space-y-1">
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              Everything in Single
            </li>
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              3 separate SWMS documents
            </li>
            <li className="text-xs text-muted flex items-center gap-2">
              <span className="text-success">&#10003;</span>
              Use links anytime (12 month expiry)
            </li>
          </ul>
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Document</span>
          <span className="font-medium">
            SWMS — {businessDetails.business_name}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Plan</span>
          <span className="font-medium">
            {selectedPlan === "single" ? "Single SWMS" : "3-Pack"}
          </span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-lg text-accent">
            {selectedPlan === "single" ? "$7.99" : "$19.99"} AUD
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-error/5 border border-error/30 rounded-xl p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Secure Payment
        </span>
        <span>Australian Owned</span>
        <span>WHS Compliant</span>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/review")}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          size="lg"
          loading={isLoading}
          onClick={handleCheckout}
          className="flex-1"
        >
          {isLoading ? "Redirecting to payment..." : "Pay & Download"}
        </Button>
      </div>

      <p className="text-center text-xs text-muted">
        Powered by Stripe. Your payment details never touch our servers.
      </p>
    </div>
  );
}
