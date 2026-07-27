import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Instant SWMS.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: 27 July 2026</p>

      <p>
        This policy explains how Instant SWMS (&quot;we&quot;, &quot;us&quot;) collects, uses, and
        protects your information when you use our website and document generation service. We
        handle personal information in accordance with the Privacy Act 1988 (Cth) and the
        Australian Privacy Principles.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Business details you enter:</strong> business name, ABN, contact name, phone
          number, state, and your logo — used to fill in your SWMS document.
        </li>
        <li>
          <strong>Job information:</strong> the job descriptions, site addresses, and any photos
          or voice input you provide — used to generate your document. Voice input is transcribed
          in your browser; we receive the text, not the audio.
        </li>
        <li>
          <strong>Payment details:</strong> handled entirely by Stripe. We never see or store
          your card number. We receive confirmation of payment and the email you provide at
          checkout so we can deliver your document and receipt.
        </li>
        <li>
          <strong>Worker sign-off details:</strong> if you use the digital sign-off feature,
          workers&apos; names, roles, licence numbers, and drawn signatures are collected and
          attached to your SWMS document.
        </li>
        <li>
          <strong>Usage data:</strong> standard analytics such as pages visited and approximate
          location (country/city level), used to understand how the site is used and improve it.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To generate, deliver, and let you re-download your SWMS documents.</li>
        <li>To process payments and provide receipts.</li>
        <li>To operate the worker sign-off feature you initiate.</li>
        <li>To respond to support requests.</li>
        <li>To monitor, secure, and improve the Service.</li>
      </ul>
      <p>We do not sell your personal information, and we don&apos;t send marketing emails unless you opt in.</p>

      <h2>3. Who we share it with</h2>
      <p>
        We use a small number of service providers to run the Service, and share only what each
        needs to do its job:
      </p>
      <ul>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>Supabase</strong> — secure database hosting for purchases, documents, and sign-offs.</li>
        <li><strong>Vercel</strong> — website hosting and analytics.</li>
        <li><strong>Anthropic</strong> — processing job descriptions and photos to produce document content. This data is not used to train models.</li>
        <li><strong>Resend</strong> — transactional email delivery.</li>
      </ul>
      <p>
        Some of these providers store data outside Australia (for example, in the United States
        or Japan). We take reasonable steps to ensure they handle your information consistently
        with Australian privacy law. We may also disclose information where required by law.
      </p>

      <h2>4. Storage and security</h2>
      <p>
        Data is transmitted over encrypted connections (HTTPS) and stored with access controls.
        Document download links are protected by signed tokens. Some information (such as your
        &quot;remember me&quot; business details and generated documents for re-download) is
        stored locally in your own browser and never leaves your device unless you use it in a
        document.
      </p>

      <h2>5. Retention</h2>
      <p>
        We keep purchase records as required for tax and accounting purposes. Generated documents
        and sign-off records are retained so you can re-download them; sign-off links expire
        after 12 months. You can ask us to delete your documents and personal information at any
        time (see below).
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your personal information by
        emailing <a href="mailto:support@swmsgenerator.com.au">support@swmsgenerator.com.au</a>.
        We&apos;ll respond within a reasonable time. If you&apos;re unhappy with how we handle a
        privacy complaint, you can contact the Office of the Australian Information Commissioner
        (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use only essential browser storage needed for the Service to work (such as keeping
        your progress through the document builder) and privacy-friendly analytics. We don&apos;t
        use advertising or cross-site tracking cookies.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update this policy from time to time. The version on this page applies from its
        &quot;last updated&quot; date.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions? Email{" "}
        <a href="mailto:support@swmsgenerator.com.au">support@swmsgenerator.com.au</a>.
      </p>
    </>
  );
}
