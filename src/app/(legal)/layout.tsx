import Link from "next/link";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--f-body)" }}>
      <header style={{ background: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "10px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" className="sw-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 25, height: 25, border: "2px solid var(--ink)", background: "repeating-linear-gradient(-45deg, #1A1917 0 5px, var(--swa) 5px 10px)" }} />
            <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 20, letterSpacing: ".05em", color: "var(--ink)" }}>INSTANT SWMS</div>
          </Link>
          <Link href="/job" className="sw-btn sw-btn-sm" style={{ padding: "8px 16px", fontSize: 15 }}>
            BUILD YOUR SWMS
          </Link>
        </div>
      </header>
      <main style={{ padding: "48px 28px" }}>
        <article style={{ maxWidth: 760, margin: "0 auto" }} className="legal-prose">{children}</article>
      </main>
      <footer style={{ borderTop: "2px solid var(--ink)", padding: "24px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "rgba(26,25,23,.6)" }}>
          <span>© {new Date().getFullYear()} INSTANT SWMS · BUILT IN AUSTRALIA</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy" className="sw-link">PRIVACY</Link>
            <Link href="/terms" className="sw-link">TERMS</Link>
            <Link href="/refunds" className="sw-link">REFUNDS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
