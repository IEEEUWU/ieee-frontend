# Contributing

Thanks for wanting to work on this. It is the public site for the **IEEE Uva Wellassa Student Branch**, and it is held to a specific standard that is worth reading before you change anything.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## The one rule that matters most

> **Nothing gets published that the branch has not supplied.**

This site has no invented founding year, no fabricated events, no placeholder officer portraits, no invented statistics. Where a fact is missing, the page renders a designed pending state that names the gap.

This is a deliberate architectural position, not an oversight to tidy up later. An acknowledged gap is honest and useful; a plausible guess is neither, and a reader cannot tell the difference.

Concretely, in a pull request:

- Do not add an event, date, venue, officer name, contact address, or figure that the branch has not supplied.
- Do not delete a `pending` or `awaiting` entry because it makes the page look unfinished.
- Do not invent membership numbers, growth charts, award counts, or testimonials.
- Do not use a photograph of an identifiable person. A stock photo of a stranger must never imply they are a member of this branch.

If you have real records, replacing the samples is welcome and is the intended way to improve this site. See [Publishing real data](README.md#publishing-real-data).

---

## Getting set up

Requires **Node.js ≥ 20.9** and npm.

```bash
git clone https://github.com/IEEEUWU/ieee-frontend.git
cd ieee-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

There is no test suite. The gate is `npm run lint` and `npm run build`. Both must pass before a pull request can be merged.

> **Working with an AI coding agent?** Read [AGENTS.md](AGENTS.md) first. Next.js 16 has breaking changes relative to most training data, and the bundled documentation lives in `node_modules/next/dist/docs/` — check it rather than working from memory.

---

## Where to make a change

Most edits are one of three kinds.

### 1. Content — the page says something

Everything the site states lives in `lib/`, not in components.

| To change                        | Edit                                              |
| -------------------------------- | ------------------------------------------------- |
| Society names, scopes, colours   | [`lib/units.ts`](lib/units.ts)                    |
| Events, programmes               | [`lib/events.ts`](lib/events.ts)                  |
| Committee seats, roster          | [`lib/team.ts`](lib/team.ts)                      |
| Confirmed / awaiting facts       | [`lib/record.ts`](lib/record.ts)                  |
| Identity, nav, headline, ticker  | [`lib/site.ts`](lib/site.ts)                      |
| Photographs, alt text, licences  | [`lib/photos.ts`](lib/photos.ts)                  |

If you find yourself typing a branch fact into a component, that is the bug.

### 2. Layout or behaviour — a section looks or works differently

One file per section in `components/sections/`. Section order is set in [`app/page.tsx`](app/page.tsx) and follows the reader's journey; it is not reshuffled for variety. If you genuinely need to reorder it, say why in the pull request — it is a product decision, not a styling one.

### 3. Design system — tokens, type, colour, motion

[`app/globals.css`](app/globals.css). Tokens are Tailwind v4 `@theme` declarations, so most visual changes need no JavaScript at all.

---

## Conventions

**Architecture**

- `app/page.tsx` stays a server component. Add `"use client"` only where state, effects, or event handlers are genuinely required, and justify new boundaries in the pull request.
- Keep branch facts and copy in `lib/`. Components hold presentation.
- Compute figures from data. `impactStats` in `lib/record.ts` is counted from the records at module scope rather than typed by hand — follow that pattern rather than adding a literal number.
- Derive nothing by position. Index `0` in an array is ordering, not meaning; that is why `committee` in `lib/team.ts` writes out each seat instead of `filter().map()`-ing `areas[0]`.

**Motion**

- Every animation is defined in `components/motion/` and composed elsewhere. Use `EASE` and `DURATION` from [`reveal.tsx`](components/motion/reveal.tsx); do not hand-roll a curve or duration.
- Gate motion behind `useReducedMotion()` or a `prefers-reduced-motion` media query. The reduced-motion resting state must be the finished composition, so nothing is lost but the movement.
- Animate `transform` and `opacity` only, so layout ratios hold still while the page moves.

**Code**

- TypeScript `strict`. No `any`. Prefer a precise type over a cast.
- `null` is a valid answer for an unpublished fact — model it as `string | null`, render a real state, and do not fall back to a placeholder string.
- Map for lookups, not plain objects, so a bad id yields `undefined` instead of a prototype member.
- Comments explain **why**, not what. This codebase has a high comment-to-code ratio on purpose: the reasoning behind a decision is usually the part that would otherwise be lost.

---

## Design and brand rules

These are enforced at review. Full detail is in the [README](README.md#design-and-brand-rules).

- **IEEE Blue `#00629B` is structural.** Everything else is a neutral, a tint of it, or a value of it. No off-palette hues.
- **Society identity colours** are the one permitted exception, restricted to self-identifying marks. Each society's colour is split into `brand` (fills) and `ink` (anything read as type). The true CS orange `#E8730C` is 3.05:1 on white and fails AA — use `ink` for text, always.
- **Photography is duotoned** into the brand hue so no frame introduces a colour outside the palette.
- **Ink is `#111111`, not `#000000`.**
- **Archivo** for prose and display; **IBM Plex Mono** for the technical register only — charter codes, dates, register labels, instrument values.
- **Radius `0`. No shadows.** Elevation is 1px rules.
- **4px spacing grid.** Section rhythm 64 / 96 / 128.
- **The lockup** (`public/brand/uwu-sb-logo.png`, 8567 × 1313) is rendered unboxed and undistorted at native proportion. Never cropped, rotated, tinted, or squeezed. If it will not stay legible at the size your layout needs, fall back to the wordmark in `lib/site.ts` rather than shrinking or boxing the mark.

---

## Accessibility

The target is **WCAG 2.1 AA**, and it is a requirement rather than a final check.

- If your change touches colour, re-check contrast: ≥ 4.5:1 for body copy, ≥ 3:1 for large display. Society ink colours must clear 4.5:1 on both white and the surface tone.
- If your change touches motion, confirm the reduced-motion path. The page must still read completely with animation off.
- Keep focus rings visible (2px, inverted to white on the blue ground).
- Any new interactive control needs a real focusable element, a label, and keyboard operation. Follow the existing patterns: the explorer tablist implements the WAI-ARIA tabs pattern, and horizontal rails are real scrollers rather than drag-only surfaces.
- Semantic HTML first. Headings in order, landmarks present, one `h1` per page.

---

## Submitting a pull request

1. **Branch** from `main`, or from `development` if the change is larger than a fix.
2. **Make the change.** Keep it focused — one concern per pull request.
3. **Verify:**
   ```bash
   npm run lint
   npm run build
   ```
4. **Check it in the browser** at desktop and at a phone width, and once with reduced motion enabled if you touched anything animated.
5. **Write the description.** Say what changed and why. If it touches content, state which records were supplied by the branch and confirm you did not invent any. If it touches the palette, motion or focus, state what you re-checked.
6. **Open it against `main`.**

Commit messages: short imperative subject, roughly 50 characters, no full stop. Explain the reasoning in the body when the reason isn't obvious from the diff.

Maintainers may ask for changes or decline a pull request. If a change is declined, you will get a reason. Disagreement about a design or brand decision is normal and fine — bring evidence rather than preference.

---

## Reporting a problem or a security issue

Bugs and content corrections are welcome as issues.

For a **security vulnerability**, please do not open a public issue. Use GitHub's private reporting channel instead:
<https://github.com/IEEEUWU/ieee-frontend/security/advisories/new>

For a **conduct concern**, follow the confidential routes in the [Code of Conduct](CODE_OF_CONDUCT.md#reporting-an-issue). Note that the branch has not yet published an official contact channel — that gap is itself recorded in `lib/site.ts`, and a good contribution would be wiring up a real one.

---

## Licence

No licence has been declared for this repository, so there is currently no grant of rights to contribute under. Adding a `LICENSE` file is an open task, and it should be settled before the project is published or forked externally.
