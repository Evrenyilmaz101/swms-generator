"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUILDER_STEPS } from "@/types/form";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const stepIdx = Math.max(0, BUILDER_STEPS.findIndex((s) => pathname.startsWith(s.path)));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--f-body)" }}>
      {/* Persistent header */}
      <div style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 28px", minHeight: 46, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px 20px" }}>
          <Link href="/" className="sw-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 25, height: 25, border: "2px solid var(--ink)", background: "repeating-linear-gradient(-45deg, #1A1917 0 5px, var(--swa) 5px 10px)" }} />
            <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 20, letterSpacing: ".05em", color: "var(--ink)" }}>INSTANT SWMS</div>
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {BUILDER_STEPS.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <div key={s.key} style={{ padding: "6px 11px", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", border: "2px solid var(--ink)", background: active ? "var(--swa)" : done ? "var(--ink)" : "transparent", color: done ? "var(--paper)" : "var(--ink)" }}>
                  {s.label}
                </div>
              );
            })}
          </div>
          <Link href="/" className="sw-link" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em" }}>EXIT ✕</Link>
        </div>
        {/* Progress bar — hazard stripe fill */}
        <div style={{ height: 6, background: "rgba(26,25,23,.12)" }}>
          <div style={{ height: "100%", width: `${(stepIdx + 1) * 25}%`, background: "repeating-linear-gradient(-45deg, #1A1917 0 14px, var(--swa) 14px 28px)", borderRight: "2px solid var(--ink)", transition: "width .5s ease" }} />
        </div>
      </div>
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
}
