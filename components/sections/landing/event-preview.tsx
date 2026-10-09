import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Quotes } from "@phosphor-icons/react/ssr";
import { type CalendarEvent } from "./data";
import { SectionHeading } from "./heading";
import { BORDER_BTN2, BORDER_CARD, RULE_BOTTOM, RULE_TOP } from "./styles";
import { EventCard } from "@/components/sections/event-card";
import { photoBySrc } from "@/lib/photos";
import { site } from "@/lib/site";
import { societies } from "@/lib/units";

/** The venue's three published shapes, set for reading. */
const MODE_LABEL = {
  online: "Online",
  "in-person": "In person",
  hybrid: "Hybrid",
} as const;

/**
 * Event preview: one dated session, set as a record rather than a poster.
 *
 * The page opens on type, not on a photograph: the title at the chapter
 * hero's own 72px, the description as prose, the two actions the chapter hero
 * carries — and behind them the system's ghosted monogram motif, the hosting
 * chapter's abbreviation in its brand hue at 7%, so the reader knows whose
 * event this is before reaching the register.
 *
 * Below, the facts are a hairline-ruled register in the homepage events
 * section's own idiom: label and value per row, no card, no box. The date and
 * time wear the mono register ("dates, register labels"), the venue its mode
 * chip and room, the chapter a pill in its own tint, and registration the one
 * button a row may carry — solid brand blue when a form URL exists, an honest
 * opens-soon state when it does not. What the branch has not published renders
 * as that same designed state instead of going missing. The cover is a plate:
 * framed, captioned and demoted to figure scale, because it is stock imagery
 * that shows no branch activity and must not lead a page about one.
 *
 * The record is followed by the bands the full event carries: the
 * collaboration card (partner credit plus the description of who they are,
 * chip linking to a chapter's portal when the partner is one of ours), the
 * sponsor wordmarks, the gallery, attendees' feedback, and the speaker. Each
 * is a section in the landing's own voice — white cards on the same canvas,
 * one hue per page.
 *
 * The two custom properties are the chapter page's recipe: one hue per page,
 * the host's, split `brand` for fills and the ghost, `ink` for anything read
 * as type. A tag that matches no society falls back to branch blue and drops
 * the ghost rather than borrowing an identity it does not have. The closing
 * grid renders the shared event card, which resolves its own colours from its
 * own tag and so never picks up this chapter's hue beside it.
 */
export function LandingEventPreview({
  event,
  more,
}: {
  event: CalendarEvent;
  /** The remaining published events, for the closing grid. */
  more: readonly CalendarEvent[];
}) {
  const photo = photoBySrc[event.cover];
  const host = societies.find(
    (unit) => unit.name === event.tag || unit.abbreviation === event.tag,
  );
  const brand = host?.colour.brand ?? "#00629B";
  const ink = host?.colour.ink ?? "#00629B";

  const collaboration = event.collaboration;
  // A partner that is one of our own chapters resolves to its portal, so the
  // credit links home; an external body is credited, never linked.
  const collaborator =
    collaboration.kind === "chapter"
      ? societies.find((unit) => collaboration.name.includes(unit.name))
      : undefined;
  const kindLabel =
    collaboration.kind === "chapter" ? "Partner chapter" : "External organisation";
  const chipShell =
    "inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#0B1B2B]";

  return (
    <section
      data-land="event-preview"
      className="flex w-full max-w-[1120px] flex-col gap-16 px-10 pb-[120px]"
      style={
        {
          "--unit-brand": brand,
          "--unit-ink": ink,
          "--unit-tint": `${brand}14`,
          "--unit-hover": `${brand}2E`,
        } as CSSProperties
      }
    >
      <div className="flex w-full flex-col gap-10">
        <Link
          href="/events"
          className="group inline-flex w-fit items-center gap-2 text-[13px] font-medium text-[#667585] transition-colors hover:text-[#00629B]"
        >
          <ArrowLeft
            size={14}
            weight="bold"
            aria-hidden="true"
            className="transition-transform group-hover:-translate-x-0.5"
          />
          All events
        </Link>

        {/* Masthead — type at the hero's full strength, with the host's
            monogram ghosted behind the right margin. The ghost is texture that
            happens to carry a fact, so it is hidden from assistive tech and
            never competes with the heading. */}
        <header className="relative w-full">
          <div className="flex w-full max-w-[760px] flex-col items-start gap-6">
            <h1 className="text-[72px] font-semibold leading-[1.05] tracking-[-2.5px] text-[#0B1B2B]">
              {event.title}
            </h1>
            <p className="max-w-[660px] text-[19px] leading-[1.6] text-[#4A5B6B]">
              {event.description}
            </p>
            <div className="flex flex-row items-start gap-3 pt-1">
              <Link
                href="/#join"
                className="rounded-full bg-[#00629B] px-7 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[#005282]"
              >
                {site.joinLabel}
              </Link>
              <Link
                href="/events"
                className={`${BORDER_BTN2} rounded-full bg-white px-7 py-4 text-[16px] font-semibold text-[#0B1B2B] transition-colors hover:bg-[#EBF2F7]`}
              >
                See the full calendar
              </Link>
            </div>
          </div>
          {host ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 right-0 select-none text-[190px] leading-none font-bold tracking-[-6px] text-(--unit-brand) opacity-[0.07]"
            >
              {host.abbreviation}
            </span>
          ) : null}
        </header>
      </div>

      {/* The record beside its plate: facts on the ground under hairlines —
          the homepage events rows' construction — and the single white card
          holding the photograph, framed as a figure with its credit line. */}
      <div className="flex w-full flex-row items-start gap-15">
        <dl className={`${RULE_TOP} w-full flex-1`}>
          <div className={`${RULE_BOTTOM} flex items-center gap-6 px-2 py-5`}>
            <dt className="label-mono w-[170px] shrink-0 text-[#667585]">
              DATE
            </dt>
            <dd className="font-mono text-[22px] font-semibold text-[#00629B]">
              {event.day} {event.month}
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex items-center gap-6 px-2 py-5`}>
            <dt className="label-mono w-[170px] shrink-0 text-[#667585]">
              TIME
            </dt>
            <dd className="font-mono text-[22px] font-semibold text-[#00629B]">
              {event.time}
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex items-center gap-6 px-2 py-5`}>
            <dt className="label-mono w-[170px] shrink-0 text-[#667585]">
              VENUE
            </dt>
            <dd className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="rounded-full bg-[#00629B14] px-3 py-1.5 text-[13px] font-medium text-[#00629B]">
                {MODE_LABEL[event.venue.mode]}
              </span>
              <span className="text-[17px] text-[#4A5B6B]">
                {event.venue.place}
              </span>
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex items-center gap-6 px-2 py-5`}>
            <dt className="label-mono w-[170px] shrink-0 text-[#667585]">
              HOSTED BY
            </dt>
            <dd>
              {host ? (
                <Link
                  href={host.portalUrl ?? "/events"}
                  className="inline-flex items-center rounded-full bg-(--unit-tint) px-3.5 py-1.5 text-[14px] font-medium text-(--unit-ink) transition-colors hover:bg-(--unit-hover)"
                >
                  {event.tag}
                </Link>
              ) : (
                <span className="text-[16px] font-medium text-[#0B1B2B]">
                  {event.tag}
                </span>
              )}
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex items-center gap-6 px-2 py-5`}>
            <dt className="label-mono w-[170px] shrink-0 text-[#667585]">
              REGISTRATION
            </dt>
            <dd>
              {event.registration ? (
                <a
                  href={event.registration}
                  className="inline-flex items-center rounded-full bg-[#00629B] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#005282]"
                >
                  Register now
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className={`${BORDER_BTN2} inline-flex items-center rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-[#667585]`}
                >
                  Registration opens soon
                </span>
              )}
            </dd>
          </div>
        </dl>

        <figure className="w-[440px] shrink-0">
          <div
            className={`${BORDER_CARD} overflow-hidden rounded-3xl bg-white`}
          >
            <Image
              src={event.cover}
              alt={photo?.alt ?? ""}
              width={photo?.width ?? 960}
              height={photo?.height ?? 640}
              sizes="440px"
              priority
              className="aspect-3/2 w-full object-cover"
            />
          </div>
          <figcaption className="label-mono mt-3 text-[#667585]">
            Illustrative CC0 stock frame — not a photograph of this event
          </figcaption>
        </figure>
      </div>

      {/* Collaboration: the partner credited by name and kind, with the
          description of who they are beside it. A chapter partner links to its
          portal in the page's own ink; an external body is credited without a
          link the branch cannot vouch for. */}
      <div
        className={`${BORDER_CARD} flex w-full flex-row items-start gap-10 rounded-3xl bg-white p-8`}
      >
        <div className="flex w-[300px] shrink-0 flex-col items-start gap-3">
          <p className="label-mono text-[#667585]">Collaboration</p>
          <p className="text-[24px] leading-[1.2] font-semibold tracking-[-0.4px] text-[#0B1B2B]">
            {collaboration.name}
          </p>
          {collaborator ? (
            <Link
              href={collaborator.portalUrl ?? "/events"}
              className={`${chipShell} transition-colors hover:border-(--unit-ink) hover:text-(--unit-ink)`}
            >
              {kindLabel}
            </Link>
          ) : (
            <span className={chipShell}>{kindLabel}</span>
          )}
        </div>
        <p className="flex-1 text-[17px] leading-[1.6] text-[#4A5B6B]">
          {collaboration.description}
        </p>
      </div>

      {/* Sponsors: names set as wordmarks on the same white pills — the
          label introduces the list, it is not a kicker over a heading. */}
      <div className="flex w-full flex-col items-start gap-5">
        <p className="label-mono text-[#667585]">Sponsored by</p>
        <div className="flex flex-row flex-wrap items-center gap-3">
          {event.sponsors.map((sponsor) => (
            <span
              key={sponsor}
              className={`${BORDER_CARD} rounded-full bg-white px-5 py-3 text-[16px] font-medium text-[#0B1B2B]`}
            >
              {sponsor}
            </span>
          ))}
        </div>
      </div>

      {/* Gallery: the record's photographs at figure scale, the same framed
          white cards as the plate above. */}
      <div className="flex w-full flex-col items-start gap-12">
        <SectionHeading
          title="Gallery"
          lede="Illustrative frames standing in until the event's own photographs arrive."
        />
        <div className="grid w-full grid-cols-3 gap-10">
          {event.gallery.map((src) => {
            const frame = photoBySrc[src];
            return (
              <div
                key={src}
                className={`${BORDER_CARD} overflow-hidden rounded-3xl bg-white`}
              >
                <Image
                  src={src}
                  alt={frame?.alt ?? ""}
                  width={frame?.width ?? 960}
                  height={frame?.height ?? 640}
                  sizes="320px"
                  className="aspect-3/2 w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback: attendees in their own words, attributed the way the
          committee attributes people — no stars, no counts the branch does
          not have. */}
      <div className="flex w-full flex-col items-start gap-12">
        <SectionHeading
          title="Feedback"
          lede="What attendees said after earlier sessions."
        />
        <div className="grid w-full grid-cols-2 gap-8">
          {event.feedbacks.map((feedback) => (
            <figure
              key={feedback.name}
              className={`${BORDER_CARD} flex flex-col items-start gap-5 rounded-3xl bg-white p-8`}
            >
              <Quotes
                size={40}
                weight="fill"
                aria-hidden="true"
                className="text-(--unit-brand)"
              />
              <blockquote className="text-[18px] leading-[1.6] text-[#0B1B2B]">
                “{feedback.quote}”
              </blockquote>
              <figcaption className="flex flex-col gap-1">
                <span className="text-[15px] font-semibold text-[#0B1B2B]">
                  {feedback.name}
                </span>
                <span className="text-[14px] text-[#667585]">
                  {feedback.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Speaker: portrait on the branch's people placeholder, name and
          session role beside the bio. */}
      <div className="flex w-full flex-col items-start gap-12">
        <SectionHeading
          title="Speaker"
          lede="Who is on the platform, and what they bring to it."
        />
        <div
          className={`${BORDER_CARD} flex w-full flex-row items-start gap-8 rounded-3xl bg-white p-8`}
        >
          <Image
            src={event.speaker.photo}
            alt=""
            width={192}
            height={192}
            sizes="192px"
            className="h-[192px] w-[192px] shrink-0 rounded-2xl object-cover"
          />
          <div className="flex flex-col gap-2 pt-1">
            <h3 className="text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B]">
              {event.speaker.name}
            </h3>
            <p className="text-[15px] font-medium text-[#4A5B6B]">
              {event.speaker.title}
            </p>
            <p className="max-w-[720px] pt-2 text-[16px] leading-[1.6] text-[#4A5B6B]">
              {event.speaker.bio}
            </p>
          </div>
        </div>
      </div>

      {/* The rest of the programme: the shared card again, each linking on to
          its own preview. */}
      {more.length > 0 ? (
        <div className="flex w-full flex-col items-start gap-12">
          <SectionHeading
            title="More from the calendar"
            lede="The other dated sessions the branch has published."
          />
          <div className="grid w-full grid-cols-3 gap-10">
            {more.map((other) => (
              <EventCard key={other.slug} event={other} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
