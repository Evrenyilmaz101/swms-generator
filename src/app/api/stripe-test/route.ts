import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    const priceId = (process.env.STRIPE_PRICE_SINGLE || "").trim();

    // Test 1: Simple GET (already works)
    const getRes = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const getData = await getRes.json();

    // Test 2: POST to create a checkout session (same as checkout route)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[plan]", "single");
    params.set("metadata[swms_session_id]", "test-diag");
    params.set("success_url", `${siteUrl}/download/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${siteUrl}/checkout`);

    const postRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const postData = await postRes.json();

    return NextResponse.json({
      test1_get: { status: getRes.status, price: getData.id },
      test2_post: {
        status: postRes.status,
        sessionId: postData.id,
        url: postData.url?.slice(0, 60),
        error: postData.error?.message,
      },
      siteUrl,
      bodyPreview: params.toString().slice(0, 200),
    });
  } catch (e) {
    return NextResponse.json({
      error: String(e),
      stack: e instanceof Error ? e.stack?.split("\n").slice(0, 5) : undefined,
    }, { status: 500 });
  }
}
