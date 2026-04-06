import Link from "next/link";
import type { SeoTradePage } from "@/lib/constants/seo-pages";

export function SeoTradePageContent({ page }: { page: SeoTradePage }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-accent">SWMS</span> Generator
          </Link>
          <Link
            href="/job"
            className="bg-accent text-primary font-bold px-5 py-2 rounded-xl hover:bg-accent-dark transition-colors text-sm"
          >
            Create SWMS
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-white pb-16 pt-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-block bg-accent/20 text-accent text-sm font-semibold px-4 py-1.5 rounded-full">
            Built for {page.tradePlural}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">{page.h1}</h1>
          <p className="text-lg text-white/70">{page.intro}</p>
          <Link
            href="/job"
            className="inline-block bg-accent text-primary font-bold px-8 py-4 rounded-xl text-lg hover:bg-accent-dark transition-colors shadow-lg mt-4"
          >
            {page.cta} — $7.99
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Common hazards */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              Common {page.trade} Hazards Covered
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {page.commonHazards.map((hazard) => (
                <div
                  key={hazard}
                  className="flex items-start gap-2 bg-surface rounded-lg p-3"
                >
                  <span className="text-error font-bold mt-0.5">!</span>
                  <span className="text-sm">{hazard}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HRCW categories */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              High-Risk Categories for {page.tradePlural}
            </h2>
            <p className="text-sm text-muted mb-3">
              {page.trade} work typically triggers these HRCW categories under
              WHS Regulation 291:
            </p>
            <ul className="space-y-2">
              {page.commonHrcw.map((hrcw) => (
                <li
                  key={hrcw}
                  className="flex items-start gap-2 text-sm text-muted"
                >
                  <span className="text-accent font-bold mt-0.5">&#10003;</span>
                  {hrcw}
                </li>
              ))}
            </ul>
          </div>

          {/* Example */}
          <div className="bg-accent/5 border border-accent/30 rounded-xl p-5">
            <h3 className="font-bold text-primary mb-2">
              Example: What You&apos;d Enter
            </h3>
            <p className="text-sm text-muted italic">
              &ldquo;{page.exampleJob}&rdquo;
            </p>
            <p className="text-xs text-muted mt-2">
              The AI expands this into a full SWMS with hazards, controls, risk
              ratings, PPE, emergency procedures, and a toolbox talk script.
            </p>
          </div>

          {/* What you get */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              What&apos;s Included in Your {page.trade} SWMS
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
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
                "Signature blocks for workers",
                "Your business logo and branding",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <span className="text-success">&#10003;</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-surface">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary">
            Generate Your {page.trade} SWMS Now
          </h2>
          <p className="text-muted">
            Describe your job in plain English. AI does the rest in 60 seconds.
          </p>
          <Link
            href="/job"
            className="inline-block bg-accent text-primary font-bold px-8 py-4 rounded-xl text-lg hover:bg-accent-dark transition-colors shadow-lg"
          >
            {page.cta} — $7.99
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white/60 py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span>&copy; {new Date().getFullYear()} Instant SWMS.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link
              href="/job"
              className="hover:text-white transition-colors"
            >
              Create SWMS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
