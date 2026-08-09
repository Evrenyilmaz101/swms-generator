import Link from "next/link";
import type { SeoTradePage } from "@/lib/constants/seo-pages";
import { SeoShell, CtaBand, FaqBlock, RelatedLinks, MONO, COND, h2Style } from "./seo-shell";

const INCLUDED = [
  "Scope of work description",
  "HRCW activity identification",
  "Step-by-step work procedure",
  "Hazard identification per step",
  "5×5 risk matrix (initial & residual)",
  "Hierarchy of controls",
  "PPE requirements with AS/NZS standards",
  "Emergency procedures",
  "Toolbox talk pre-start briefing",
  "State-specific legislation references",
  "Digital crew sign-on with QR code",
  "Your logo, ABN and letterhead",
];

export function SeoTradePageContent({ page }: { page: SeoTradePage }) {
  return (
    <SeoShell crumb={`${page.trade} SWMS`}>
      {/* Hero */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "34px 24px 44px", boxSizing: "border-box" }}>
        <div style={{ display: "inline-block", border: "1px solid var(--ink)", background: "var(--swa)", padding: "5px 12px", fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".12em", marginBottom: 16 }}>
          BUILT FOR {page.tradePlural.toUpperCase()}
        </div>
        <h1 style={{ margin: "0 0 14px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(40px,5.5vw,62px)", lineHeight: 0.95, textTransform: "uppercase" }}>
          {page.h1}
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 16.5, lineHeight: 1.6, color: "rgba(26,25,23,.75)", maxWidth: 640 }}>{page.intro}</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/job" className="sw-btn" style={{ display: "inline-block", padding: "14px 28px", fontSize: 19, textDecoration: "none" }}>
            {page.cta} — $7.99 →
          </Link>
          <a href="/sample-swms.pdf" target="_blank" rel="noopener noreferrer" className="sw-ghost" style={{ display: "inline-block", padding: "13px 22px", fontSize: 16, textDecoration: "none" }}>
            READ A FULL SAMPLE ↗
          </a>
        </div>
        <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "rgba(26,25,23,.55)" }}>
          ✓ 60 SECONDS &nbsp; ✓ NO SIGN-UP &nbsp; ✓ EDIT EVERYTHING BEFORE YOU PAY
        </div>
      </section>

      <div style={{ borderTop: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "44px 24px 52px", display: "flex", flexDirection: "column", gap: 44, boxSizing: "border-box" }}>
          {/* Why a SWMS */}
          {page.whySwms && (
            <section>
              <h2 style={{ ...h2Style, marginBottom: 12 }}>Why {page.tradePlural.toLowerCase()} need one.</h2>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: "rgba(26,25,23,.78)", maxWidth: 680 }}>{page.whySwms}</p>
            </section>
          )}

          {/* Hazards */}
          <section>
            <h2 style={{ ...h2Style, marginBottom: 16 }}>Common {page.trade.toLowerCase()} hazards covered.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 10 }}>
              {page.commonHazards.map((hazard) => (
                <div key={hazard} style={{ border: "1px solid var(--ink)", background: "var(--card)", padding: "10px 14px", display: "flex", gap: 10, alignItems: "baseline", fontSize: 14 }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, color: "var(--sorange)" }}>!</span>
                  {hazard}
                </div>
              ))}
            </div>
          </section>

          {/* HRCW */}
          <section>
            <h2 style={{ ...h2Style, marginBottom: 10 }}>High-risk work it flags.</h2>
            <p style={{ margin: "0 0 14px", fontFamily: MONO, fontSize: 11.5, letterSpacing: ".04em", color: "rgba(26,25,23,.6)" }}>
              {page.trade.toUpperCase()} WORK TYPICALLY TRIGGERS THESE HRCW CATEGORIES — WHS REGULATION 291:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {page.commonHrcw.map((hrcw) => (
                <div key={hrcw} style={{ border: "1px solid var(--ink)", background: "var(--swa)", padding: "9px 14px", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".03em" }}>
                  ⚠ {hrcw.toUpperCase()}
                </div>
              ))}
            </div>
          </section>

          {/* Example */}
          <section style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "7px 7px 0 rgba(26,25,23,.12)" }}>
            <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "9px 16px", fontFamily: COND, fontWeight: 800, fontSize: 17, letterSpacing: ".04em" }}>
              WHAT YOU&apos;D TYPE IN
            </div>
            <div style={{ padding: "16px 18px" }}>
              <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.6, fontStyle: "italic", color: "rgba(26,25,23,.8)" }}>
                &ldquo;{page.exampleJob}&rdquo;
              </p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, letterSpacing: ".04em", color: "rgba(26,25,23,.55)" }}>
                WE TURN THAT INTO THE FULL DOCUMENT — STEPS, HAZARDS, CONTROLS, RISK RATINGS, PPE, EMERGENCY PLAN AND TOOLBOX TALK.
              </p>
            </div>
          </section>

          {/* What you get */}
          <section>
            <h2 style={{ ...h2Style, marginBottom: 16 }}>What lands in your {page.trade.toLowerCase()} SWMS.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: "8px 20px" }}>
              {INCLUDED.map((item) => (
                <div key={item} style={{ display: "flex", gap: 9, alignItems: "baseline", fontSize: 14.5, color: "rgba(26,25,23,.82)" }}>
                  <span style={{ color: "#3F9C55", fontWeight: 700 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          {page.faq && <FaqBlock faq={page.faq} />}
          <RelatedLinks currentSlug={page.slug} />
        </div>
      </div>

      <CtaBand
        heading={`Your ${page.trade.toLowerCase()} SWMS, sorted.`}
        sub="Describe the job like you'd tell your apprentice. Review every step. Pay when it reads right."
        cta={page.cta}
      />
    </SeoShell>
  );
}
