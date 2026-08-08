import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(key);
  }
  return _resend;
}

interface DocumentEmailParams {
  to: string;
  signCode: string;
  amountPaid: number;
}

/** Post-purchase email with the buyer's permanent document link — the one
 *  place they can always re-download, run the toolbox talk, and collect
 *  crew sign-ons, even after the buying browser tab is long gone. */
export async function sendDocumentEmail(params: DocumentEmailParams) {
  const { to, signCode, amountPaid } = params;

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).trim();

  const docUrl = `${siteUrl}/documents/${signCode}`;
  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || "SWMS Sorted <onboarding@resend.dev>";

  const { data, error } = await getResend().emails.send({
    from: fromAddress,
    to,
    subject: "Your SWMS is ready — save this link",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="background:#1a2332;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;">
        SWMS <span style="color:#f5a623;">Sorted</span>
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 12px 12px;">
      <h2 style="margin:0 0 8px;color:#1a2332;font-size:22px;">Your SWMS is sorted.</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Thanks for your purchase of $${(amountPaid / 100).toFixed(2)} AUD.
        This is your document's permanent home — bookmark it or keep this email.
      </p>

      <a href="${docUrl}" style="display:block;background:#f5a623;color:#1a2332;text-decoration:none;padding:14px 20px;border-radius:8px;font-weight:600;font-size:15px;text-align:center;">
        Open my document page
      </a>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:10px 0 24px;word-break:break-all;">${docUrl}</p>

      <div style="padding-top:20px;border-top:1px solid #e5e7eb;">
        <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
          From that page you can, on any device:
        </p>
        <ul style="color:#6b7280;font-size:13px;line-height:1.8;margin:8px 0 0;padding-left:20px;">
          <li>Re-download your PDF anytime</li>
          <li>Run the toolbox talk on your phone, even with no reception</li>
          <li>Get the crew signed on — pass the phone or they scan the QR</li>
          <li>Download the signed copy with every signature on the sign-off sheet</li>
        </ul>
        <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:16px 0 0;">
          Need a hand? Reply to this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:20px;">
      SWMS Sorted — Australian WHS Compliant
    </p>
  </div>
</body>
</html>
    `.trim(),
  });

  if (error) {
    console.error("Failed to send document email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log("Document email sent:", data?.id, "to:", to);
  return data;
}
