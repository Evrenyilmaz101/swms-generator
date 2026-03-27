"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaymentInfo {
  plan: string;
  email: string | null;
  amount: number;
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-accent/30 animate-spin border-t-accent mx-auto" />
            <p className="text-muted font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  // Verify the payment with our API
  useEffect(() => {
    if (!sessionId) {
      setError("No payment session found. Please contact support.");
      setVerifying(false);
      return;
    }

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/verify-payment?session_id=${sessionId}`
        );
        const data = await response.json();

        if (data.success) {
          setPaymentInfo(data.payment);
        } else {
          setError(
            data.error || "Payment verification failed. Please contact support."
          );
        }
      } catch {
        setError("Unable to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);

    try {
      // Get SWMS data from sessionStorage
      const pendingSessionId = sessionStorage.getItem("pending_swms_session");
      const dataKey = pendingSessionId
        ? `swms_data_${pendingSessionId}`
        : null;
      const storedData = dataKey ? sessionStorage.getItem(dataKey) : null;

      if (!storedData) {
        setError(
          "SWMS data not found in this browser session. If you closed the tab, please contact support with your payment confirmation."
        );
        return;
      }

      const swmsPayload = JSON.parse(storedData);

      const response = await fetch("/api/download/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swmsPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const businessName =
        swmsPayload.business_name?.replace(/[^a-zA-Z0-9]/g, "_") || "SWMS";
      a.download = `SWMS-${businessName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);

      // Clean up sessionStorage
      if (dataKey) sessionStorage.removeItem(dataKey);
      sessionStorage.removeItem("pending_swms_session");
    } catch {
      setError("Failed to generate PDF. Please try again or contact support.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Loading / verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-accent/30 animate-spin border-t-accent mx-auto" />
          <p className="text-muted font-medium">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-bold">
            <span className="text-accent">SWMS</span> Generator
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        {error ? (
          // Error state
          <div className="text-center space-y-6">
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
            <h1 className="text-2xl font-bold text-primary">
              Something went wrong
            </h1>
            <p className="text-muted">{error}</p>
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
        ) : (
          // Success state
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-primary">
                Payment Successful!
              </h1>
              <p className="text-muted mt-2">
                Your SWMS is ready to download.
              </p>
            </div>

            {paymentInfo && (
              <div className="bg-white rounded-xl border border-border p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Plan</span>
                  <span className="font-medium">
                    {paymentInfo.plan === "single"
                      ? "Single SWMS"
                      : "SWMS 3-Pack"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Amount</span>
                  <span className="font-medium">
                    ${(paymentInfo.amount / 100).toFixed(2)} AUD
                  </span>
                </div>
                {paymentInfo.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Receipt sent to</span>
                    <span className="font-medium">{paymentInfo.email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Download button */}
            {!downloaded ? (
              <Button
                size="lg"
                loading={isDownloading}
                onClick={handleDownload}
                className="w-full"
              >
                {isDownloading ? "Generating PDF..." : "Download Your SWMS"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-success/5 border border-success/30 rounded-xl p-4">
                  <p className="text-sm text-success font-semibold">
                    ✓ Download started! Check your downloads folder.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownload}
                  className="w-full"
                >
                  Download Again
                </Button>
              </div>
            )}

            {/* Create another */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted mb-3">
                Need another SWMS for a different job?
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/details")}
                className="w-full"
              >
                Create Another SWMS
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
