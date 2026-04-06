# Instant SWMS - Project Knowledge File
> **Last Updated:** 2026-04-04 | **Status:** LIVE IN PRODUCTION
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

## AI Engine (Claude Sonnet 4)

### Configuration
- Model: `claude-sonnet-4-20250514`
- Max tokens: 8,192
- Max retries: 1
- Temperature: default

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

## What's Next (TODO)

1. Set up custom domain (`swmsgenerator.com.au` - needs ABN for .com.au)
2. Switch Stripe from test to live mode
3. Set up GitHub repo for CI/CD
4. Add Google Analytics / PostHog tracking
5. Test full payment flow end-to-end
6. Mobile responsive polish on the new hero section (currently absolute-positioned for desktop)
7. Consider expanding to full tradie business platform (invoicing, quoting, OH&S, financial)

---

## Session History

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
