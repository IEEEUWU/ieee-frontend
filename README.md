# IEEE Uva Wellassa Student Branch

The public site for the **IEEE Uva Wellassa Student Branch** (UWU) — five chartered IEEE societies operating under one student branch at Uva Wellassa University, Badulla, Sri Lanka.

Live: **[ieee-uwu-student-branch.vercel.app](https://ieee-uwu-student-branch.vercel.app)**

The site is the branch's discovery hub: what the five societies are, what is running, who is meant to be running it, and how to get involved.

---

## Status

**Preview.** The page renders in a full state, but two things on it are seeded with **sample records the branch has not supplied**: the dated events register and the committee roster.

`SAMPLE_DATA` in [`lib/sample.ts`](lib/sample.ts) is `true`, which makes every section holding sample records render a visible "Sample data" notice on the page. A build carrying placeholders cannot be mistaken for a published one. See [Publishing real data](#publishing-real-data).

---

## Stack

| Concern     | Choice                                                          |
| ----------- | --------------------------------------------------------------- |
| Framework   | Next.js 16.3.8 — App Router, Turbopack, React Server Components |
| UI          | React 19.2.8                                                    |
| Styling     | Tailwind CSS v4, CSS-first config via `@theme`                 |
| Animation   | Motion for React 14 (`motion/react`)                           |
| Icons       | Phosphor Icons (`@phosphor-icons/react/ssr`)                   |
| Language    | TypeScript 5, `strict`                                          |
| Runtime     | Node.js **≥ 20.9** (developed on 24.x)                         |

There is no test suite. `npm run lint` and `npm run build` are the gate — see [Before you open a pull request](#before-you-open-a-pull-request).

---

## Getting started

Requires Node 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script          | What it does                                        |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Dev server with fast refresh                         |
| `npm run build` | Production build                                    |
| `npm run start` | Serve the production build                          |
| `npm run lint`  | ESLint (flat config, `eslint-config-next` presets)  |

---

## Project layout

```
app/
  layout.tsx        Fonts, metadata, JSON-LD, html shell
  page.tsx          Composition root — a server component, owns section order
  globals.css       The design system: tokens, base, components, motion utilities
  robots.ts         Crawl rules
  sitemap.ts        Single-route sitemap
  icon.svg          Favicon

components/
  layout/shell.tsx        Max-width container and the one grid on the page
  navigation/             Sticky header, mobile drawer, reading progress
  sections/               One file per page section
  motion/                 Reveal, CountUp, Magnetic — the motion primitives
  ui/                     Logo, action buttons, Scroller, SignalTrace

lib/                      Content and data. No components.
  site.ts                 Branch identity, nav, promise, ticker, contact state
  units.ts                The five societies, plus id lookups
  events.ts               Published events register and undated programmes
  team.ts                 Committee seats and roster statistics
  record.ts               Confirmed facts, awaiting facts, derived impact figures
  photos.ts               Photography manifest with alt text and licences
  sample.ts               The SAMPLE_DATA switch

public/
  brand/uwu-sb-logo.png   Official branch lockup, delivered unmodified
  photos/                 Frames, duotoned into IEEE Blue before they render
```

---

## Architecture notes

### The page is a data problem, not a copy problem

`app/page.tsx` is a server component that renders the whole page as HTML. It holds no state, no hooks, and no branch facts. Every statement the page makes — society scopes, dates, committee remits, institutional facts — comes from `lib/`.

To change what the site says, edit `lib/`. If you find yourself typing a branch fact into a component, that's the bug.

### Client islands are deliberate

Eleven files carry `"use client"`:

```
components/motion/{count-up,magnetic,reveal}.tsx
components/navigation/site-header.tsx
components/sections/{event-gallery,explorer,footer,hero,join,society-rail}.tsx
components/ui/scroller.tsx
```

Everything else — including `page.tsx` and the majority of sections — renders on the server. Add `"use client"` only when a file genuinely needs state, effects, or event handlers.

### Figures are computed, never typed

`impactStats` in [`lib/record.ts`](lib/record.ts) is counted from `societies` and `awaitingFacts` at module scope. There are no hand-written statistics anywhere on the site, so a number can never drift from the record behind it. If you add a society, the counts move on their own.

### One motion language

Every animation is defined in `components/motion/` and composed elsewhere. The house easing curve (`EASE`) and the duration scale (`DURATION`) live in `reveal.tsx`. No section hand-rolls a transition, so changing the motion language is a change to one file.

### The design system is CSS, not JavaScript

Tokens are Tailwind v4 `@theme` declarations at the top of [`app/globals.css`](app/globals.css). Colour, type, and the scroll-snap rule are all defined there, which means no component needs to know any of it exists.

### The only scroll-snap rule is one media-query block

`main.page-stack` marks its direct children as snap points so scrolling settles on a section boundary. It is `proximity`, never `mandatory` — mandatory snap makes a section taller than the viewport unreachable — and it is gated on `prefers-reduced-motion: no-preference`, because snap is a change in scroll behaviour rather than decoration.

---

## Publishing real data

**This is the most important section in this file.** The site is built on one rule:

> Nothing is published that the branch has not supplied. An absence is rendered as a designed state, never filled with a plausible guess.

An invented founding year or officer name is worse than a blank, because a reader cannot tell which one they are looking at.

### Two steps, both in `lib/`

1. **Replace the sample arrays.**
   - `publishedEvents` in [`lib/events.ts`](lib/events.ts) — real dated events. Each record requires a `photo`, which points at an entry in `lib/photos.ts`; the field is deliberately non-optional so a record cannot be added half-wired.
   - `committee` in [`lib/team.ts`](lib/team.ts) — set `holder` to `null` rather than inventing a name. The section already renders an explicit awaiting-nomination state, and each seat's `discipline` stays useful even while vacant.
2. **Set `SAMPLE_DATA = false`** in [`lib/sample.ts`](lib/sample.ts).

That flag is the whole mechanism, and it lives in one file so the decision cannot drift between sections. Flipping it to `false` removes the notices and leaves your data untouched.

### Facts still outstanding

Already named in the code, so a gap reads as a published state rather than an oversight:

- `awaitingFacts` in [`lib/record.ts`](lib/record.ts) — founding year, officer roster, society marks, contact channel, full Section postal address, annual activity report.
- `pending` on each society in [`lib/units.ts`](lib/units.ts) — marks, rosters and session schedules.

Fill these in as records arrive from the branch, and the pending states retire automatically. Adding a verified event also retires the events empty state with no other change.

### What not to do

- Do not invent an event, a date, a venue, an officer, or a contact address.
- Do not remove a `pending` or `awaiting` entry to make the page look tidier. An acknowledged gap is a feature of this site.
- Do not use `SAMPLE_DATA` as a way to ship plausible content.

---

## Design and brand rules

Non-negotiable, and enforced by review:

**Colour.** IEEE Blue `#00629B` is the page's structural colour — rules, links, the join block, focus rings. Everything else is a neutral, a tint of that blue, or a value of it. Tokens live in `globals.css`; there are no off-palette hues.

Two deliberate exceptions, both carrying meaning rather than decoration:

1. **Society identity colour.** Each chartered IEEE society has an established hue and may use it on its own card edge, active marker and label. Each is split into `brand` (fills) and `ink` (anything read as type), because the true CS orange `#E8730C` is only 3.05:1 on white and fails AA. Every `ink` clears 4.5:1 on both white and the surface tone.
2. **Photography.** Duotoned into the brand hue, so no frame introduces a colour the palette doesn't already contain.

Pure `#000000` is not used as text. Ink is `#111111`.

**Type.** Archivo carries all prose and display. IBM Plex Mono carries the technical register only — charter codes, dates, register labels, instrument values. Mono is not decoration: wherever the page states a fact a reader might copy or compare, it is set in mono, so "this is data" is legible before the sentence is read. Both are subset to Latin, preloaded, and served from the build via `next/font`.

**Shape.** Radius `0` everywhere. Elevation is expressed with 1px rules, never with shadows. Spacing is on a 4px grid; section rhythm is 64 / 96 / 128.

**The lockup.** `public/brand/uwu-sb-logo.png` (8567 × 1313, transparent RGBA) is rendered unboxed, undistorted, at native proportion — never cropped, rotated, tinted, or squeezed into a container that would change its shape. Where the mark cannot stay legible at the size a layout demands, the layout gives way to the wordmark in `lib/site.ts` instead.

**Photography.** No images of identifiable people, ever: a stock photograph of a stranger must not imply the person is a member of this branch, and a stock frame of a lab must not imply the branch ran that session. Every frame carries alt text and a licence in [`lib/photos.ts`](lib/photos.ts); CC BY credits render in the footer, CC0 frames carry no credit line.

---

## Accessibility

The target is **WCAG 2.1 AA**, treated as a requirement rather than a pass at the end.

- Skip link, semantic HTML5 landmarks, and 2px visible focus rings — inverted to white on the blue ground, where a blue ring would vanish
- Body copy ≥ 4.5:1 and large display ≥ 3:1, including every society ink colour, verified against both white and the surface tone
- Every animation gated on `prefers-reduced-motion: no-preference`. With reduced motion the resting state **is** the finished composition, so the page loses movement and nothing else
- Full keyboard support for the explorer tablist (one tab stop for the list, arrows to move, Home/End to jump) and the mobile drawer
- Horizontal rails are real scrollers with `edge-fade` masks, not drag-only surfaces

If your change touches colour, motion, or focus behaviour, re-check the relevant items before opening a pull request.

---

## Deployment

Vercel. Connect the repository and deploy; there is nothing to configure beyond the default Next.js preset.

To run a production build locally:

```bash
npm run build
npm run start
```

> **Changing the domain?** `SITE_URL` appears in four places — `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, and `lib/site.ts`. All four must change together or canonical URLs, the sitemap and social cards will disagree with each other.

---

## Before you open a pull request

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Content changes follow [Publishing real data](#publishing-real-data) — real records supplied, `SAMPLE_DATA` flipped if the samples were replaced
- [ ] Brand-affecting changes follow the design rules above
- [ ] Accessibility re-checked if colour, motion or focus changed
- [ ] No new `"use client"` boundary without a stated reason

Full workflow and commit guidance: **[CONTRIBUTING.md](CONTRIBUTING.md)**.
Expectations of behaviour: **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**.

---

## Project documents

| Document                                  | What it holds                                               |
| ----------------------------------------- | ----------------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md)                   | Product definition: users, purpose, constraints, principles  |
| [CONTRIBUTING.md](CONTRIBUTING.md)         | How to propose a change, and the conventions to follow        |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)   | Behaviour expectations, reporting routes, enforcement        |
| [AGENTS.md](AGENTS.md)                     | Notes for coding agents working in this repo                |

---

## Licence

No licence has been declared. The repository has no `LICENSE` file, which means "all rights reserved" by default. Add one before the project is published or forked externally.
