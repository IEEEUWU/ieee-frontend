# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are undergraduate engineering, computing, and technology students at the University of Uva Wellassa (UWU), Badulla, Sri Lanka. They visit the site to discover technical student chapters, find upcoming workshops and hackathons, and learn how to join organizing committees to build hands-on engineering and leadership experience. Secondary audiences include faculty, prospective university entrants, and IEEE Sri Lanka Section leadership tracking branch activities.

## Product Purpose

Serve as the digital flagship and discovery hub for the IEEE UWU Student Branch, empowering students to navigate five technical societies, participate in public engineering events, and seamlessly find pathways into active community leadership.

## Positioning

The student-led nexus for cutting-edge technology and engineering collaboration at Uva Wellassa University, uniting five distinct disciplinary societies under one recognized global IEEE banner with transparent, accessible participation.

## Operating Context

Students browse from campus Wi-Fi and mobile devices on mobile browsers as well as desktop screens in university computer labs and laptops. Navigation must be instantaneous, legible under varying lighting conditions, and provide friction-free access to society initiatives, event schedules, and committee opportunities without requiring user logins.

## Capabilities and Constraints

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.
- **Scope:** Landing page surface (`app/page.tsx`), orchestrating navigation, hero stage, upcoming events discovery, 5-society interactive explorer, factual about register, action pathways, and institutional footer.
- **Constraints:**
  - Public events repository returns only published, verified records; empty states must be designed and authentic (no fake/invented events or dates).
  - Unregistered or pending information (e.g. board portraits, custom society marks, official social links) must remain transparently acknowledged rather than fabricated.

## Brand Commitments

- **Guidelines:** Strict compliance with IEEE Sri Lanka Section Brand Identity Guidelines v1.0 (10 June 2026).
- **Core Palette:** IEEE Blue (`#00629B`), Black (`#000000`), and White (`#FFFFFF`). Derived tints: `--color-accent-deep` (`#005282`), `--color-accent-wash` (`#EBF2F7`), and achromatic grays (`#4A4A4A`, `#6E6E6E`, `#D9D9D9`, `#EBEBEB`, `#F5F5F5`). No off-palette neon or random hues.
- **Official Artwork:** Official branch lockup `public/brand/uwu-sb-logo.png` (8567 × 1313 transparent RGBA) preserved unmanipulated at native proportions, never distorted, rotated, or boxed.
- **Typography:** Open Sans across licensed digital weights (300 to 800), with tabular figures for dates/numbers. No decorative or handwritten fonts.
- **Ground Control:** White canvas with intentional IEEE Blue focal ground for high-impact engagement sections.

## Evidence on Hand

- Official branch lockup: `public/brand/uwu-sb-logo.png`
- Five confirmed societies: Student Branch (SB), Industrial Automation Society (IAS), Computer Society (CS), Robotics and Automation Society (RAS), Women in Engineering (WIE) (`lib/units.ts`)
- Section co-branding profiles and parent addresses in Colombo Trace Expert City (`lib/site.ts`)
- Strict compliance dossier: `docs/brand-compliance.md`
- Working pending register: `docs/content-pending.md`

## Product Principles

1. **Absolute Authenticity:** Never fabricate placeholder events, artificial testimonials, or simulated statistics. What is published is genuine; what is pending is stated with architectural dignity.
2. **Dynamic Clarity over Monotony:** Break the generic card rut. Let typography, architectural grid rhythms, high-contrast framing, and purposeful micro-interactions deliver energy without violating brand rigor.
3. **Impeccable Hierarchy:** Establish an undeniable reading order: instant identity verification, direct exploration of the 5 technical societies, immediate event discovery, and clear pathways to act.
4. **Performance & Access:** Zero bloat, instant interactive responses, WCAG AA compliance, and fluid responsiveness from small mobile viewports to wide displays.

## Accessibility & Inclusion

Full WCAG 2.1 AA conformance: contrast ratios ≥ 4.5:1 for body copy and ≥ 3:1 for large display text, visible focus indicators, skip-to-content links, semantic HTML5 landmarks, and respect for `prefers-reduced-motion`.
