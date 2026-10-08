import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Envelope,
  MapPin,
} from "@phosphor-icons/react/ssr";
import { EVENTS } from "@/components/sections/landing/data";
import {
  BORDER_BTN2,
  BORDER_CARD,
  LABEL_SM,
} from "@/components/sections/landing/styles";
import { site } from "@/lib/site";
import { type Society, type SocietyId } from "@/lib/units";
import { UnitSection, PendingCard } from "./section";
import { UnitExCom } from "./excom";
import { UnitPeople } from "./people";
import { UnitEvents, type EventLike } from "./events";
import {
  DEMO_ADVISORS,
  DEMO_CURRENT_TERM,
  DEMO_EMAILS,
  DEMO_EXCOM,
  DEMO_PAST_EVENTS,
  DEMO_PUBLICATION,
  DEMO_SOCIALS,
  DEMO_TERMS,
  DEMO_UPCOMING,
} from "./demo-data";

/**
 * The shared calendar's tag per society, so a chapter page lists exactly the
 * events the homepage already attributes to it. An id without a tag match
 * falls through to the demo schedule below; nothing is reassigned to make a
 * unit look busier than it is.
 */
const EVENT_TAG: Record<SocietyId, string> = {
  sb: "",
  cs: "Computer Society",
  ias: "Industry Applications Society",
  ras: "RAS",
  wie: "WIE",
};

/**
 * The chapter page.
 *
 * One composition per chartered unit, following the branch's published index:
 * introduction, about, events (upcoming and past behind one tab pair, cards
 * led by their covers), the committee (advisors and the Executive Committee —
 * current members and archived terms behind one selector), social links, and
 * the chapter's own footer below. Every block is
 * built from the landing page's own parts — the hero badge, display headline
 * and pill actions, the identity panel carrying the unit's lockup on its
 * tint, the split section heading, the white hairline card, the
 * date plate and tag pill of an event card, and the committee's grouped
 * member cards for the people sections — on the same 1120px canvas the
 * homepage draws, so the route reads as the same site rather than a second
 * design system.
 *
 * Data composes in two layers: the branch's supplied records when they exist
 * (the shared `EVENTS` calendar today), and `demo-data.ts` — explicitly
 * temporary placeholder rosters — so the design can be reviewed complete.
 * Every section keeps its designed pending card as the fallback, so emptying
 * the demo file restores the awaiting states with no markup changes.
 *
 * `path` is the route as requested, echoed back in the portal notice; it
 * comes from the page because a unit can be reached under more than one
 * segment and the notice must describe where the reader actually is.
 *
 * Each unit renders in its own society colour, carried by five custom
 * properties set once on the root and inherited by every section: `brand`
 * for marks and fills (the badge dot, icons, the tints) and `ink` for
 * anything that has to be read (links, the date, tag text, the primary
 * action) — the exact split `lib/units.ts` documents, so CS renders orange,
 * RAS red, IAS green, WIE purple and the branch its own blue without a
 * single class being interpolated per society.
 */
export function ChapterPage({
  unit,
  path,
}: {
  unit: Society;
  path: string;
}) {
  const slug = path.split("/").pop() || "sb";
  const calendar = EVENTS.filter((event) => event.tag === EVENT_TAG[unit.id]);
  const advisors = DEMO_ADVISORS[unit.id];
  const excom = DEMO_EXCOM[unit.id];
  const upcoming: readonly EventLike[] =
    calendar.length > 0 ? calendar : DEMO_UPCOMING[unit.id] ?? [];
  const pastEvents: readonly EventLike[] = DEMO_PAST_EVENTS[unit.id];
  const demoPublication = DEMO_PUBLICATION.length > 0;
  const publication = demoPublication ? DEMO_PUBLICATION : unit.pending;
  const email = DEMO_EMAILS[unit.id];
  const aboutTitle =
    unit.unitType === "chapter"
      ? "About the Chapter"
      : unit.unitType === "affinity_group"
        ? "About the Affinity Group"
        : "About the Branch";

  return (
    <div
      data-land="unit"
      className="flex w-full max-w-[1120px] flex-col items-start gap-12 px-10 pb-[120px]"
      style={
        {
          "--unit-brand": unit.colour.brand,
          "--unit-ink": unit.colour.ink,
          "--unit-tint": `${unit.colour.brand}14`,
          "--unit-line": `${unit.colour.ink}40`,
          "--unit-hover": `${unit.colour.brand}2E`,
        } as CSSProperties
      }
    >
      <Link
        href="/#societies"
        className="group inline-flex items-center gap-2 text-[13px] font-medium text-[#8796A5] transition-colors hover:text-[color:var(--unit-ink)]"
      >
        <ArrowLeft
          size={14}
          weight="bold"
          aria-hidden="true"
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to IEEE Student Branch
      </Link>

      {/* Hero / Introduction — headline column beside the chapter's own
          identity panel: the lockup on the unit's tint, ghosted monogram */}
      <header className="flex w-full flex-row items-center justify-between gap-16">
        <div className="flex min-w-0 flex-col items-start gap-8">
          <div className="flex flex-row items-center gap-2 rounded-full bg-[color:var(--unit-tint)] px-4 py-2">
            <div
              className="h-2 w-2 rounded-full bg-[color:var(--unit-brand)]"
              aria-hidden="true"
            />
            <p className="whitespace-pre text-[14px] font-medium text-[color:var(--unit-ink)]">
              {unit.abbreviation} · {unit.unitTypeLabel} · Chartered under IEEE
              Student Branch
            </p>
          </div>

          <div className="w-full">
            <h1 className="text-[72px] font-semibold tracking-[-2.5px] leading-[1.05] text-[#0B1B2B]">
              {unit.name}
            </h1>
          </div>

          <div className="w-full max-w-[680px]">
            <p className="text-[19px] leading-[1.6] text-[#4A5B6B] text-pretty">
              {unit.scope}
            </p>
          </div>

          <div className="flex flex-row items-start gap-3">
            <Link
              href="/#join"
              className="rounded-full bg-[color:var(--unit-ink)] px-7 py-4 text-[16px] font-semibold text-white"
            >
              {unit.unitType === "chapter" ? "Join this chapter" : site.joinLabel}
            </Link>
            <a
              href="#events"
              className={`${BORDER_BTN2} rounded-full bg-white px-7 py-4 text-[16px] font-semibold text-[#0B1B2B]`}
            >
              See events
            </a>
          </div>
        </div>

        <div className="relative flex h-[340px] w-[400px] shrink-0 items-center justify-center overflow-hidden rounded-[32px] border border-[color:var(--unit-line)] bg-[color:var(--unit-tint)]">
          <span
            aria-hidden="true"
            className="absolute -bottom-10 -right-3 select-none text-[190px] font-bold leading-none tracking-[-6px] text-[color:var(--unit-brand)] opacity-[0.07]"
          >
            {unit.abbreviation}
          </span>
          {unit.logo ? (
            <Image
              src={unit.logo.src}
              alt=""
              width={unit.logo.width}
              height={unit.logo.height}
              sizes="400px"
              className="relative max-h-[46%] w-auto max-w-[82%] object-contain"
            />
          ) : (
            <span className="relative text-[96px] font-semibold tracking-[-3px] text-[color:var(--unit-brand)]">
              {unit.abbreviation}
            </span>
          )}
        </div>
      </header>

      {/* About */}
      <UnitSection
        id="about"
        title={aboutTitle}
        lede="What this unit is chartered to do, and what it publishes."
      >
        <div className="grid w-full gap-5 md:grid-cols-2">
          <InfoCard kicker="Chartered Focus Areas">
            <ul className="grid gap-3 sm:grid-cols-2">
              {unit.areas.map((area) => (
                <li
                  key={area}
                  className="flex items-baseline gap-3 text-[15px] font-medium text-[#0B1B2B]"
                >
                  <Check
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="shrink-0 translate-y-0.5 text-[color:var(--unit-brand)]"
                  />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </InfoCard>

          {publication.length > 0 ? (
            <InfoCard kicker="Publication Status">
              <ul className="flex flex-col gap-2.5">
                {publication.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-3 text-[14px] text-[#4A5B6B]"
                  >
                    {demoPublication ? (
                      <Check
                        size={14}
                        weight="bold"
                        aria-hidden="true"
                        className="shrink-0 translate-y-0.5 text-[color:var(--unit-brand)]"
                      />
                    ) : (
                      <Clock
                        size={13}
                        weight="regular"
                        aria-hidden="true"
                        className="shrink-0 translate-y-0.5 text-[color:var(--unit-brand)]"
                      />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          ) : null}
        </div>

        <InfoCard kicker="Subgroup Portal Deployment Status">
          <p className="max-w-[80ch] text-[15px] leading-[1.6] text-[#4A5B6B]">
            This route serves as the frontend designated landing point for{" "}
            <strong className="font-semibold text-[#0B1B2B]">
              {unit.name}
            </strong>
            . The branch executive committee is currently confirming whether
            this unit will run on this subpage route (
            <code className="font-semibold text-[#0B1B2B]">{path}</code>) or
            transition to a dedicated subdomain (e.g.{" "}
            <code className="font-semibold text-[#0B1B2B]">
              {`https://${slug}.ieee-uwu.org`}
            </code>
            ).
          </p>
        </InfoCard>
      </UnitSection>

      {/* Events — the programme and its archive behind one tab pair, each
          card led by the event's cover */}
      <UnitSection
        id="events"
        title="Events"
        lede="The sessions this unit is running next, and the archive of what it has already run."
      >
        <UnitEvents
          upcoming={upcoming}
          past={pastEvents}
          showCalendar={calendar.length > 0}
          abbreviation={unit.abbreviation}
        />
      </UnitSection>

      {/* Committee — advisors and the Executive Committee as one people
          block, below the events this committee runs */}
      <UnitSection id="committee" title="Committee" center>
        {advisors.length > 0 ? (
          <UnitPeople
            groups={[{ label: "ADVISORS", rows: [advisors] }]}
            brand={unit.colour.brand}
          />
        ) : (
          <PendingCard>
            The branch has not published this unit&rsquo;s advisor roster yet.
            Named advisors appear here once confirmed.
          </PendingCard>
        )}
        {excom.length > 0 ? (
          <UnitExCom
            currentLabel={DEMO_CURRENT_TERM}
            current={excom}
            terms={DEMO_TERMS}
            brand={unit.colour.brand}
          />
        ) : (
          <PendingCard>
            The current Executive Committee roster for {unit.abbreviation} has
            not been published yet. Named officers appear here once the branch
            supplies it.
          </PendingCard>
        )}
      </UnitSection>

      {/* Contact & Social Links */}
      <UnitSection
        id="contact"
        title="Contact & Social Links"
        lede="Where to find the branch, and its published channels."
      >
        <div className="grid w-full gap-5 md:grid-cols-2">
          <InfoCard kicker="Branch address">
            <div className="flex items-start gap-3">
              <MapPin
                size={16}
                weight="bold"
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[color:var(--unit-brand)]"
              />
              <address className="text-[15px] leading-[1.7] text-[#4A5B6B] not-italic">
                <div>{site.university}</div>
                <div>
                  {site.city}, {site.country}
                </div>
                <div className="text-[#8796A5]">{site.region}</div>
              </address>
            </div>
          </InfoCard>

          {email || DEMO_SOCIALS.length > 0 ? (
            <InfoCard kicker="Official channels">
              <div className="flex flex-col gap-4">
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-[15px] font-medium text-[#0B1B2B] transition-colors hover:text-[color:var(--unit-ink)]"
                  >
                    <Envelope
                      size={16}
                      weight="bold"
                      aria-hidden="true"
                      className="shrink-0 text-[color:var(--unit-brand)]"
                    />
                    {email}
                  </a>
                ) : null}
                <div className="flex items-center gap-3">
                  {DEMO_SOCIALS.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={social.label(unit.abbreviation)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--unit-tint)] transition-colors hover:bg-[color:var(--unit-hover)]"
                      >
                        <Icon
                          size={18}
                          weight="regular"
                          aria-hidden="true"
                          className="text-[color:var(--unit-brand)]"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </InfoCard>
          ) : (
            <PendingCard title="Contact channels pending">
              The official email and social accounts for this unit have not
              been published yet.
            </PendingCard>
          )}
        </div>
      </UnitSection>
    </div>
  );
}

/**
 * The landing white card with its 13px tracked kicker: the shared ground for
 * the About and Contact facts that are published, sitting beside the pending
 * cards so a filled block and an awaiting one read as the same object.
 */
function InfoCard({
  kicker,
  children,
}: {
  kicker: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${BORDER_CARD} relative flex w-full flex-col gap-5 rounded-3xl bg-white p-8`}
    >
      <p className={`${LABEL_SM} text-[#8796A5]`}>{kicker}</p>
      {children}
    </div>
  );
}
