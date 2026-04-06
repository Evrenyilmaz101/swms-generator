"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 1, y: 0 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const stagger = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--c-dark)] overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>

      {/* ═══════════ NAV ═══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--c-dark)]/80 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
          <span className="text-lg sm:text-xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            <span className="font-extrabold text-[var(--c-yellow)]">Instant</span>
            <span className="font-extrabold text-white ml-1">SWMS</span>
          </span>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[var(--c-text-dim)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <Link
            href="/job"
            className="bg-[var(--c-yellow)] text-black font-bold px-4 py-2 sm:px-5 sm:py-2.5 text-[13px] sm:text-sm rounded-md hover:bg-[var(--c-yellow-dim)] transition-all hover:-translate-y-[1px]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ═══════════ HERO — Mobile-first responsive ═══════════ */}
      <section className="relative bg-[var(--c-yellow)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.3) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        {/* ── MOBILE HERO (< lg) ── */}
        <div className="relative lg:hidden px-5 pt-20 pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full" style={{ padding: "6px 14px", background: "rgba(12,12,12,0.13)", border: "1px solid rgba(12,12,12,0.2)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#0c0c0c" }} />
            <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "rgba(12,12,12,0.6)" }}>BUILT FOR AUSSIE TRADES</span>
          </div>

          {/* Headline group — scaled for mobile */}
          <div className="relative mt-3">
            <span className="block" style={{ fontFamily: "'Anton'", fontSize: "clamp(36px, 10vw, 56px)", lineHeight: 1.15, color: "#0c0c0c", textShadow: "0 4px 4px rgba(0,0,0,0.25)" }}>STILL DOING</span>
            <span className="block" style={{ fontFamily: "'Bangers'", fontSize: "clamp(72px, 22vw, 130px)", lineHeight: 0.85, letterSpacing: 4, color: "#c50b0b", WebkitTextStroke: "1px #000", textShadow: "20px 20px 8px rgba(0,0,0,0.5)", marginLeft: "clamp(20px, 6vw, 60px)" }}>SWMS</span>
            <span className="block" style={{ fontFamily: "'Anton'", fontSize: "clamp(36px, 10vw, 56px)", lineHeight: 1.15, color: "#0c0c0c", textShadow: "0 4px 4px rgba(0,0,0,0.25)" }}>BY HAND?</span>
          </div>

          {/* Yeah, nah. */}
          <div className="mt-3">
            <span style={{ fontFamily: "'Bangers'", fontSize: "clamp(52px, 14vw, 80px)", lineHeight: 0.95, color: "#0c0c0c" }}>YEAH, NAH.</span>
          </div>

          {/* Bullets */}
          <div className="mt-3">
            {["• No templates", "• No copying", "• No Sign Up"].map((t) => (
              <p key={t} style={{ fontFamily: "'DM Sans'", fontSize: 15, color: "rgba(0,0,0,0.7)", letterSpacing: -0.5, lineHeight: 1.54 }}>{t}</p>
            ))}
          </div>

          {/* CTA buttons — stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link href="/job" className="flex items-center justify-center gap-2.5 rounded-lg card-3d-sm" style={{ padding: "16px 28px", background: "#0c0c0c", fontFamily: "'DM Sans'", fontSize: 16, fontWeight: 700, color: "#EDEAE3", boxShadow: "0 4px 16px rgba(0,0,0,0.23)" }}>
              Build Your SWMS
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            <Link href="#how" className="flex items-center justify-center gap-2.5 rounded-lg" style={{ padding: "16px 28px", border: "1.5px solid #0c0c0c", fontFamily: "'DM Sans'", fontSize: 16, fontWeight: 500, color: "#0c0c0c" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Watch It Work
            </Link>
          </div>

          {/* Trust signals — wrap on mobile */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
            {[
              { path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", text: "WHS Compliant" },
              { path: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", text: "60 seconds flat" },
              { path: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z", text: "Cheaper than a slab" },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-1.5">
                <svg className="w-4 h-4" style={{ color: "#0c0c0c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={t.path} /></svg>
                <span style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, color: "rgba(12,12,12,0.6)" }}>{t.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom tagline */}
          <p className="mt-5" style={{ fontFamily: "'DM Sans'", fontSize: "clamp(16px, 4.5vw, 22px)", fontWeight: 800, color: "rgba(0,0,0,0.7)", letterSpacing: -0.5 }}>
            Site-ready, WHS-compliant SWMS in 60 seconds
          </p>
        </div>

        {/* ── DESKTOP HERO (>= lg) — original Pencil layout ── */}
        <div className="relative mx-auto h-[760px] hidden lg:block" style={{ maxWidth: 1440, padding: "0 48px" }}>
          {/* Left content — absolute positioned like Pencil */}
          <div className="absolute z-10" style={{ left: 116, top: 44 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full" style={{ padding: "6px 14px", background: "rgba(12,12,12,0.13)", border: "1px solid rgba(12,12,12,0.2)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "#0c0c0c" }} />
              <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: "rgba(12,12,12,0.6)" }}>BUILT FOR AUSSIE TRADES</span>
            </div>

            {/* Headline group */}
            <div className="relative flex flex-col justify-between" style={{ width: 446, height: 245, marginTop: 10 }}>
              <span style={{ fontFamily: "'Anton'", fontSize: 64, lineHeight: 1.19, color: "#0c0c0c", textShadow: "0 4px 4px rgba(0,0,0,0.25)" }}>STILL DOING</span>
              <span className="absolute" style={{ fontFamily: "'Bangers'", fontSize: 150, lineHeight: 0.9, letterSpacing: 4, color: "#c50b0b", WebkitTextStroke: "1px #000", textShadow: "42px 41px 10px rgba(0,0,0,0.5)", left: 95, top: 44, width: 360 }}>SWMS</span>
              <span style={{ fontFamily: "'Anton'", fontSize: 64, lineHeight: 1.19, color: "#0c0c0c", textShadow: "0 4px 4px rgba(0,0,0,0.25)" }}>BY HAND?</span>
            </div>

            {/* Yeah, nah. */}
            <div style={{ marginLeft: -7, marginTop: 17 }}>
              <span style={{ fontFamily: "'Bangers'", fontSize: 93, lineHeight: 0.95, color: "#0c0c0c" }}>YEAH, NAH.</span>
            </div>

            {/* Bullets */}
            <div style={{ marginLeft: -7, marginTop: 12 }}>
              {["• No templates", "• No copying", "• No Sign Up"].map((t) => (
                <p key={t} style={{ fontFamily: "'DM Sans'", fontSize: 16, color: "rgba(0,0,0,0.7)", letterSpacing: -0.5, lineHeight: 1.54 }}>{t}</p>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-4" style={{ marginTop: 16 }}>
              <Link href="/job" className="flex items-center gap-2.5 rounded-lg card-3d-sm" style={{ padding: "16px 32px", background: "#0c0c0c", fontFamily: "'DM Sans'", fontSize: 16, fontWeight: 700, color: "#EDEAE3", boxShadow: "0 4px 16px rgba(0,0,0,0.23)" }}>
                Build Your SWMS
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="#how" className="flex items-center gap-2.5 rounded-lg" style={{ padding: "16px 32px", border: "1.5px solid #0c0c0c", fontFamily: "'DM Sans'", fontSize: 16, fontWeight: 500, color: "#0c0c0c" }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch It Work
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6" style={{ marginTop: 16, marginLeft: 3 }}>
              {[
                { path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", text: "WHS Compliant" },
                { path: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", text: "60 seconds flat" },
                { path: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z", text: "Cheaper than a slab" },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" style={{ color: "#0c0c0c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={t.path} /></svg>
                  <span style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, color: "rgba(12,12,12,0.6)" }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* "No Stuffing around!" — tilted, absolutely positioned */}
          <span className="absolute z-20" style={{ fontFamily: "'Bangers'", fontSize: 29, letterSpacing: 4, lineHeight: 0.9, color: "rgba(197,11,11,0.8)", WebkitTextStroke: "1px #000", textShadow: "36px 22px 8px rgba(0,0,0,0.5)", transform: "rotate(-22deg)", left: 265, top: 460, width: 295 }}>
            NO STUFFING AROUND!
          </span>

          {/* Bottom tagline */}
          <span className="absolute" style={{ left: 55, top: 687, fontFamily: "'DM Sans'", fontSize: 24, fontWeight: 800, color: "rgba(0,0,0,0.7)", letterSpacing: -0.5 }}>
            Site-ready, WHS-compliant SWMS in 60 seconds
          </span>

          {/* Hero illustration — positioned on section, flush right edge */}
          <img src="/images/hero-tradie.png" alt="Frustrated Australian tradie overwhelmed by SWMS paperwork" className="absolute object-contain" style={{ right: 0, top: 20, width: 811, height: 785 }} />
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS — Cream ═══════════ */}
      <section id="how" className="relative px-5 py-20 sm:py-28 bg-[var(--c-cream)]">
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn} custom={0} className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-[#E0DDD6] mb-6">
              <span className="text-[11px] font-semibold text-[var(--c-text-dim)] uppercase tracking-[0.15em]">How It Works</span>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extrabold text-[var(--c-dark)] tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three steps. No drama.
            </motion.h2>
            <motion.p variants={fadeIn} custom={2} className="text-lg text-[var(--c-dark)]/50 mt-4">
              Seriously, your smoko break takes longer than this.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                num: "01",
                title: "Tell us the job",
                desc: "Type it, say it, or snap a photo of your site. Use whatever slang you want — sparky, chippie, dogman — we speak tradie.",
                icon: (
                  <svg className="w-6 h-6 text-[var(--c-yellow-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "We sort it out",
                desc: "Our system builds your full SWMS — hazards, controls, PPE, emergency procedures, the lot. All WHS-compliant for your state.",
                icon: (
                  <svg className="w-6 h-6 text-[var(--c-yellow-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Download & go",
                desc: "Review it, tweak it if you want, download the PDF. Rock up to site with your SWMS sorted. Job done.",
                icon: (
                  <svg className="w-6 h-6 text-[var(--c-yellow-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeIn}
                custom={i}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-shadow"
              >
                <div className="w-12 h-12 bg-[var(--c-yellow)] rounded-xl flex items-center justify-center mb-6">
                  <span className="text-lg font-extrabold text-[var(--c-dark)]" style={{ fontFamily: "var(--font-display)" }}>{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--c-dark)] mb-3" style={{ fontFamily: "var(--font-display)" }}>{step.title}</h3>
                <p className="text-[15px] text-[var(--c-dark)]/55 leading-relaxed mb-6">{step.desc}</p>
                <div className="pt-4 border-t border-[var(--c-dark)]/5">
                  {step.icon}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="relative px-5 py-20 sm:py-28 bg-[#695F5F] grain">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn} custom={0} className="inline-flex items-center gap-2.5 bg-[var(--c-mid)] px-4 py-2 rounded-full border border-white/[0.06] mb-6">
              <span className="text-[11px] font-semibold text-[var(--c-text-dim)] uppercase tracking-[0.15em]">Features</span>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extrabold text-white tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Not your grandpa&apos;s
              <br />
              safety form.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Voice card */}
            <motion.div variants={fadeIn} custom={0} className="bg-[var(--c-mid)] p-8 sm:p-10 rounded-2xl border border-white/[0.06] hover:border-[var(--c-yellow)]/20 transition-colors">
              <div className="w-14 h-14 bg-[var(--c-yellow)] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[var(--c-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Voice Input</h3>
              <p className="text-[var(--c-text-dim)] leading-relaxed mb-8">
                Can&apos;t be arsed typing? Just tap the mic and describe the job. We&apos;ll turn your ramble into a proper SWMS.
              </p>
              <div className="bg-[var(--c-dark)] p-5 rounded-xl border-l-[3px] border-[var(--c-yellow)]/30">
                <p className="text-[10px] font-semibold text-[var(--c-yellow)]/50 uppercase tracking-wider mb-2">Live transcription</p>
                <p className="text-sm text-white/50 italic leading-relaxed">
                  &ldquo;Roof replacement on a two-storey in Parramatta. Ripping off tiles, re-sheeting with Colorbond...&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Photo card */}
            <motion.div variants={fadeIn} custom={1} className="bg-[var(--c-mid)] p-8 sm:p-10 rounded-2xl border border-white/[0.06] hover:border-[var(--c-orange)]/20 transition-colors">
              <div className="w-14 h-14 bg-[var(--c-orange)] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[var(--c-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Photo Scan</h3>
              <p className="text-[var(--c-text-dim)] leading-relaxed mb-8">
                Snap a pic of your job site. We&apos;ll spot the hazards and bake them straight into your SWMS. Like having a safety officer in your pocket.
              </p>
              <div className="bg-[var(--c-dark)] p-5 rounded-xl space-y-2.5">
                <p className="text-[10px] font-semibold text-[var(--c-orange)]/50 uppercase tracking-wider mb-3">Hazards detected</p>
                {["Open trench — no barriers", "Missing edge protection at 4m", "Overhead power lines within 3m"].map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 bg-[var(--c-orange)] rounded-full shrink-0" />
                    <span className="text-sm text-white/50">{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="relative px-5 py-20 sm:py-28 bg-[var(--c-dark)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn} custom={0} className="inline-flex items-center gap-2.5 bg-[var(--c-mid)] px-4 py-2 rounded-full border border-white/[0.06] mb-6">
              <span className="text-[11px] font-semibold text-[var(--c-text-dim)] uppercase tracking-[0.15em]">Pricing</span>
            </motion.div>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extrabold text-white tracking-[-0.02em] leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cheaper than a slab.
              <br />
              Better than a template.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            {/* Single */}
            <motion.div variants={fadeIn} custom={0} className="bg-[var(--c-mid)] p-8 rounded-2xl border border-white/[0.06]">
              <p className="text-sm font-semibold text-[var(--c-text-dim)]">Single SWMS</p>
              <div className="flex items-end gap-1 mt-4">
                <span className="text-5xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>$7.99</span>
                <span className="text-[var(--c-text-dim)] mb-1.5 ml-1">one-off</span>
              </div>
              <p className="text-[15px] text-[var(--c-text-dim)] mt-4 leading-relaxed">
                Perfect for one-off jobs or giving it a crack.
              </p>
              <div className="w-full h-px bg-white/[0.06] my-6" />
              <div className="space-y-3.5">
                {["Full A4 PDF download", "WHS compliant for all states", "Voice & photo input"].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-white/80">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/job"
                className="block w-full mt-8 py-3.5 text-center border border-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors"
              >
                Get Started
              </Link>
            </motion.div>

            {/* 3-Pack */}
            <motion.div variants={fadeIn} custom={1} className="relative bg-[var(--c-mid)] rounded-2xl border-2 border-[var(--c-yellow)] overflow-hidden">
              <div className="bg-[var(--c-yellow)] py-2 text-center">
                <span className="text-[11px] font-bold text-[var(--c-dark)] uppercase tracking-[0.15em]">Best Value</span>
              </div>
              <div className="p-8">
                <p className="text-sm font-semibold text-[var(--c-yellow)]">3-Pack</p>
                <div className="flex items-end gap-1 mt-4">
                  <span className="text-5xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>$19.99</span>
                  <span className="text-[var(--c-text-dim)] mb-1.5 ml-1">3 SWMS</span>
                </div>
                <div className="inline-flex mt-3 px-3 py-1 rounded-full bg-[var(--c-yellow)]/10">
                  <span className="text-xs font-semibold text-[var(--c-yellow)]">Save $3.98 vs buying singles</span>
                </div>
                <div className="w-full h-px bg-white/[0.06] my-6" />
                <div className="space-y-3.5">
                  {["Everything in Single, plus:", "Use anytime — tokens don't expire", "Perfect for multi-site crews"].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-sm text-white/80">{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/job"
                  className="block w-full mt-8 py-3.5 text-center bg-[var(--c-yellow)] text-[var(--c-dark)] text-sm font-bold rounded-lg hover:bg-[var(--c-yellow-dim)] transition-colors shadow-[0_4px_20px_rgba(255,214,0,0.3)]"
                >
                  Get the 3-Pack
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA — Yellow ═══════════ */}
      <section className="relative px-5 py-20 sm:py-28 bg-[var(--c-yellow)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="relative max-w-3xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeIn}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-[3.5rem] font-extrabold text-[var(--c-dark)] tracking-[-0.02em] leading-[1.0]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to ditch the
            <br />
            paperwork?
          </motion.h2>
          <motion.p variants={fadeIn} custom={1} className="text-lg text-[var(--c-dark)]/50 mt-6 max-w-lg mx-auto leading-relaxed">
            Join thousands of Aussie tradies who stopped stuffing around
            and started getting on with the actual job.
          </motion.p>
          <motion.div variants={fadeIn} custom={2} className="mt-10">
            <Link
              href="/job"
              className="group inline-flex items-center gap-3 bg-[var(--c-dark)] text-[var(--c-yellow)] font-bold px-10 py-5 text-lg rounded-lg card-3d-sm"
            >
              Build Your SWMS Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
          <motion.p variants={fadeIn} custom={3} className="text-sm text-[var(--c-dark)]/40 mt-6">
            No account needed. Pay when you&apos;re happy.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="px-5 py-8 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              <span className="font-extrabold text-[var(--c-yellow)]">Instant</span>
              <span className="font-extrabold text-white ml-1">SWMS</span>
            </span>
            <div className="flex gap-6 text-xs text-[var(--c-text-dim)]">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:support@swmsgenerator.com.au" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="w-full h-px bg-white/[0.04] mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--c-text-dim)]">
            <span>&copy; {new Date().getFullYear()} Instant SWMS. Built in Australia.</span>
            <span className="text-[11px] text-[var(--c-text-dim)]/60 max-w-sm text-right">
              SWMS documents should be reviewed by a competent person before use on site.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
