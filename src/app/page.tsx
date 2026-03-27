import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">
            <span className="text-accent">SWMS</span> Generator
          </span>
          <Link
            href="/details"
            className="bg-accent text-primary font-bold px-5 py-2 rounded-xl hover:bg-accent-dark transition-colors text-sm"
          >
            Create SWMS
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-white pb-20 pt-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block bg-accent/20 text-accent text-sm font-semibold px-4 py-1.5 rounded-full">
            Australian WHS Compliant
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Generate a Professional SWMS
            <br />
            <span className="text-accent">in 60 Seconds</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            AI-powered Safe Work Method Statements for Australian tradies.
            Describe your job, get a compliant document. No signup, no
            templates, no fuss.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/details"
              className="bg-accent text-primary font-bold px-8 py-4 rounded-xl text-lg hover:bg-accent-dark transition-colors shadow-lg"
            >
              Create Your SWMS — $7.99
            </Link>
          </div>
          <p className="text-sm text-white/50">
            No signup required &bull; Pay per document &bull; Instant PDF
            download
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Three Steps. Done.
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Describe Your Job",
                desc: "Type it or talk — our voice input is built for blokes on site with dirty hands.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                ),
              },
              {
                step: "2",
                title: "AI Generates It",
                desc: "Our AI writes a complete SWMS with hazards, controls, risk matrix, PPE, and toolbox talk.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                ),
              },
              {
                step: "3",
                title: "Download & Go",
                desc: "Professional A4 PDF with your branding, signature blocks, and toolbox talk script.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Built for Tradies, Not Desk Jockeys
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Voice Input",
                desc: "Tap and talk. Describe your job like you'd tell your apprentice. Works on site with one hand.",
              },
              {
                title: "Photo Hazard Scan",
                desc: "Snap your worksite. AI spots hazards you might miss — height risks, electrical, confined spaces.",
              },
              {
                title: "State-Specific Legislation",
                desc: "Correct Act and Regulation for your state. VIC and WA OHS Acts handled properly.",
              },
              {
                title: "5×5 Risk Matrix",
                desc: "Proper initial and residual risk ratings using industry-standard likelihood × consequence matrix.",
              },
              {
                title: "HRCW Categories",
                desc: "Automatically identifies which High-Risk Construction Work activities apply to your job.",
              },
              {
                title: "Toolbox Talk Script",
                desc: "Ready-to-read pre-start briefing included. Stand in front of your crew and read it out.",
              },
              {
                title: "Your Branding",
                desc: "Your logo, business name, and ABN on every page. Looks like you paid a safety consultant.",
              },
              {
                title: "Signature Blocks",
                desc: "Print it, get it signed on site, file it. Ready for any inspector walk-through.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-border p-5 space-y-2"
              >
                <h3 className="font-bold text-primary">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold text-primary">Simple Pricing</h2>
          <p className="text-muted">
            No subscriptions. No lock-in. Pay per document.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="border-2 border-border rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-primary">Single SWMS</h3>
              <p className="text-4xl font-bold text-accent">$7.99</p>
              <p className="text-sm text-muted">One document, instant PDF</p>
            </div>
            <div className="border-2 border-accent rounded-xl p-6 space-y-3 relative">
              <span className="absolute -top-3 right-4 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </span>
              <h3 className="text-lg font-bold text-primary">3-Pack</h3>
              <p className="text-4xl font-bold text-accent">$19.99</p>
              <p className="text-sm text-muted">
                $6.66 each &bull; Use anytime within 12 months
              </p>
            </div>
          </div>
          <Link
            href="/details"
            className="inline-block bg-accent text-primary font-bold px-8 py-4 rounded-xl text-lg hover:bg-accent-dark transition-colors shadow-lg"
          >
            Create Your SWMS Now
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center text-primary">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this legally compliant?",
                a: "Our SWMS documents are generated to align with Australian WHS legislation, including state-specific Acts and Regulations. They include all required elements: scope, hazard identification, risk assessment, controls, PPE, and emergency procedures. However, the PCBU (you) is responsible for reviewing and ensuring the document is accurate for your specific worksite.",
              },
              {
                q: "Do I need to sign up?",
                a: "No. No account needed. Fill in your details, describe the job, pay, and download. If you use 'Remember Me', your business details are saved in your browser for next time.",
              },
              {
                q: "What trades does this cover?",
                a: "Any construction or trade work — electrical, plumbing, carpentry, roofing, demolition, excavation, scaffolding, painting, concreting, welding, and more. The AI adapts to whatever job you describe.",
              },
              {
                q: "Can I edit the SWMS after generation?",
                a: "You can review the full SWMS before downloading. If something needs changing, go back and update your job description — the AI will regenerate it. Full inline editing is coming soon.",
              },
              {
                q: "What states are supported?",
                a: "All Australian states and territories: NSW, VIC, QLD, WA, SA, TAS, NT, and ACT. Victoria and Western Australia use their specific OHS Acts instead of the harmonised WHS framework.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-xl border border-border overflow-hidden group"
              >
                <summary className="cursor-pointer px-5 py-4 font-bold text-primary flex items-center justify-between list-none">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-muted transition-transform group-open:rotate-180 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="px-5 pb-4 text-sm text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white/60 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span>
            &copy; {new Date().getFullYear()} SWMS Generator. Australian owned &amp;
            operated.
          </span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
