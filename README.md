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

## Backend authentication

The unlinked login page is `/auth/login`. Next.js forwards every backend request using the required server-only `AUTH_API_BASE_URL` setting in the root `.env` file (include `/api`). There is no hardcoded backend URL or localhost fallback. Browser requests use same-origin Next.js routes to preserve HttpOnly cookie handling. Restart Next.js after changing it. In a deployed environment, this URL must point to a backend reachable from the Next.js server.

The JWT lives only in the `ieee_access_token` HttpOnly cookie (SameSite=Lax; Secure in production). Redux holds authentication status, pending state, and expiry, never the JWT. Login redirects to `/admin`; failed responses use Sonner toasts. Refresh runs one minute before expiry, serializes requests across supported browser tabs using Web Locks, and replaces the cookie. Logout clears the local session even on backend failure. An expired or rejected session returns to `/auth/login`.

For new protected backend integrations, use `protectedBackendRequest` from `lib/auth/server.ts` in a same-origin Next.js route handler and `protectedFetch` from `lib/auth/client.ts` in the client. Check `sameOrigin` for mutating handlers. These helpers attach bearer authorization on the server and handle backend 401 responses without exposing the token to JavaScript.

The admin workspace fetches `GET /auth/me` through the server using the HttpOnly cookie token as a bearer header. Redux stores the validated account profile. User groups map to 1 = Webmaster, 2 = Chair Person, and 3 = Secretary; dashboards use the SB, IAS, CS, WIE, or RAS chapter returned by the backend. Metrics, priorities, and activities are explicitly labeled sample data. Identity switching is removed. Unknown roles get a role-pending screen; inactive accounts are denied. Backend permissions must still be enforced by every protected endpoint. Older admin module pages remain demo implementations and are not linked from the new dashboard.

Run the mocked auth contract checks with `node --test tests/auth.test.cjs`.

## Permission management

`/admin/permissions` uses the backend permission catalogue and Axios server routes. The sidebar appears when the current user has any of `CREATE_PERMISSION`, `VIEW_PERMISSIONS`, `UPDATE_PERMISSION`, or `DELETE_PERMISSION`. Each action checks its matching code in the UI and checks a fresh authenticated profile on the server; role and chapter never imply a grant. Redux holds the catalogue and effective permission codes. Permission-denied responses show toasts without ending the session; 401 responses require login again.

The current backend `/auth/me` returns before serializing `effective_permissions`. When that field is missing, the server resolves permissions with `/get-user/{authenticated-user-id}`. Once `/auth/me` includes the field, the extra request is skipped. Only the ID returned by the authenticated backend response is used.

Create uses POST `/create-permission`; update uses PUT `/update-permission/{id}`; list and detail use GET `/get-permissions` and `/get-permission/{id}`; deletion uses DELETE `/delete-permission/{id}`. Every backend request uses the required `.env` base URL and bearer token read from the HttpOnly cookie. Backend routes should also enforce their permission middleware; the frontend server currently checks all four codes even where the backend has not attached middleware.

## User group management

`/admin/usergroups` lists groups, supports backend pagination, and offers create, edit, delete, and permission assignment actions. The sidebar and actions use `CREATE_USERGROUP`, `VIEW_USERGROUPS`, `UPDATE_USERGROUP`, `DELETE_USERGROUP`, and `ASSIGN_USERGROUP_PERMISSIONS`; each API handler checks the matching code against a fresh authenticated profile. Permission selection requires `VIEW_PERMISSIONS` and loads all pages of the permission catalogue into searchable checkbox cards.

Create sends numeric permission IDs to POST `/create-usergroup`. Edit sends numeric permission IDs to PUT `/update-usergroup/{id}`. The separate assignment action sends `{ user_group_id, permissions: number[] }` to POST `/assign-usergroup-permissions`. List uses GET `/get-usergroups?page={page}`, and delete uses DELETE `/delete-usergroup/{id}`. The local routes use the existing configured backend base URL and server-held bearer token.

The list accepts a plain group array or the same paginator envelope as the permission service. Group records use `id`, `group_name`, `group_description`, and optional `permissions` containing IDs, codes, or permission relation objects. Missing or unavailable assignments require an explicit replacement selection before saving, so an omitted relationship cannot silently clear existing permissions. Successful changes refresh the authenticated profile and current list.

## Public event integration

`/events` and `/events/[slug]` load published events from the backend using the existing server-only `AUTH_API_BASE_URL` environment variable (including the backend `/api` prefix). There is no fallback backend host. Requests are GET-only, use `Accept: application/json`, send no bearer token or request body, and are not cached.

The list supports chapter, search, timeframe (`upcoming`, `ongoing`, `past`, `all`), page and per_page (maximum 48). Filter changes reset pagination; page links preserve filters. Invalid queries show a reset action. Event timestamps display in Asia/Colombo. Backend-relative cover paths resolve against the configured backend origin; missing or unsafe covers use a local illustrative image. External images render without the Next.js image proxy.

Detail pages use live metadata and show only fields supplied by the event API. Registration and OC availability are informational for now; their existing demo submission screens have not been connected to the backend. The homepage Upcoming events section also uses the backend; chapter demo calendars remain separate. The sitemap indexes `/events` instead of advertising obsolete demo event slugs.

Run `npm test` for authentication/access and public-event tests. Event tests cover environment configuration, GET payloads, filters, pagination, response validation, safe covers, timezone conversion, error handling and server-rendered list output. Tests mock API responses and do not mutate backend records.

## Admin event creation

Open **Admin > Events > Create event** (`/admin/events`). This screen now uses backend GET `/events` instead of local-storage demo records, including drafts and other statuses within the backend chapter scope. Creation sends metadata as JSON or metadata plus a cover file as multipart to POST `/events` via the local `/api/events` route. The existing `AUTH_API_BASE_URL` and server-held bearer cookie are reused; the browser never receives the backend token.

The form validates required fields, enum values, contact email, string lengths, capacity, image paths, date validity and start/end ordering. Sri Lanka datetime inputs convert explicitly to UTC. Backend field errors remain attached to their fields, and submission values survive errors. Only users with `CREATE_EVENT` see creation controls, and the server rechecks that permission. SB WebMaster chapter selection uses the actual group name from authenticated user details, not a seeded group ID; the backend remains responsible for chapter authorization.

Choose **Published** to display the event publicly; **Draft** appears only in admin Events. The public default is Upcoming, so past/ongoing events require their corresponding public filter. Creation does not create registration/OC forms. Event metadata and covers can be edited using Edit event. Publication changes after creation and form building remain separate follow-up work.

`tests/admin-events.test.cjs` covers payload validation, UTC conversion, create/list proxy behavior, authorization, bearer headers, environment URL configuration, backend field errors and draft catalogue parsing. Tests use mocked create requests and do not create backend records.

## Event cover images and editing

Create/Edit event supports one optional JPEG, PNG or WebP cover up to 5 MiB and 6000 x 6000 pixels. Selection shows a local preview; cancel replacement restores the existing cover, and explicit removal shows the placeholder until saved. Preview object URLs are released when replaced/unmounted. Validation/network errors preserve the file and metadata. Duplicate saves are disabled; mutations are not automatically retried.

Uploads use `cover_image_file`. New clients omit legacy `cover_image` and all response-only fields. File creation uses multipart POST `/events`; file updates use multipart POST `/events/{id}` with `_method=PUT`. Boolean fields are serialized as `1`/`0`, nullable scalars as empty strings, and multipart Content-Type/boundaries are generated by the HTTP client. No base64 or separate upload endpoint is used. JSON metadata updates use PUT `/events/{id}`; removing a cover sends `remove_cover_image: true`. Omitted image fields preserve the current cover. Date edits send both timestamps; status is excluded from metadata updates. Upload requests have a 60-second timeout.

The local `/api/events/[id]` handlers support authenticated detail reads and updates, check UPDATE_EVENT for mutations, and forward backend chapter restrictions and validation errors. All upstream URLs still come from AUTH_API_BASE_URL. Admin/public images and metadata use returned cover_image_url without prepending /api; broken images fall back once to the local placeholder. Backend content/dimension validation and public storage hosting remain authoritative.

Automated tests include a local HTTP multipart transport check verifying generated boundaries, server bearer authorization, method override and unchanged binary bytes. No test uploads files to the configured real backend.


## Landing upcoming events

The homepage Upcoming events section loads the next three published upcoming events through the same server-side environment-configured public API helper as /events. It retains the existing dated rows, section heading, dividers, typography and chapter tags. A 96 x 64 cover thumbnail sits between each date and title, hidden below the md breakpoint, using cover_image_url with the shared fallback. A See all events button below the rows always links to /events?timeframe=all. Loading streams inside the section; an API failure shows a local unavailable state while the rest of the homepage remains available. No demo records are substituted for missing backend events.
