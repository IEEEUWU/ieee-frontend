# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Status

Preview, and honest about it. The page renders in a full state, but the dated events register and the committee roster are seeded with sample records the branch has not supplied. A single switch, `SAMPLE_DATA` in `lib/sample.ts`, makes every affected section render a visible notice, so a build carrying placeholders cannot be mistaken for a published one. Six facts are formally outstanding and are named on the page itself.

## Users

Primary users are undergraduate engineering, computing, and technology students at the University of Uva Wellassa (UWU), Badulla, Sri Lanka. They visit the site to discover technical student chapters, find upcoming workshops and hackathons, and learn how to join organizing committees to build hands-on engineering and leadership experience. Secondary audiences include faculty, prospective university entrants, and IEEE Sri Lanka Section leadership tracking branch activities.

## Product Purpose

Serve as the digital flagship and discovery hub for the IEEE UWU Student Branch, empowering students to navigate five technical societies, participate in public engineering events, and seamlessly find pathways into active community leadership.

## Positioning

The student-led nexus for cutting-edge technology and engineering collaboration at Uva Wellassa University, uniting five distinct disciplinary societies under one recognized global IEEE banner with transparent, accessible participation.

## Operating Context

Students browse from campus Wi-Fi and mobile devices on mobile browsers as well as desktop screens in university computer labs and laptops. Navigation must be instantaneous, legible under varying lighting conditions, and provide friction-free access to society initiatives, event schedules, and committee opportunities without requiring user logins.

## Capabilities and Constraints

- **Stack:** Next.js 16.3.8 (App Router, Turbopack), React 19.2.8, Tailwind CSS v4 (CSS-first `@theme`), Motion for React 14, TypeScript 5, running on Node.js ≥ 20.9. No test suite; `npm run lint` and `npm run build` are the quality gate.
- **Scope:** A single landing page, composed as a server component in `app/page.tsx`. Section order is the reader's journey and is not rearranged for variety: Hero (attention) → Marquee (curiosity) → Mission (understanding) → Societies (exploration) → Explorer (exploration, one society in depth) → Impact (proof) → Events (proof) → Team (proof) → BranchRecord (trust) → Join (action) → Footer (recall).
- **Constraints:**
  - Public events repository returns only published, verified records; empty states must be designed and authentic (no fake/invented events or dates).
  - Unregistered or pending information (e.g. board portraits, custom society marks, official social links) must remain transparently acknowledged rather than fabricated.
  - All published figures are counted from source records at module scope, never typed by hand, so a number cannot drift from the record behind it.

## Brand Commitments

- **Guidelines:** Strict compliance with IEEE Sri Lanka Section Brand Identity Guidelines v1.0 (10 June 2026).
- **Core Palette:** IEEE Blue (`#00629B`), Black (`#000000`), and White (`#FFFFFF`). Derived tints exposed as tokens in `app/globals.css`: `--color-primary-deep` (`#005282`), `--color-primary-lift` (`#1A86C4`), `--color-secondary` (`#EBF2F7`), and achromatic grays (`#4A4A4A`, `#6E6E6E`, `#D9D9D9`, `#EBEBEB`, `#F5F5F5`). No off-palette neon or random hues.
- **Ink:** Pure `#000000` is not used as text. Ink is `#111111` — visually identical as black, measurably softer on a bright field, kinder in dark rooms and on OLED panels.
- **Two sanctioned colour exceptions**, both meaning-bearing rather than decorative: each society's own established IEEE hue, restricted to self-identifying marks and split into `brand` for fills and `ink` for anything read as type; and photography duotoned into the brand hue so no frame introduces a colour the palette does not already contain.
- **Official Artwork:** Official branch lockup `public/brand/uwu-sb-logo.png` (8567 × 1313 transparent RGBA) preserved unmanipulated at native proportions, never distorted, rotated, or boxed. Where it cannot stay legible at the size a layout demands, the layout gives way to the wordmark instead of the mark.
- **Typography:** Two families, two jobs. **Archivo** carries all prose and all display (weights 400–800). **IBM Plex Mono** carries the technical register only — charter codes, dates, register labels, instrument values — so that "this is data" is legible before the sentence is read. Both subset to Latin and served from the build via `next/font`. No decorative or handwritten fonts. (An earlier Open Sans direction was superseded; the shipped system is Archivo plus IBM Plex Mono.)
- **Shape and Spacing:** Radius `0` throughout — this is a technical document, not a set of floating cards. Elevation is expressed with 1px rules, never shadows. A 4px base grid, with section rhythm 64 / 96 / 128.
- **Ground Control:** White canvas with intentional IEEE Blue focal ground for high-impact engagement sections. The Join block is the page's single inversion; one inversion is a decision, five would be a colour scheme.

## Evidence on Hand

- Official branch lockup: `public/brand/uwu-sb-logo.png`
- Five confirmed societies: Student Branch (SB), Industrial Automation Society (IAS), Computer Society (CS), Robotics and Automation Society (RAS), Women in Engineering (WIE) (`lib/units.ts`)
- Section co-branding profiles and parent addresses in Colombo Trace Expert City (`lib/site.ts`)
- Undated programme structure: society sessions, committee meetings, and Section programmes (`lib/events.ts`), which are constitutional facts rather than dated claims
- Committee structure: three branch-wide offices plus one officer seat per chartered society (`lib/team.ts`)
- Eight duotone frames with recorded licences and alt text (`lib/photos.ts`); no images of identifiable people
- Pending register: named in code as `awaitingFacts` (`lib/record.ts`) and per-society `pending` (`lib/units.ts`), rendered as designed states rather than omitted

## Product Principles

1. **Absolute Authenticity:** Never fabricate placeholder events, artificial testimonials, or simulated statistics. What is published is genuine; what is pending is stated with architectural dignity.
2. **Dynamic Clarity over Monotony:** Break the generic card rut. Let typography, architectural grid rhythms, high-contrast framing, and purposeful micro-interactions deliver energy without violating brand rigor.
3. **Impeccable Hierarchy:** Establish an undeniable reading order: instant identity verification, direct exploration of the 5 technical societies, immediate event discovery, and clear pathways to act.
4. **Performance & Access:** Zero bloat, instant interactive responses, WCAG AA compliance, and fluid responsiveness from small mobile viewports to wide displays.

## Accessibility & Inclusion

Full WCAG 2.1 AA conformance: contrast ratios ≥ 4.5:1 for body copy and ≥ 3:1 for large display text, visible focus indicators, skip-to-content links, semantic HTML5 landmarks, and respect for `prefers-reduced-motion`.

In practice this is enforced rather than audited at the end:

- Every animation is gated behind `prefers-reduced-motion: no-preference`, and the reduced-motion resting state is the finished composition, so nothing is lost but the movement. Scroll snapping is withdrawn with it, since snap is a change in scroll behaviour rather than decoration.
- Each society `ink` colour clears 4.5:1 on both white and the surface tone. The true IEEE CS orange is 3.05:1 and is therefore barred from anything read as type.
- Interactive surfaces follow established patterns — the explorer implements the WAI-ARIA tabs contract (one tab stop, arrow keys, Home/End), and horizontal rails are real scrollers with edge fades rather than drag-only surfaces.
- Layout is tested at small mobile viewports, wide displays, and short landscape windows, since a phone turned sideways cannot fit a display headline, a supporting line, a call to action and a photograph at once.
