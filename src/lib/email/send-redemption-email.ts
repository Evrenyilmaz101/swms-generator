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

interface RedemptionEmailParams {
  to: string;
  tokens: string[];
  amountPaid: number;
}

export async function sendRedemptionEmail(params: RedemptionEmailParams) {
  const { to, tokens, amountPaid } = params;

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).trim();

  const links = tokens.map(
    (token, i) => `${siteUrl}/redeem/${token}`
  );

  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || "Instant SWMS <onboarding@resend.dev>";

  const { data, error } = await getResend().emails.send({
    from: fromAddress,
    to,
    subject: "Your SWMS 3-Pack — Redemption Links Inside",
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
        <span style="color:#f5a623;">Instant</span> SWMS
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 12px 12px;">
      <h2 style="margin:0 0 8px;color:#1a2332;font-size:22px;">Your 3-Pack is ready!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Thanks for your purchase of $${(amountPaid / 100).toFixed(2)} AUD.
        Below are your 3 redemption links. Each one creates a professional SWMS document — use them anytime within 12 months.
      </p>

      <!-- Links -->
      ${links
        .map(
          (link, i) => `
      <div style="margin-bottom:12px;">
        <a href="${link}" style="display:block;background:#f5a623;color:#1a2332;text-decoration:none;padding:14px 20px;border-radius:8px;font-weight:600;font-size:15px;text-align:center;">
          Create SWMS #${i + 1}
        </a>
      </div>`
        )
        .join("")}

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;">
          <strong>How it works:</strong> Click a link above, fill in your job details, and download your professional SWMS PDF instantly. Each link can be used once.
        </p>
        <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:12px 0 0;">
          Links expire 12 months from purchase. Need help? Reply to this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:20px;">
      Instant SWMS — Australian WHS Compliant
    </p>
  </div>
</body>
</html>
    `.trim(),
  });

  if (error) {
    console.error("Failed to send redemption email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log("Redemption email sent:", data?.id, "to:", to);
  return data;
}
