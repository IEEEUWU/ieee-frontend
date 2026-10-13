# IEEE Uva Wellassa Student Branch

The public site for the **IEEE Uva Wellassa Student Branch** (UWU) — five chartered IEEE societies operating under one student branch at Uva Wellassa University, Badulla, Sri Lanka.

Live: **[ieee-uwu-student-branch.vercel.app](https://ieee-uwu-student-branch.vercel.app)**

The site is the branch's discovery hub: what the five societies are, what is running, who is meant to be running it, and how to get involved — across six routes: the homepage, the events calendar, and one portal per chartered society.

---

## Status

**Preview.** Every route renders in a full state, but records the branch has not supplied are still seeded:

- The dated calendar holds only **branch-published events** (`EVENTS` in [`components/sections/landing/data.ts`](components/sections/landing/data.ts)) — three today, shared by the homepage, `/events` and the society portals.
- The committee roster on the homepage ([`COMMITTEE_GROUPS`](components/sections/landing/data.ts)) and **every roster, archived term and demo event on the society portals** come from placeholder files, clearly marked. The portal demos open with a loud `TEMPORARY` banner in [`components/sections/unit/demo-data.ts`](components/sections/unit/demo-data.ts); nothing in it may ship as fact.
- Anything without data renders a designed **awaiting-publication** card, never a plausible guess. See [Publishing real data](#publishing-real-data).

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

## Routes

| Route        | What it is                                                                  |
| ------------ | --------------------------------------------------------------------------- |
| `/`          | Homepage — the landing composition (nav, hero, stats, chapters, about, events, committee, join, footer) |
| `/events`    | The dated programme as a card grid, each card led by its cover              |
| `/ias` `/cs` `/ras` `/wie` | Society portals — flat top-level URLs, statically generated      |

- All three page types share the same contract as the source design: a **fixed 1200px canvas** (the viewport meta pins the width; sections draw on 1120/1040 gutters).
- `next.config.ts` permanently redirects the old prefixed URLs — `/chapters/:slug` and `/affinity/:slug` — to the flat route.
- The sitemap lists `/` and `/events`; the society portals are not submitted yet.
- The nav's anchors are root-absolute (`/#about`), so they return to the homepage sections from any route.

### Society portal structure

Each portal follows one information architecture, in the landing page's own design language, wearing its society's colour: **hero** (badge, headline, scope, actions, the society's lockup panel) → **about** → **events** (upcoming and past behind one tab pair) → **committee** (advisors, then the Executive Committee with a term selector) → **contact & social links** → a footer customised with the chapter's name and colour.

---

## Project layout

```
app/
  layout.tsx        Fonts (Archivo, Plex Sans, Plex Mono), metadata, JSON-LD, html shell
  page.tsx          Homepage — landing composition, pinned 1200px canvas
  events/page.tsx   /events — the programme as a card grid
  [slug]/page.tsx   Society portals — generateStaticParams: ias, cs, ras, wie
  globals.css       The design system: @theme tokens, base, components, motion utilities
  robots.ts         Crawl rules
  sitemap.ts        Sitemap (/ and /events)
  icon.svg          Favicon

components/
  sections/
    landing/        One file per homepage section (nav, hero, stats, chapters,
                    about, events rows, event-cards, committee, join, footer)
                    plus the shared parts: heading.tsx (split section heading),
                    styles.ts (border/label class tokens), data.ts (all homepage
                    copy + the shared EVENTS calendar), hover.ts (hover spring)
    unit/           Society portals: chapter.tsx (page shell + section order),
                    section.tsx (UnitSection, PendingCard), events.tsx (tabbed
                    events + card), excom.tsx (term selector), people.tsx
                    (member cards), demo-data.ts (TEMPORARY rosters)
  layout/shell.tsx
  navigation/site-header.tsx
  motion/reveal.tsx
  sections/footer.tsx
  ui/primitives.tsx   Legacy from the pre-rebuild design — not mounted by any
                      route (see Architecture notes)

lib/                      Content and data. No components.
  site.ts                 Branch identity, wordmark, join label, institutional facts
  units.ts                The five societies: scopes, colours, pending lists, portal URLs
  photos.ts               Photography manifest with sources, licences and alt text

public/
  brand/uwu-sb-logo.svg   Official branch lockup (what renders; a PNG copy sits beside it)
  brand/chapters/*.png    Society lockups (CS, IAS, RAS, WIE)
  photos/                 Frames and event covers, licensed via lib/photos.ts

next.config.ts            Permanent redirects for the old /chapters and /affinity URLs
```

---

## Architecture notes

### The page is a data problem, not a copy problem

Pages compose; they do not assert. Society scopes, dates, colours, committee remits and institutional facts come from `lib/` and `components/sections/*/data.ts`. To change what the site says, edit those files. If you find yourself typing a branch fact into a component, that's the bug.

One rule follows from this: **the calendar is shared.** `EVENTS` is a single array; each record carries a `tag`, and a portal lists exactly the events the homepage already attributes to that society (`EVENT_TAG` in [`chapter.tsx`](components/sections/unit/chapter.tsx)). Nothing is reassigned to make a unit look busier than it is.

### Client islands are deliberate

Five mounted files carry `"use client"`:

```
components/sections/landing/{chapters,committee}.tsx   hover-lift motion
components/sections/unit/{events,excom,people}.tsx     tabs, term selector, hover motion
```

Everything else — including every `page.tsx` and the footer — renders on the server. Add `"use client"` only when a file genuinely needs state, effects, or event handlers.

(`navigation/site-header.tsx`, `motion/reveal.tsx` and `sections/footer.tsx` also carry the directive, but they belong to the legacy cluster listed in the layout and are not mounted by any route.)

### One interaction language

The hover lift shared by the chapter, committee and member cards is a single spring — `hoverSpring` in [`components/sections/landing/hover.ts`](components/sections/landing/hover.ts). Every animation is gated on `prefers-reduced-motion`, and with reduced motion the resting state **is** the finished composition.

### The design system is CSS, not JavaScript

Tokens are Tailwind v4 `@theme` declarations at the top of [`app/globals.css`](app/globals.css). Shared class constants — the hairline border frames, the tracked label styles — live in [`components/sections/landing/styles.ts`](components/sections/landing/styles.ts) so a size or tracking change stays a single edit. Colours are written out in full in those strings (Tailwind's scanner must see each utility literally) and are never interpolated.

### Portals are the landing's parts, re-themed

A society portal imports the landing's own heading, border and label tokens; it never defines a second system. Five custom properties set once on the page root (`--unit-brand`, `--unit-ink`, `--unit-tint`, `--unit-line`, `--unit-hover`) theme every section, following the brand/ink split documented in [`lib/units.ts`](lib/units.ts). `LandingFooter` takes an optional `identity` prop — absent, it renders the branch footer byte-identically.

---

## Publishing real data

**This is the most important section in this file.** The site is built on one rule:

> Nothing is published that the branch has not supplied. An absence is rendered as a designed state, never filled with a plausible guess.

An invented founding year or officer name is worse than a blank, because a reader cannot tell which one they are looking at.

### Where records go

1. **Dated events** — `EVENTS` in [`components/sections/landing/data.ts`](components/sections/landing/data.ts). Each record needs `day`, `month`, `title`, `description`, `tag` (one of the society names the homepage already uses) and `cover`, which points at an entry in [`lib/photos.ts`](lib/photos.ts). Adding a record lights up the homepage row, the `/events` card and the matching portal's Upcoming tab at once.
2. **Society facts** — [`lib/units.ts`](lib/units.ts). Keep `pending` entries until the branch resolves them; fill them in as records arrive and the awaiting states retire automatically.
3. **Committee rosters** — replace the placeholder `COMMITTEE_GROUPS` on the homepage, and the demo advisors / Executive Committee / archived terms in [`components/sections/unit/demo-data.ts`](components/sections/unit/demo-data.ts) on the portals.

### The demo file is temporary by design

`demo-data.ts` opens with a `TEMPORARY` banner: its rosters, archived terms and demo events exist only so the portal design can be reviewed complete, and no invented name may ship as fact. Emptying its arrays restores every designed awaiting card with **no markup changes** — each section already keeps `PendingCard` as its fallback.

### What not to do

- Do not invent an event, a date, a venue, an officer, or a contact address.
- Do not remove a `pending` or awaiting entry to make the page look tidier. An acknowledged gap is a feature of this site.
- Do not let demo data pass into a published build — the banner is not decoration.

---

## Design and brand rules

Non-negotiable, and enforced by review:

**Colour.** IEEE Blue `#00629B` is the site's structural colour — rules, links, the join block, focus rings. Everything else is a neutral, a tint of that blue, or a value of it. Tokens live in `globals.css`; there are no off-palette hues.

Two deliberate exceptions, both carrying meaning rather than decoration:

1. **Society identity colour.** Each chartered IEEE society has an established hue and may use it on its own marks: cards, badges, date plates, labels, footer. Each is split into `brand` (fills) and `ink` (anything read as type), because the true CS orange `#E8730C` is only 3.05:1 on white and fails AA. Every `ink` clears 4.5:1 on white. The values live in [`lib/units.ts`](lib/units.ts); a portal themes itself from them through CSS custom properties, so no class is interpolated per society.
2. **Photography.** Duotoned into the brand hue, so no frame introduces a colour the palette doesn't already contain.

Pure `#000000` is not used as text. Ink is `#111111`.

**Type.** Three families, loaded once in [`app/layout.tsx`](app/layout.tsx): **IBM Plex Sans** carries every rendered page (the landing design); **IBM Plex Mono** is the technical register — charter codes, dates, tracked labels, wherever the page states a fact a reader might copy or compare; **Archivo** remains the base body token of the original system. All are subset to Latin and served from the build via `next/font`.

**Shape.** One radius vocabulary: `rounded-full` for pills, buttons and tags; `24px` (`rounded-3xl`) for cards; `16px` (`rounded-2xl`) for the objects inside cards (date plates, photos, selects); `20–28px` for feature panels (stats strip, join block). Resting elevation is a 1px hairline, not a shadow; the only shadow is the landing card's hover lift. Spacing sits on a 4px grid, and sections separate at **120px** — the rhythm the homepage, `/events` and the portals all share.

**The lockup.** The official branch lockup (`public/brand/uwu-sb-logo.svg`, 8567 × 1313) is rendered unboxed, undistorted, at native proportion — never cropped, rotated, tinted, or squeezed into a container that would change its shape. Where the mark cannot stay legible at the size a layout demands, the layout gives way to the wordmark in `lib/site.ts` instead. Society lockups live in `public/brand/chapters/` and follow the same rule.

**Photography.** No images of identifiable people, ever: a stock photograph of a stranger must not imply the person is a member of this branch, and a stock frame of a lab must not imply the branch ran that session. Every frame carries its source and licence in [`lib/photos.ts`](lib/photos.ts); the events route states on the page that its covers are illustrative.

---

## Accessibility

The target is **WCAG 2.1 AA**, treated as a requirement rather than a pass at the end.

- Semantic HTML5 landmarks (`<main id="main">`, navigation, footer) and 2px visible focus rings (blue on light grounds, inverted where a blue ring would vanish)
- Body copy ≥ 4.5:1 and large display ≥ 3:1, including every society `ink` colour, verified against white
- CSS-driven motion is gated on `prefers-reduced-motion` in `globals.css`; the card hover lifts animate transform only, so nothing reflows — and with reduced motion the resting state **is** the finished composition
- Full keyboard support for the portal's interactive controls: the Upcoming/Past event tabs expose `aria-pressed`, and the committee term selector is a labelled `<label for>` control
- Photography is decorative (`alt=""`) where the adjacent text already names the subject

If your change touches colour, motion, or focus behaviour, re-check the relevant items before opening a pull request.

---

## Deployment

Vercel. Connect the repository and deploy; there is nothing to configure beyond the default Next.js preset.

To run a production build locally:

```bash
npm run build
npm run start
```

> **Changing the domain?** The absolute URL appears in five files — `app/layout.tsx`, `app/page.tsx`, `app/events/page.tsx`, `app/robots.ts` and `app/sitemap.ts`. All five must change together or canonical URLs, the sitemap and social cards will disagree with each other.

---

## Before you open a pull request

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Content changes follow [Publishing real data](#publishing-real-data) — real records in the shared calendar, demo data never shipped as fact
- [ ] Brand-affecting changes follow the design rules above
- [ ] Accessibility re-checked if colour, motion or focus changed
- [ ] The homepage and `/events` still render exactly as before unless the change is meant to touch them
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
| [CLAUDE.md](CLAUDE.md)                     | Pointer to AGENTS.md for Claude-based agents                |

---

## Licence

No licence has been declared. The repository has no `LICENSE` file, which means "all rights reserved" by default. Add one before the project is published or forked externally.
