import Link from "next/link";

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--c-dark)] text-[var(--c-text)]">
      <header className="px-5 py-5 border-b border-white/[0.04]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            <span className="font-extrabold text-[var(--c-yellow)]">Instant</span>
            <span className="font-extrabold text-white ml-1">SWMS</span>
          </Link>
          <Link
            href="/job"
            className="text-sm font-bold bg-[var(--c-yellow)] text-[var(--c-dark)] px-4 py-2 rounded-lg hover:bg-[var(--c-yellow-dim)] transition-colors"
          >
            Build Your SWMS
          </Link>
        </div>
      </header>
      <main className="px-5 py-12">
        <article className="max-w-3xl mx-auto legal-prose">{children}</article>
      </main>
      <footer className="px-5 py-8 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--c-text-dim)]">
          <span>&copy; {new Date().getFullYear()} Instant SWMS. Built in Australia.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/refunds" className="hover:text-white transition-colors">Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
