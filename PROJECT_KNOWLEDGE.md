# Instant SWMS - Project Knowledge File
> **Last Updated:** 2026-07-27 | **Status:** LIVE IN PRODUCTION (Stripe still test mode)
> **Live URL:** https://swms-generator.vercel.app
> **Always update this file at the end of every session.**

---

## Quick Start

```bash
cd "C:/Users/a/Desktop/Claude Projects/SWMS creator/swms-generator"
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
vercel --prod --yes  # Deploy to production
```

- All env vars in `.env.local` (gitignored)
- Vercel project: `evren-yilmazs-projects/swms-generator`
- GitHub username: `Evrenyilmaz101`

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| React | React + React DOM | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| AI | Anthropic Claude Sonnet 4 | SDK ^0.80.0 |
| Payments | Stripe | ^20.4.1 |
| Database | Supabase (PostgreSQL) | ^2.100.0 |
| PDF | @react-pdf/renderer | ^4.3.2 |
| State | Zustand | ^5.0.12 |
| Validation | Zod | ^4.3.6 |
| Animation | Framer Motion | ^12.38.0 |
| Email | Resend | ^6.9.4 |

**IMPORTANT:** Next.js 16 has breaking changes from training data. Read `node_modules/next/dist/docs/` before modifying framework-level code.

---

## Design System & Branding

### Brand Rules
- **NO AI branding anywhere** - don't mention AI in copy, PDFs, or metadata
- Use "our system", "we", "automated" instead of "AI-powered"
- Playful, cheeky Aussie tradie tone - use slang (sparky, chippie, bloke, stuffing around)
- Target audience: Australian sole traders and small construction crews

### Color Palette (CSS Variables in globals.css)
```css
--c-dark: #0c0c0c        /* Near-black background */
--c-charcoal: #1a1a1a    /* Dark surface */
--c-mid: #2a2a2a         /* Mid-dark surface */
--c-yellow: #FFD600      /* Primary accent (construction yellow) */
--c-yellow-dim: #c9a800  /* Hover/dim yellow */
--c-orange: #FF8A00      /* Secondary accent */
--c-cream: #FAF7F0       /* Light sections (How It Works) */
--c-text: #EDEAE3        /* Light text on dark */
--c-text-dim: #9B978E    /* Muted text */
```

### Typography
- **Display/Headlines:** Anton (all-caps bold), Bangers (playful/hand-drawn)
- **Body:** DM Sans
- **Brand Logo:** Bricolage Grotesque ("Instant" italic + "SWMS" bold)
- **Fonts loaded via:** `<link>` tags in `layout.tsx` (NOT CSS @import - Tailwind v4 strips those)

### Hero Section Typography (Pencil Design)
The hero uses a specific mixed-typography layout with absolute positioning:
- "STILL DOING" - Anton, 64px, black
- "SWMS" - Bangers, 150px, red (#c50b0b), absolutely positioned overlapping, 1px black stroke, heavy shadow
- "BY HAND?" - Anton, 64px, black
- "YEAH, NAH." - Bangers, 93px, black
- "NO STUFFING AROUND!" - Bangers, 29px, red, rotated -22deg
- Bullets: DM Sans, 16px, no stroke, plain

### Custom CSS Effects
- `.card-3d` / `.card-3d-sm` / `.card-3d-yellow` - 3D offset shadow with hover lift
- `.stripe-texture` - Diagonal stripe pattern
- `.grain` - Noise texture overlay via SVG filter

---

## Architecture

### File Structure
```
src/
  app/
    page.tsx                    # Landing page (hero, how-it-works, features, pricing, CTA, footer)
    layout.tsx                  # Root layout (fonts, metadata)
    globals.css                 # Tailwind + CSS variables + custom effects
    (builder)/
      layout.tsx                # Builder shell (header, step indicator, dark theme)
      details/page.tsx          # Step 1: Business details
      job/page.tsx              # Step 2: Job description + photo/voice
      review/page.tsx           # Step 3: Generated SWMS review
      checkout/page.tsx         # Step 4: Payment + download
    (marketing)/[slug]/page.tsx # Dynamic SEO pages (6 states + 11 trades)
    api/
      generate/route.ts         # Claude SWMS generation
      analyze-photo/route.ts    # Photo hazard detection (Claude Vision)
      checkout/route.ts         # Stripe session creation
      verify-payment/route.ts   # Payment verification
      download/[token]/route.ts # PDF download (JWT-protected)
      webhooks/stripe/route.ts  # Stripe webhook handler
      redeem/route.ts           # 3-pack token redemption
  components/
    builder/                    # Step indicator, photo upload, voice input
    seo/                        # State/trade landing page templates
    ui/                         # Button, Input, Select, Textarea
  lib/
    ai/                         # Claude integration, prompts, schema validation
    constants/                  # HRCW categories, risk matrix, states, trades, SEO pages
    pdf/                        # PDF renderer, document structure, components
    stripe/                     # Stripe server wrapper
    supabase/                   # DB client, purchase queries
    utils/                      # Formatting, rate limiting, JWT tokens
    validators/                 # Zod form schemas
  stores/
    builder-store.ts            # Zustand (sessionStorage + localStorage)
  types/
    api.ts, form.ts, swms.ts   # TypeScript interfaces
```

### Key Images
```
public/images/
  hero-tradie.png              # Hero illustration (transparent PNG, caricature style tradie with Aussie flag)
  hero-tradie-paperwork.png    # Earlier Pencil-generated version (not used)
```

---

## Landing Page (page.tsx)

The hero section uses **absolute positioning** matching a Pencil.dev design file. Key layout coordinates (based on 1440px canvas):

| Element | Position | Font | Size |
|---------|----------|------|------|
| Badge "BUILT FOR AUSSIE TRADES" | left:116, top:44 | DM Sans | 11px |
| Headline group | left:116, top:54 | Anton | 64px |
| "SWMS" overlay | left:211, top:98 (absolute) | Bangers | 150px |
| "YEAH, NAH." | left:109, top:316 | Bangers | 93px |
| Bullets | left:109, top:433 | DM Sans | 16px |
| "NO STUFFING AROUND!" | left:265, top:460, rotate:-22deg | Bangers | 29px |
| CTA buttons | left:116, top:539 | DM Sans | 16px |
| Trust signals | left:119, top:612 | DM Sans | 13px |
| Hero illustration | left:629, top:20, 811x785 | - | - |
| Bottom tagline | left:55, top:687 | DM Sans | 24px |

**Sections below hero:**
1. How It Works (cream bg) - 3 step cards
2. Features (dark bg + grain) - Voice Input + Photo Scan cards
3. Pricing (dark bg) - Single $7.99 + 3-Pack $19.99
4. Final CTA (yellow bg) - "Ready to ditch the paperwork?"
5. Footer (dark)

**Animation note:** Framer Motion animations set to `initial: { opacity: 1 }` to prevent hydration-related invisible content on Vercel. Animations are effectively disabled for reliability.

---

## Builder Flow (4 Steps)

### Step 1: Details (`/details`)
- Business name, ABN, contact name, phone, state selector
- Logo upload (base64, resized to 200x200)
- "Remember Me" checkbox (localStorage)
- Zod validation

### Step 2: Job Description (`/job`)
- Text input (min 10 chars) OR voice input (Web Speech API, en-AU)
- Photo upload for hazard detection (calls `/api/analyze-photo`)
- Optional fields: site address, principal contractor, job reference
- Detected hazards shown with checkboxes

### Step 3: Review (`/review`)
- Calls `/api/generate` with business details + job description
- Displays full SWMS preview: scope, HRCW, procedures, PPE, emergency
- Compliance score (color-coded: green 90+, yellow 70-89, red <70)
- Edit & Regenerate option

### Step 4: Checkout (`/checkout`)
- Single $7.99 or 3-Pack $19.99
- Stripe Hosted Checkout
- Token redemption for 3-pack holders
- Success page with PDF download link

---

## AI Engine (Claude Sonnet 5)

### Configuration
- Model: `claude-sonnet-5` (migrated Aug 2026 — `claude-sonnet-4-20250514` was retired from the API and returned 404s, which had silently broken generation in production)
- Max tokens: 12,000 (Sonnet 5 tokenizer produces ~30% more tokens than Sonnet 4)
- Thinking: explicitly disabled (Sonnet 5 defaults to adaptive thinking when omitted; disabled keeps latency down — generation runs ~85s)
- vercel.json maxDuration: generate 180s, analyze-photo 60s (was 30s — would have killed Sonnet 5 generations)
- Max retries: 1

### Prompt Architecture (4 layers)
1. **System prompt** - 20+ year WHS consultant persona
2. **State-specific legislation** - dynamic per user's state
3. **HRCW categories** - all 19 high-risk categories
4. **Output schema** - strict JSON (no markdown)

### Generated SWMS Structure
```typescript
SwmsData {
  document_purpose, scope_of_work
  hrcw_activities: string[]
  environmental_conditions, training_competency: string[]
  plant_equipment: { item, pre_use_checks }[]
  steps: ProcedureStep[] // hazards, initial/residual risk, controls
  ppe_requirements, emergency_procedures: string[]
  emergency_contacts: { role, contact }[]
  permit_requirements, legislation_references: string[]
  toolbox_talk: string
}
```

---

## Infrastructure

### Supabase (ap-northeast-1, Tokyo)
- Project ID: `htxxbhjtjmdvkjepymhr`
- Tables: `purchases`, `swms_documents`, `generation_tokens`

### Stripe
- **Test mode** (needs switching to live)
- Single price: `price_1TFA3FChXkArlJtENLpBnKCW`
- 3-Pack price: `price_1TFA3tChXkArlJtEcweEpl11`
- Webhook: `we_1TFVG7ChXkArlJtEQBO3zACq` -> `/api/webhooks/stripe`

### Vercel
- Custom function configs in `vercel.json`:
  - `/api/generate`: 30s timeout, 1024MB memory
  - `/api/analyze-photo`: 30s timeout, 1024MB memory
  - `/api/download/*`: 15s timeout, 1024MB memory

### SEO Pages (17 total)
- 6 state pages: NSW, VIC, QLD, WA, SA, TAS
- 11 trade pages: Electrician, Plumber, Builder, Roofer, Concreter, Painter, Welder, Demolition, Scaffolder, Excavation, Confined Space
- Pre-rendered at build time via `generateStaticParams()`

---

## Pencil.dev Design File

A Pencil design file exists (unsaved as "new") with:
1. **Landing Page - Final Design** (node `051eu`) - full page with hero, how-it-works, features, pricing, CTA, footer
2. **Earlier iterations** (nodes `uvYOY`, `OUNHi`, `47BiQ`) - previous light/dark versions

The hero illustration (`hero-tradie.png`) was generated externally in a caricature art style, background removed, and placed as a transparent PNG.

---

## What's Next (TODO) — Go-To-Market

**STRIPE IS LIVE (2026-08-08).** Checkout mints cs_live_ sessions on swmssorted.com.au. Details:
- Live products: Single SWMS $7.99 AUD (price_1U25rWEBJBKeDtNrZwcWXi5a, prod_V2ABk9PpdhVZbW), SWMS 3-Pack $19.99 AUD (price_1U25u6EBJBKeDtNrUdE6dzbv, prod_V2AEcDPbjCLeB3) — descriptions deliberately scrubbed of "AI-generated" (old test products violated no-AI-branding rule)
- Webhook destination "swms-sorted-production" (we_1U25yZEBJBKeDtNrLClMSYbg) -> https://swmssorted.com.au/api/webhooks/stripe, checkout.session.completed only, API version 2026-03-25.dahlia
- Env swap: price IDs + pk_live via CLI; sk_live + whsec pasted by user in Vercel dashboard (never through Claude)
- Statement descriptor: SWMSSORTED.COM.AU / short SWMSSORTED; expected volume "<$100k"; account acct_1TF2k1EBJBKeDtNr
- **Account "Review in progress" (2-3 days) + IDENTITY DOC task for Evren was PAST DUE (deadline Mar 26) — payouts PAUSED until his ID verifies; payments work meanwhile. Status of his upload unconfirmed — CHECK NEXT SESSION at dashboard Account status**

**LAUNCH CHAIN COMPLETE (2026-08-09).** DNS HOSTING MOVED TO VERCEL: Crazy Domains standard DNS cannot add TXT records (dropdown only offers A/AAAA/CNAME/ALIAS/MX/CAA — TXT is Premium-gated), so nameservers now ns1/ns2.vercel-dns.com; full zone managed via `vercel dns` CLI (site A records, Titan MX/SPF/DKIM replicated exactly, plus Google verification TXT, Resend DKIM/send-MX/send-SPF, DMARC p=none). Registrar push took ~1.5h after panel confirmation. KEY INSIGHT: Vercel NS mirror the currently-delegated public zone until delegation flips — new records "not serving" pre-flip is normal, don't debug it. Google Search Console: domain property auto-verified, sitemap submitted, 23 pages discovered. Resend: domain verified (Tokyo region), RESEND_FROM_EMAIL="SWMS Sorted <noreply@swmssorted.com.au>" in prod env + .env.local — buyer emails now from the brand domain, DKIM-signed, verified landing in inbox. Vercel Web Analytics enabled (free Hobby tier). User did identity doc upload, live purchase test x2 and refunds himself. Crazy Domains now ONLY does registration/renewal for this domain (DNS panel irrelevant).

**User-only steps remaining:**
1. Optional: defensive registration of swmssorted.au at Crazy Domains

**SEO OVERHAUL (Session 9, shipped):** 26 SEO pages (18 trades + 8 states — added carpenter/tiler/bricklayer/plasterer/landscaper/air-conditioning/waterproofing + NT/ACT). Content drafted by 6-agent workflow under style guide (Aussie voice, NO invented fine amounts in new content, no AI mentions, metaDescription <=155ch) + accuracy reviewer (caught 2 plumber HRCW misquotes, fixed pre-merge). Data lives in seo-pages-extra.ts (generated) merged into seo-pages.ts arrays at module load — sitemap/staticParams/related-links pick up automatically (sitemap now 32 URLs). Templates rebuilt paper/ink (seo-shell.tsx shared chrome: breadcrumb, FAQ accordion, related-links mesh, CTA band, sample-PDF link; killed ANOTHER old "SWMS Generator" brand header). JSON-LD: FAQPage+BreadcrumbList+Product per page, Organization in root layout. OG: public/og.png (PIL-generated 1200x630, regenerate via similar script) as site default + per-page og/canonical. Landing footer links all 26 pages. NOTE: generated titles had duplicate "| SWMS Sorted" suffix (layout template appends it) — stripped; watch for this with generated titles.

**GOOGLE ADS CAMPAIGN SUBMITTED (2026-08-09) — user clicked Submit, ads in Google review.** Google tag (gtag.js, AW-18379076001) installed in root layout via next/script + privacy policy section 7 updated (advertising conversion cookies disclosed, Google added to providers, date bumped) — deployed and verified firing on production (dataLayer shows config AW-18379076001). Page-visit conversion on /download/success needs only this global tag, no event snippet. Build details: New account 905-022-4699 (Evren's Google account, payments profile Evren Yilmaz / Mastercard ••5425 already on file from Google Play). Search campaign (NOT Performance Max), draft campaignId 281499089529799. Settings: goal=Purchases, conversion URL swmssorted.com.au/download/success (page-visit conversion — no code change needed); 17 phrase-match keywords ("swms template/generator/online", "buy swms", "safe work method statement template/generator", state variants nsw/vic/qld, 8 trade variants electrician/carpenter/plumber/roofing/concreting/demolition/scaffolding/excavation); Locations=Australia, Language=English; Networks = Google Search ONLY (Search Partners + Display both unchecked — shows "Google Search Network"); RSA: 14 headlines (SWMS Sorted / Compliant SWMS In 60 Seconds / Site-Ready SWMS From $7.99 / No Sign-Up No Subscription / Edit Every Step Before You Pay / Digital Crew Sign-On Included / All 8 States & Territories / Sorted Before Smoko / etc.) + 4 descriptions, Ad strength Average, no AI mentions; bid strategy Maximize Conversions (no tCPA — correct for zero-history account); budget CUSTOM A$15/day (~A$465/mo max; Google pushed A$80.94 — declined); account timezone fixed Perth→Sydney (unchangeable later!). GOTCHAS hit: wizard auto-applied ~20 broad-match junk keywords ("fall protection", "roof work") into the keyword box — caught and stripped; prefill description "No signup, no BS" replaced (ad-policy risk); wrong US phone (206) 941-2595 was pre-linked — unlinked. USER'S FINAL STEP: billing page — answer strategist-call No, email tips (their choice), EU political ads No, then Submit (A$20 temp card auth, ads enter review). After launch: link Search Console, watch Search terms weekly, add negatives ("free", "course", "training"). 2026-08-11 STATUS CHECK: campaign LIVE, "Bid strategy learning", spent A$1.34 / 7 impressions / 1 click since Aug 9 (delivery ramping, budget nowhere near cap). CRITICAL BUG FOUND+FIXED: the signup wizard created the Purchase conversion with a DOUBLED-domain page rule (swmssorted.com.au/swmssorted.com.au/download/success — could never fire; goal showed "Misconfigured"/Inactive, bidding was blind). Fixed to swmssorted.com.au/download/success; default conversion value set A$7.99. LESSON: audit wizard-created conversion actions — the URL field expects a PATH, wizard pastes full URL into it. OUTSTANDING (user): "Complete advertiser verification" notice in Ads UI — Google identity verification, ads can be paused if ignored.

**DELIVERY DIAGNOSIS + FIX (2026-08-11).** User asked why ads don't appear when googling "swms". Two root causes found in keyword data:
(1) **"swms" was never a keyword.** All 19 keywords were phrase-match multi-word phrases. Phrase match only triggers on queries equal to or MORE specific than the keyword — a one-word "swms" is BROADER than "swms template", so it could never match. Rule of thumb: always include the head term as its own keyword.
(2) **Near-zero delivery on every commercial keyword.** 3-day totals: "swms sorted" (brand) = 10 impr / 1 click / A$1.34; ALL 18 other keywords = 0 impressions, status "Eligible". Not an approval issue (brand keyword served fine) — it was Maximise Conversions bidding with zero conversion data, compounded by the broken conversion action (doubled-domain rule) for the campaign's whole life. Google's own settings panel confirmed the throttle: "Your budget is A$15.00 and your current daily spend is A$0.67."
FIXES APPLIED: bid strategy Maximise conversions → **Maximise clicks with A$2.50 max CPC cap** (budget unchanged A$15/day; standard new-account playbook — switch back to conversion bidding once ~15-30 conversions/mo exist); added 10 head keywords (phrase): "swms", "safe work method statement", "swms document", "swms nsw/vic/qld", "create swms", "swms example", "swms for construction", "swms builder"; added 11 campaign negatives: free, course, courses, training, jobs, salary, meaning, definition, white card, tafe, certificate iv. NOTE: campaign Networks now reads "Google Search Network, Search partners" — Search partners re-enabled at some point despite being unchecked at setup; left ON deliberately since reach is the current bottleneck (Display remains OFF). ALSO: tell user not to Google their own ads — burns impressions with no clicks, drags CTR down; use Tools → Ad Preview & Diagnosis instead.

**SCROLL-BUILD SECTION (2026-08-11, shipped).** `src/components/scroll-build.tsx` — pinned scroll-scrubbed sequence on the landing page (inserted after the trade ticker, before the LIVE DEMO). Four acts driven off one scroll-progress value: job text types itself → method rows land one at a time with live step/hazard counters → HRCW banner reveals → artifact grows a navy PDF letterhead and two pages fan out → CTA. DELIBERATE CHOICE: built in DOM, not video/images — a scroll-scrubbed video is 5–15MB and must fully download before it can scrub, which is hostile to the actual audience (52% mobile / 39% Android, often on site). Zero added bytes, stays crisp at any DPR. Implementation notes: imperative rAF paint writing straight to refs (React state on scroll = jank); markup renders the FINISHED state so it survives JS-off, animation takes over on mount; `fitToViewport()` measures the finished height (temporarily forcing final styles, then restoring) and scales the stage to fit, subtracting the sticky nav's height — nav is tagged `data-sticky-nav` in page.tsx for this. Responsive rules: <620px gets 4 steps + tighter type + numbers-only HUD (not a shrunken 6); <700px tall OR prefers-reduced-motion falls back to a static finished document (no pinning). Test hooks `data-swms-row/-steps/-haz` exist for Playwright checks — verification script at scratchpad demo-video/verify-scroll.js. GOTCHAS HIT: (1) the caret's `swBlink` keyframes own `opacity`, so an inline opacity=0 was ignored — toggle `display` instead; (2) fanned pages drifting upward collided with the h2 — fan right/down only; (3) Browser-pane verification is useless while the pane is hidden (`document.hidden` → rAF never fires, reads go stale) — use Playwright for anything rAF-driven; (4) site sets `html{scroll-behavior:smooth}`, so programmatic scroll jumps animate and race your reads.

**Remaining code/product work:**
5. Remove `/api/stripe-test` debug route before real launch
6. Marketing: Google Ads BUILT (see above — user must Submit); FB groups for tradies still open
7. Restyle sign/documents DONE; redeem page still old Tailwind design (brand text fixed, styling pre-redesign)
8. Post-purchase letterhead editing: the stored sign-off document is frozen at purchase; adding a forgotten logo later doesn't reach signed re-downloads (review finding, deferred)
9. Consider expanding to full tradie business platform (invoicing, quoting, OH&S, financial)

**TRUST PACK + STEP EDITING (Session 9, shipped):** public/sample-swms.pdf — real watermarked 5-page roofing SWMS (Harbour City Roofing, matches hero example; regenerate with scratchpad gen-sample.js). Landing: READ A FULL SAMPLE button in what-you-get + refund promise strip under pricing. Review page: ✎ EDIT per step card — inline editing of activity/hazards/controls/responsible (one per line, [TAG] prefixes preserved as hierarchy markers, empty lists fall back to competent-person placeholders). Closes the editable-Word-template gap. Remaining trust items: ABN in footer (need user's ABN), testimonials, Resend domain verification, Search Console.

**OWNER KEY + SIGN-ON REGISTER MANAGEMENT (Session 9, shipped):** owner_key = HMAC-SHA256(SUPABASE_SERVICE_ROLE_KEY, "swms-owner:"+CODE).hex.slice(0,16) — stateless, no schema change (src/lib/utils/owner-key.ts). Issued in /api/sign/create response + buyer's document email (?key=), stored client-side as swms_ownerkey_<code>; the documents page strips ?key= from the URL after storing. POST /api/sign/remove (timing-safe key check, session-scoped delete). Crew sign links never carry the key so workers can't un-sign themselves. /documents/[code] AND /sign/[code] rebuilt in paper/ink design (was old rounded Tailwind); redeem page + 17 SEO pages still old-styled. User cleaned his 7 test signatures off BK7YGZK5 himself with the owner link (1 remains). Evren's owner link for MMSA doc: /documents/BK7YGZK5?key=8b0da7af2fd49de3

**POST-PURCHASE DOCUMENT LINK (Session 9, shipped):** sign-off session now created BEFORE Stripe payment (checkout page), sign_code rides in Stripe metadata, webhook emails single buyers "Your SWMS is ready — save this link" (send-document-email.ts) with the /documents/[code] link — closing the tab no longer loses the document. Both Done screens show an OPEN YOUR DOCUMENT PAGE button; success page initialises the sign-off on payment verification. Email currently sends from onboarding@resend.dev fallback — verify swmssorted.com.au in the user's Resend account, add their DNS records at Crazy Domains, then set RESEND_FROM_EMAIL. Webhook E2E testable locally: craft checkout.session.completed + HMAC with whsec from .env.local (RESEND_API_KEY now in .env.local too, pulled from prod)

**LETTERHEAD FEATURE (Session 9, shipped):** optional card on 03 PREVIEW — logo upload (canvas-downscaled to 240px PNG data URI), ABN, responsible person (contact_name), phone, principal contractor, job ref. Live-updates the A4 mock (logo next to title, ABN under PCBU). Flows through pdfPayload -> all PDF paths. Company identity survives reset() (repeat customers) and persists cross-session via useRememberMeStore (localStorage — matches privacy policy claim; store was dead code before). Adversarial review workflow (17 agents) caught pre-ship: job_reference missing from pdfPayload, silent HEIC logo failures (now error message), logo pick race (sequence guard), literal LOGO placeholder box on paid PDFs (removed), reset() wiping letterhead, and Instant SWMS brand leftovers on redeem page + 3-pack email (rebrand missed them)

**Done:** ABN registered; swmssorted.com.au bought + DNS -> Vercel + SSL live; NEXT_PUBLIC_SITE_URL flipped; www + legacy-host redirects; robots.txt + sitemap.xml; support@ email live on Titan; STRIPE LIVE; GitHub repo (Evrenyilmaz101/swms-generator); legal pages; Vercel Analytics component

---

## Session History

### Session 7 (Aug 2, 2026) — Full "site document" redesign + model migration
- User redesigned the site in Claude Design; handoff bundle at `../SWMS Generator Site Redesign.zip` (README + 2 HTML prototypes = the design spec)
- New aesthetic: industrial "site document" — paper `#F4F1E9`, ink `#1A1917`, hi-vis `--swa #F2DE1B`, safety orange `#C7480F`, hazard stripes, 2px ink borders, hard offset shadows, no border-radius; fonts Barlow Condensed / Barlow / IBM Plex Mono (via layout.tsx link tag)
- Design system lives in globals.css: `.sw-btn`, `.sw-btn-sm`, `.sw-btn-ink`, `.sw-ghost`, `.sw-chip-ghost`, `.sw-link`, `.sw-link-paper`, `sw*` keyframes, `.sw-ready` gating (rAF-armed hero animations), `.sw-marquee`
- Landing page (page.tsx) rebuilt: nav w/ scroll-progress stripe, hero w/ A4 doc mock + stamps, trade ticker, live demo table (4 trades, IO-triggered typing), how-it-works, voice+photo, what-you-get, compliance (ink), pricing, FAQ (details), final CTA, footer
- Builder rebuilt as 01 DESCRIBE (/job: TYPE/TALK/PHOTO tabs, inline Web Speech + photo scan, state chips, optional company/site) → 02 REVIEW (/review: ink generating overlay, tickable step cards, add-step form) → 03 PREVIEW (/preview: NEW ROUTE, HTML A4 page-1 render + blurred thumbs rail) → 04 DOWNLOAD (/checkout: plan cards + Stripe hosted checkout; token branch; DONE screen)
- /details now redirects to /job (company/site folded into step 1; ABN/contact/phone/logo NO LONGER COLLECTED — PDF renders those fields empty); redeem flow pushes /job
- Store: added `excludedSteps` (review unticks; filtered out of preview + PDF via src/lib/utils/builder-doc.ts) and `docNo` (stable SWMS-DDMM-NNN); BuilderStep type now job|review|preview|checkout; builder layout derives step from pathname
- /download/success + legal pages restyled to paper/ink
- **CRITICAL FIX: `claude-sonnet-4-20250514` was RETIRED from the Anthropic API (404)** — production generation had been silently broken. Migrated to `claude-sonnet-5`, thinking explicitly disabled, max_tokens 12000 (new tokenizer +30%), vercel.json maxDuration generate 180s / analyze-photo 60s. Generation now takes ~85s (was ~20s) — overlay copy paced accordingly
- Rate limit reminder: /api/generate is 5/hour/IP — careful when testing (limiter is in-memory; dev server restart resets it)
- Fixed hydration race: builder guards now go through `whenHydrated()` (builder-doc.ts) — mount effects previously read pre-hydration store defaults on hard reloads and wrongly redirected to /job
- Scrubbed "AI" from all user-facing SEO copy (seo-pages.ts, seo-trade/state-page.tsx) + generation error message, per no-AI-branding rule
- Windows note: NEVER edit source files via PowerShell Get-Content/Set-Content — PS 5.1 misreads UTF-8 as ANSI and mojibakes em-dashes; use the Edit tool or Node

### Session 8 (Aug 5, 2026) — Voice fix, PDF layout fixes, durable documents
- Voice input dedup: finalized-segments-only accumulation with cumulative-resend guards (browsers re-send interim/final chunks; Android sends whole utterance repeatedly)
- PDF page-break fixes: job-steps table header glued to first row w/ row-level borders (no phantom boxes from bordered card splitting); minPresenceAhead={70} on all sectionCards (no orphaned headers); bullets wrap={false}; blank sign-off block unbreakable (wrap only when digital signatures present)
- DURABLE DOCUMENTS: /api/sign/create now accepts a `document` payload, stored in swms_documents.generated_content (purchase_id null) and linked via sign-off session document_id; /api/sign/download falls back to the stored payload when the client sends only {code} — signed re-downloads now work from ANY device. Documents hub tries server-first, browser-storage fallback for legacy codes. Verified end-to-end against live Supabase (code-only download returned real PDF)
- No schema changes were needed — reused existing swms_documents table
- PWA: app/manifest.ts + public/sw.js (GET-only network-first SW; never touches POST/builder/payments) + PwaRegister in root layout + hazard-stripe icons in public/. Installable to home screen
- TOOLBOX TALK MODE: /documents/[code]/talk (paper/ink, big type) reads GET /api/sign/talk?code= (serves talk + steps + hazards + PPE from the stored document; SW-cacheable → works offline). Hub has yellow "Run toolbox talk & crew sign-on" button
- Pass-the-phone: /sign/[code] success screen has "PASS THE PHONE — NEXT WORKER SIGNS" reset button
- Offline PDFs: hub saves downloaded PDF blob to Cache Storage under /offline-pdf/<code>; "Open saved copy (works offline)" button; SW serves /offline-pdf/* cache-only
- Marketing hook: "Run your toolbox talk and get the crew signed on before smoko — even with no reception"

### Session 9 (Aug 8, 2026) — PDF crossover polish + naming crisis
- PDF page-flow finalised: tall job-step rows (estimateRowHeight heuristic, threshold 220pt) are breakable and flow across pages; short rows stay atomic. Blank tails went from 25-40% per page to 1-2%
- CRITICAL react-pdf lesson: `minPresenceAhead` forbids page breaks within N pts AFTER the element — putting it on a BREAKABLE element forbids its own split and shoves it whole to the next page (the blank-tail bug). Only put it on unbreakable headers. Also: a trailing marginBottom on the last element can spawn a completely blank final page
- NAMING CRISIS: instantswms.com.au is a LIVE COMPETITOR (waterproofing SWMS templates, $99) — current "Instant SWMS" branding is a passing-off risk and MUST change. swmsgenerator.com.au is ALSO a live competitor ($29). Available candidates verified via DoH: swmssorted.com.au (recommended — matches hero copy), swmsonthespot.com.au, swmsmate.com.au, donebysmoko.com.au (possible future platform brand)
- **DECIDED: "SWMS Sorted" / swmssorted.com.au** ($11.99 first yr at Crazy Domains; advised also grabbing swmssorted.au, skipping .com and all upsells). FULL REBRAND DEPLOYED same session: 22 files — site chrome, hero (unchanged, now doubles as brand line), legal pages, SEO titles, PDF footer + creator metadata, manifest, support@swmssorted.com.au. Verified zero old-brand traces in DOM and rendered PDF
- Once DNS is live: set NEXT_PUBLIC_SITE_URL=https://swmssorted.com.au in Vercel + redeploy; update Stripe webhook URL when creating live endpoint; set up email forwarding for support@swmssorted.com.au at the registrar or via an email service
- **DOMAIN LIVE (later same session): https://swmssorted.com.au is the production site.** User bought the domain at Crazy Domains (Active, expires 08 Aug 2027, auto-renew ON to card ****5425). Setup performed on user's authorization: `vercel domains add` for apex + www; edited Crazy Domains parking A records (both -> 76.76.21.21, TTL 300) via their DNS panel (form_input rejected — use triple_click + type keystrokes); propagation took ~15 min after panel showed Active; Vercel issued SSL automatically
- NEXT_PUBLIC_SITE_URL flipped to https://swmssorted.com.au in Vercel production env (+ .env.local synced) and redeployed. Verified live: apex 200 on Vercel edge, correct title, Stripe checkout session creates fine (test mode)
- Host-based 308 redirects added in next.config.ts: www.swmssorted.com.au -> apex, and legacy swms-generator.vercel.app -> apex (preview URLs unaffected). http->https is automatic via Vercel
- NEW: app/robots.ts + app/sitemap.ts (they didn't exist — /robots.txt was 404ing). Sitemap = 23 URLs (landing, pricing, faq, 3 legal, 17 SEO pages) on the new domain; robots disallows /api/, /documents/, /sign/, /download/, /redeem, and the 4 builder routes
- PDF round 3 (user's live purchase SWMS-0808-554 exposed it): page style had paddingTop 0 (for the full-bleed page-1 banner) so every CONTINUATION page started content at the literal paper edge. Fix: page paddingTop 24 + pageHeader marginTop -24 (banner stays full-bleed). Also rows could start as a one-line sliver at a page bottom — fix: minPresenceAhead={36} on ALL StepRows (small value only forbids a break in the row's first 36pt = no slivers; a LARGE value would re-create the blank-tail bug). Verified locally and on production via /api/download/preview + PyMuPDF page renders
- SIGN-OFF SESSION REUSE BUG (user report: signatures not on document): checkout Done screen + /download/success created a NEW sign-off session on every page load (the only guard was React state) — user's 7 signatures sat under their FIRST code (BK7YGZK5) while the UI kept showing fresh empty codes. Fix: sign_code cached in localStorage as swms_signcode_<docNo/document_reference>, revalidated via GET /api/sign/validate before reuse, only then create. The signature->PDF pipeline itself was always fine (verified: BK7YGZK5 renders all 7 signature rows + QR)
- TRAP: `echo x | vercel env add` stores a TRAILING NEWLINE in the env var (my domain flip did this to NEXT_PUBLIC_SITE_URL — corrupted sign_url and QR payloads; checkout survived only because it trims). Use `printf`. All server-side NEXT_PUBLIC_SITE_URL reads now .trim() defensively
- Debug notes: Supabase REST queryable directly with service key from .env.local (swms_sign_off_sessions, swms_signatures tables); local dev hits the same DB so prod bugs repro locally with real codes; PyMuPDF (python fitz) renders PDF pages to PNGs for layout checks; hand-built minimal SWMS payloads CRASH the renderer if hrcw_activities are numbers (components call .match/.toLowerCase on them) — copy gen-crossover.js shapes instead
- **SUPPORT EMAIL LIVE: support@swmssorted.com.au on Titan Email** (Professional Plan, 1 account, 10 GB). User bought it at Crazy Domains — $93.06 AUD/yr incl. GST (order #62843615, Mastercard ****5425, auto-renew ON, expires 08 Aug 2027). NOTE: their "from $6.45/yr" card price is misleading — real minimum is ~$93/yr, and there is NO monthly billing (1/2/3-year terms only). Order sat in "Pending (Fraud)" random security review ~30 min before activating
- Mailbox created via Manage Emails panel (user typed the password; recovery email bestjobsaddy@gmail.com gets the login details). Webmail via "Access webmail" button or titan.email apps
- DNS auto-configured by Crazy Domains and verified on authoritative NS: MX mx1/mx2.titan.email (10/20), SPF TXT `v=spf1 include:spf.titan.email ~all`, DKIM selector titan1._domainkey — and the A records to Vercel untouched. Inbound delivery confirmed (Gmail -> Titan webmail). Crazy Domains panel quirks: form_input rejected, layout shifts mid-fill — use read-then-coordinate typing carefully

### Session 6b (Aug 2, 2026) — Landing page polish pass
- CSS-only motion system in globals.css: `slam`/`rise` entrance animations with stagger delays (`d-1`..`d-7`), `float-bob` hero image, `wiggle`, `marquee-track` trades ticker, `pulse-ring` mic, `blink-dot` hazards, `lift-card` hovers, `sticker` badge, `nudge-x` CTA arrow, `hazard-tape` divider strips, yellow ::selection
- Animations gated behind `.anim-ready` class set via requestAnimationFrame in page.tsx — content is opacity:1 by default, so a hydration/render stall can never leave the page invisible (the old Framer Motion failure mode)
- New sections: trades marquee strip (Bangers, yellow on black) below hero; hazard-tape dividers before Features and CTA sections
- prefers-reduced-motion disables everything
- Deployed to production

### Session 6 (July 27, 2026) — Go-to-market prep
- User's PR (permanent residency) came through — unblocks ABN -> .com.au domain -> Stripe live
- Built legal pages required for Stripe live approval: `/terms`, `/privacy`, `/refunds` under `src/app/(legal)/` with shared layout + `.legal-prose` styles in globals.css
- Footer placeholder `#` links replaced with real Privacy/Terms/Refunds links
- Added `@vercel/analytics` (`<Analytics />` in root layout) — still needs enabling in Vercel dashboard
- Committed, pushed to GitHub, deployed to production; legal pages verified live
- Note: dev server 404s on new routes if `.next` is stale from a prod build — delete `.next` and restart

### Session 1-2 (March 2026)
- Built complete MVP: Next.js foundation, AI engine, PDF generation, builder UI, Stripe integration, Supabase backend, SEO pages

### Session 3 (March 27, 2026)
- Deployed to production at swms-generator.vercel.app
- All 7 phases complete and verified

### Session 4 (April 4, 2026)
- Connected Pencil.dev MCP for design workflow
- Designed new landing page in Pencil: dark+yellow palette, cartoon tradie illustration, mixed typography (Anton + Bangers)
- User created custom hero illustration (caricature tradie with Aussie flag, transparent PNG)
- Rebuilt landing page code to match Pencil design pixel-for-pixel
- Fixed Google Fonts loading (moved from CSS @import to HTML <link> tags - Tailwind v4 incompatibility)
- Fixed Framer Motion hydration issue (animations stuck at opacity:0 on Vercel)
- Deployed updated landing page to production

### Session 5 (April 5-6, 2026)
- **SWMS Document Research:** Comprehensive layout research across Safe Work Australia + all state regulators + commercial providers. Documented in SWMS_LAYOUT_RESEARCH.md
- **SWMS PDF Redesign (Pencil mockup):** Designed new 4-page A4 portrait SWMS document with all 16 industry-standard sections:
  - Page 1: Navy header + PCBU/Project details + HRCW checklist (18 categories) + Scope of work + Training table
  - Page 2: PPE icons (10 items, required/optional) + Plant & Equipment table + 5×5 Risk Matrix + Hierarchy of Controls pyramid
  - Page 3: Job Steps Risk Assessment Table with 7 columns (# | Step | Hazard | Initial Risk | Controls | Residual Risk | Responsible) — 6 example steps with color-coded risk pills
  - Page 4: Emergency procedures + contacts (000 red) + Communication/Consultation + Legislation (7 NSW refs) + SWMS Review triggers + Worker Sign-off table (6 rows)
  - Branding: Tradie's logo + company name dominant. Our branding = tiny footer "Generated via swmsgenerator.com.au"
- **Landing Page Explainer Sections:** Designed illustrative "How It Works" (3 cards with cartoon illustrations) and "Features" (Voice Input + Photo Scan cards with cartoons) in Pencil
- **Builder UI Complete Redesign:** Reimagined all 4 builder screens from dark/cramped to light/premium/modern:
  - New builder layout: off-white (#FAFAF9) background, minimal step indicator ("Step X of 4" + thin progress bar), clean nav
  - /details: "Who's doing this job?" — logo upload, clean form card, remember-me checkbox
  - /job: "What's the job?" — conversational input card with inline voice/photo buttons, character count
  - /review: "Give us a sec." loading state with 6 progress steps + live doc preview panel, then "Looks good?" SWMS preview with compliance score + sticky CTA
  - /checkout: Document thumbnail preview + pricing radio cards (Single $7.99 / 3-Pack $19.99 with SAVE badge) + "Pay & download PDF" button + trust signals
  - Voice Input component: compact inline button (was full-width card)
  - Photo Upload component: compact inline button (was full-width card)
- All 4 screens deployed live to production
- **PDF Template Rebuild:** Completely rebuilt all PDF components to match Pencil design:
  - New color scheme: navy (#0E2A4D), orange (#E87722), standard risk colors
  - Navy header bar with company logo + name + SWMS doc number on every page
  - Title bar: "SAFE WORK METHOD STATEMENT — HIGH RISK CONSTRUCTION WORK"
  - Two-column PCBU + Project details block
  - All sections in card format (navy header strip + body)
  - Emergency section with red header
  - Worker sign-off table: 5 columns (Name, Role/Trade, Licence No., Signature, Date) + 6 rows
  - Footer: Company + ABN + SWMS ID | Page X of Y | "Generated via swmsgenerator.com.au"
- **Watermarked PDF Preview:** Checkout page now shows full readable PDF in iframe with "PREVIEW — NOT FOR SITE USE" watermark. After payment, clean PDF downloaded without watermark.
- **Digital Sign-Off Feature (QR Code):** Built end-to-end digital worker sign-off system:
  - Database: `swms_sign_off_sessions` + `swms_signatures` tables in Supabase
  - API routes: `/api/sign/create`, `/api/sign/validate`, `/api/sign/submit`, `/api/sign/status`
  - Public sign-off page: `/sign/[code]` — mobile-first, canvas signature pad, worker name/role/licence input
  - Sign-off link appears after download on both `/download/success` (Stripe flow) and checkout page (token flow)
  - Share buttons: Copy link, Text, WhatsApp, Email
  - Sign codes: 8-char alphanumeric, 12-month expiry
  - DB queries: `src/lib/supabase/sign-offs.ts`
  - Signatures wired into PDF: digital signatures render as green rows with drawn signature images + "SIGNED" badge + 4 blank rows for hardcopy
  - QR code in PDF signature block pointing to sign-off URL
  - `/api/sign/download` endpoint generates PDF with collected signatures embedded
  - `/documents/[code]` page: tradie's SWMS hub with live signature tracking, share buttons, re-download with signatures
  - SWMS data stored in localStorage keyed by sign-off code for re-download across sessions
- **Builder Flow Flipped (Value-First):**
  - OLD: Details → Job → Review → Checkout
  - NEW: Job (Step 1) → Review (Step 2) → Details (Step 3) → Checkout (Step 4)
  - Job page now includes state selector (chip buttons)
  - All CTAs across site updated: "Get Started" → /job
  - Zustand store default step changed to "job"
  - Guards updated to redirect to /job instead of /details
