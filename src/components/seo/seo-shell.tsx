// Shared chrome + building blocks for the SEO landing pages —
// paper/ink design system, server-rendered, no client JS needed
import Link from "next/link";
import { SEO_STATE_PAGES, SEO_TRADE_PAGES, type SeoFaq } from "@/lib/constants/seo-pages";
import { PROMO_FREE, PRICE_SINGLE } from "@/lib/constants/promo";

export const MONO = "'IBM Plex Mono', monospace";
export const COND = "'Barlow Condensed', sans-serif";

export const eyebrow: React.CSSProperties = { fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)" };
export const h2Style: React.CSSProperties = { fontFamily: COND, fontWeight: 800, fontSize: "clamp(30px,3.6vw,42px)", lineHeight: 0.98, textTransform: "uppercase", margin: 0 };

export function SeoShell({ children, crumb }: { children: React.ReactNode; crumb: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 10, background: "repeating-linear-gradient(-45deg, #1A1917 0 10px, var(--swa) 10px 20px)", borderBottom: "2px solid var(--ink)" }} />
      <header style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--ink)", background: "repeating-linear-gradient(-45deg, #1A1917 0 6px, var(--swa) 6px 12px)" }} />
            <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 20, letterSpacing: ".04em" }}>SWMS SORTED</span>
          </Link>
          <Link href="/job" className="sw-btn-sm" style={{ textDecoration: "none", padding: "9px 16px", fontSize: 15 }}>
            START A SWMS →
          </Link>
        </div>
      </header>
      <nav aria-label="Breadcrumb" style={{ maxWidth: 880, margin: "0 auto", padding: "14px 24px 0", width: "100%", boxSizing: "border-box" }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "rgba(26,25,23,.55)" }}>
          <Link href="/" style={{ color: "rgba(26,25,23,.55)", textDecoration: "none" }}>HOME</Link>
          {" / "}
          <span style={{ color: "var(--ink)" }}>{crumb.toUpperCase()}</span>
        </span>
      </nav>
      <main style={{ flex: 1, width: "100%" }}>{children}</main>
      <SeoFooter />
    </div>
  );
}

export function CtaBand({ heading, sub, cta }: { heading: string; sub: string; cta: string }) {
  return (
    <div style={{ background: "var(--ink)", color: "var(--paper)", borderTop: "2px solid var(--ink)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "52px 24px 56px", textAlign: "center" }}>
        <h2 style={{ ...h2Style, color: "var(--paper)", marginBottom: 10 }}>{heading}</h2>
        <p style={{ margin: "0 0 24px", fontSize: 15.5, color: "rgba(244,241,233,.75)" }}>{sub}</p>
        <Link href="/job" className="sw-btn" style={{ display: "inline-block", padding: "15px 34px", fontSize: 20, textDecoration: "none" }}>
          {cta} — {PROMO_FREE ? "FREE" : PRICE_SINGLE} →
        </Link>
        <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "rgba(244,241,233,.6)" }}>
          {PROMO_FREE ? "NO SIGN-UP · NO CARD NEEDED · FREE THIS LAUNCH RUN" : "NO SIGN-UP · EDIT EVERY STEP BEFORE YOU PAY · 7-DAY REFUND"}
        </div>
      </div>
    </div>
  );
}

export function FaqBlock({ faq }: { faq: SeoFaq[] }) {
  if (!faq?.length) return null;
  return (
    <section>
      <h2 style={{ ...h2Style, marginBottom: 18 }}>Fair questions.</h2>
      <div style={{ borderBottom: "2px solid var(--ink)" }}>
        {faq.map(({ q, a }) => (
          <details key={q} style={{ borderTop: "2px solid var(--ink)" }}>
            <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "15px 2px", cursor: "pointer", fontFamily: COND, fontWeight: 700, fontSize: 19, letterSpacing: ".02em", textTransform: "uppercase" }}>
              {q}
              <span style={{ fontFamily: MONO, fontSize: 14, color: "rgba(26,25,23,.5)" }}>+</span>
            </summary>
            <p style={{ margin: 0, padding: "0 2px 18px", fontSize: 14.5, lineHeight: 1.6, color: "rgba(26,25,23,.75)" }}>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function RelatedLinks({ currentSlug }: { currentSlug: string }) {
  const states = SEO_STATE_PAGES.filter((p) => p.slug !== currentSlug);
  const trades = SEO_TRADE_PAGES.filter((p) => p.slug !== currentSlug);
  return (
    <section>
      <h2 style={{ ...h2Style, marginBottom: 16 }}>SWMS for every job.</h2>
      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.55)", marginBottom: 8 }}>BY TRADE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {trades.map((p) => (
          <Link key={p.slug} href={`/${p.slug}`} className="sw-chip-ghost" style={{ padding: "7px 13px", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textDecoration: "none" }}>
            {p.trade.toUpperCase()}
          </Link>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.55)", marginBottom: 8 }}>BY STATE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {states.map((p) => (
          <Link key={p.slug} href={`/${p.slug}`} className="sw-chip-ghost" style={{ padding: "7px 13px", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textDecoration: "none" }}>
            {p.state}
          </Link>
        ))}
      </div>
    </section>
  );
}

function SeoFooter() {
  return (
    <footer style={{ borderTop: "2px solid var(--ink)", background: "var(--paper)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "rgba(26,25,23,.55)" }}>
          © {new Date().getFullYear()} SWMS SORTED
        </span>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[["/", "HOME"], ["/pricing", "PRICING"], ["/faq", "FAQ"], ["/terms", "TERMS"], ["/privacy", "PRIVACY"], ["/refunds", "REFUNDS"]].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", color: "rgba(26,25,23,.65)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
