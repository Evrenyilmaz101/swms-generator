import Link from "next/link";
import type { SeoStatePage } from "@/lib/constants/seo-pages";
import { SeoShell, CtaBand, FaqBlock, RelatedLinks, MONO, COND, h2Style } from "./seo-shell";

export function SeoStatePageContent({ page }: { page: SeoStatePage }) {
  return (
    <SeoShell crumb={`SWMS Template ${page.state}`}>
      {/* Hero */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "34px 24px 44px", boxSizing: "border-box" }}>
        <div style={{ display: "inline-block", border: "1px solid var(--ink)", background: "var(--swa)", padding: "5px 12px", fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".12em", marginBottom: 16 }}>
          {page.stateName.toUpperCase()} · {page.regulator.toUpperCase()}
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
          {/* Why needed */}
          <section>
            <h2 style={{ ...h2Style, marginBottom: 12 }}>Why you need one in {page.stateName}.</h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: "rgba(26,25,23,.78)", maxWidth: 680 }}>{page.whyNeeded}</p>
          </section>

          {/* Fines */}
          <section style={{ border: "2px solid var(--sorange)", background: "var(--card)" }}>
            <div style={{ background: "var(--sorange)", color: "var(--paper)", padding: "8px 16px", fontFamily: COND, fontWeight: 800, fontSize: 17, letterSpacing: ".04em" }}>
              ⚠ NON-COMPLIANCE COSTS
            </div>
            <p style={{ margin: 0, padding: "14px 18px", fontSize: 14.5, lineHeight: 1.6, color: "rgba(26,25,23,.8)" }}>{page.fines}</p>
          </section>

          {/* Legislation */}
          <section>
            <h2 style={{ ...h2Style, marginBottom: 14 }}>{page.state} legislation it references.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[page.primaryAct, page.regulations, `Regulator: ${page.regulator}`].map((item) => (
                <div key={item} style={{ border: "1px solid var(--ink)", background: "var(--card)", padding: "10px 14px", fontFamily: MONO, fontSize: 12.5, fontWeight: 500, letterSpacing: ".02em" }}>
                  § {item}
                </div>
              ))}
            </div>
            <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 11, letterSpacing: ".04em", color: "rgba(26,25,23,.55)" }}>
              EVERY DOCUMENT IS BUILT FOR YOUR STATE — PICK {page.state} IN THE BUILDER AND THE RIGHT ACTS, REGULATIONS AND CODES COME WITH IT.
            </p>
          </section>

          {page.faq && <FaqBlock faq={page.faq} />}
          <RelatedLinks currentSlug={page.slug} />
        </div>
      </div>

      <CtaBand
        heading={`Your ${page.state} SWMS, sorted.`}
        sub="Describe the job like you'd tell your apprentice. Review every step. Pay when it reads right."
        cta={page.cta}
      />
    </SeoShell>
  );
}
