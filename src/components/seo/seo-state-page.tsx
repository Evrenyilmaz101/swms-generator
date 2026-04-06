import Link from "next/link";
import type { SeoStatePage } from "@/lib/constants/seo-pages";

export function SeoStatePageContent({ page }: { page: SeoStatePage }) {
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
            {page.stateName} &bull; {page.primaryAct}
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
          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              Why Do You Need a SWMS in {page.stateName}?
            </h2>
            <p className="text-muted">{page.whyNeeded}</p>
          </div>

          <div className="bg-error/5 border border-error/20 rounded-xl p-5">
            <h3 className="font-bold text-error mb-2">
              Fines for Non-Compliance
            </h3>
            <p className="text-sm text-muted">{page.fines}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              {page.stateName} Legislation Referenced
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted">
                <span className="text-accent font-bold mt-0.5">&#10003;</span>
                <span>
                  <strong>Primary Act:</strong> {page.primaryAct}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted">
                <span className="text-accent font-bold mt-0.5">&#10003;</span>
                <span>
                  <strong>Regulations:</strong> {page.regulations}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted">
                <span className="text-accent font-bold mt-0.5">&#10003;</span>
                <span>
                  <strong>Regulator:</strong> {page.regulator}
                </span>
              </li>
            </ul>
          </div>

          {/* How it works */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-3">
              How It Works
            </h2>
            <div className="grid gap-4">
              {[
                {
                  n: "1",
                  t: "Enter your business details",
                  d: `Select ${page.state} as your state — the AI references the correct legislation automatically.`,
                },
                {
                  n: "2",
                  t: "Describe the job",
                  d: "Type it or use voice input. Include the work, location, and any specific hazards.",
                },
                {
                  n: "3",
                  t: "AI generates your SWMS",
                  d: `Complete SWMS with ${page.stateName}-specific legislation, risk matrix, PPE, and toolbox talk.`,
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="flex gap-4 items-start bg-surface rounded-xl p-4"
                >
                  <span className="bg-accent text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-bold text-primary">{step.t}</p>
                    <p className="text-sm text-muted">{step.d}</p>
                  </div>
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
            Ready to Generate Your {page.state} SWMS?
          </h2>
          <p className="text-muted">
            60 seconds. No signup. {page.stateName} legislation included.
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
