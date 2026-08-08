import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund Policy for SWMS Sorted.",
};

export default function RefundsPage() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p className="legal-updated">Last updated: 27 July 2026</p>

      <p>
        We want you to be happy with your SWMS before you pay — that&apos;s why you can preview
        the full document (watermarked) before checkout. Here&apos;s how refunds work.
      </p>

      <h2>1. Your rights under Australian Consumer Law</h2>
      <p>
        Our documents come with guarantees that cannot be excluded under the Australian Consumer
        Law. If a document you purchased has a major problem — for example, it fails to generate,
        the download doesn&apos;t work, or the PDF is corrupted — you&apos;re entitled to a
        refund or a replacement. Nothing in this policy limits those rights.
      </p>

      <h2>2. When we&apos;ll refund</h2>
      <ul>
        <li>You paid but never received a working download link.</li>
        <li>The PDF you received is broken, incomplete, or doesn&apos;t match the preview you approved.</li>
        <li>You were charged twice for the same document.</li>
        <li>Unused 3-pack tokens where the fault is ours (for example, tokens that won&apos;t redeem).</li>
      </ul>

      <h2>3. When we generally won&apos;t refund</h2>
      <ul>
        <li>
          Change of mind after downloading a working document that matches the preview you
          approved at checkout.
        </li>
        <li>
          Errors in the document caused by inaccurate or incomplete information you entered —
          you can review and regenerate before paying.
        </li>
        <li>3-pack tokens you&apos;ve already redeemed for documents you received.</li>
      </ul>

      <h2>4. How to request a refund</h2>
      <p>
        Email <a href="mailto:support@swmssorted.com.au">support@swmssorted.com.au</a>{" "}
        within 30 days of purchase with the email you used at checkout and a short description of
        the problem. We&apos;ll respond within 2 business days. Approved refunds are returned to
        your original payment method via Stripe, usually within 5–10 business days.
      </p>
    </>
  );
}
