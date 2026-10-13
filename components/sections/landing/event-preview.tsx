import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Quotes } from "@phosphor-icons/react/ssr";
import { type CalendarEvent } from "./data";
import { SectionHeading } from "./heading";
import { BORDER_BTN2, BORDER_CARD, RULE_BOTTOM, RULE_TOP } from "./styles";
import { EventCard } from "@/components/sections/event-card";
import { photoBySrc } from "@/lib/photos";
import { societies } from "@/lib/units";

/** The venue's three published shapes, set for reading. */
const MODE_LABEL = {
  online: "Online",
  "in-person": "In person",
  hybrid: "Hybrid",
} as const;

/**
 * Event preview: one dated session, responsive layout from mobile to desktop.
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
      className="flex w-full max-w-[1120px] flex-col gap-10 sm:gap-16 px-4 sm:px-6 md:px-10 pb-16 sm:pb-24 md:pb-[120px]"
      style={
        {
          "--unit-brand": brand,
          "--unit-ink": ink,
          "--unit-tint": `${brand}14`,
          "--unit-hover": `${brand}2E`,
        } as CSSProperties
      }
    >
      <div className="flex w-full flex-col gap-6 sm:gap-10">
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

        {/* Masthead */}
        <header className="relative w-full overflow-hidden sm:overflow-visible">
          <div className="flex w-full max-w-[760px] flex-col items-start gap-4 sm:gap-6">
            <h1 className="text-[34px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-semibold leading-[1.08] tracking-[-1px] sm:tracking-[-1.5px] md:tracking-[-2.5px] text-[#0B1B2B]">
              {event.title}
            </h1>
            <p className="max-w-[660px] text-[16px] sm:text-[19px] leading-[1.6] text-[#4A5B6B]">
              {event.description}
            </p>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
              <Link
                href={`/events/${event.slug}/register`}
                className="rounded-full bg-[#00629B] px-7 py-3.5 sm:py-4 text-center text-[15px] sm:text-[16px] font-semibold text-white transition-colors hover:bg-[#005282]"
              >
                Register as Participant
              </Link>
              <Link
                href={`/events/${event.slug}/apply-oc`}
                className={`${BORDER_BTN2} rounded-full bg-white px-7 py-3.5 sm:py-4 text-center text-[15px] sm:text-[16px] font-semibold text-[#0B1B2B] transition-colors hover:bg-[#EBF2F7]`}
              >
                Join Organising Committee
              </Link>
            </div>
          </div>
          {host ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-4 sm:-top-6 right-0 select-none text-[90px] sm:text-[140px] md:text-[190px] leading-none font-bold tracking-[-4px] sm:tracking-[-6px] text-(--unit-brand) opacity-[0.06] sm:opacity-[0.07]"
            >
              {host.abbreviation}
            </span>
          ) : null}
        </header>
      </div>

      {/* The record beside its plate */}
      <div className="flex w-full flex-col lg:flex-row items-start gap-8 lg:gap-15">
        <dl className={`${RULE_TOP} w-full flex-1`}>
          <div className={`${RULE_BOTTOM} flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-2 py-4 sm:py-5`}>
            <dt className="label-mono w-full sm:w-[170px] shrink-0 text-[#667585]">
              DATE
            </dt>
            <dd className="font-mono text-[20px] sm:text-[22px] font-semibold text-[#00629B]">
              {event.day} {event.month}
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-2 py-4 sm:py-5`}>
            <dt className="label-mono w-full sm:w-[170px] shrink-0 text-[#667585]">
              TIME
            </dt>
            <dd className="font-mono text-[20px] sm:text-[22px] font-semibold text-[#00629B]">
              {event.time}
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 px-2 py-4 sm:py-5`}>
            <dt className="label-mono w-full sm:w-[170px] shrink-0 text-[#667585]">
              VENUE
            </dt>
            <dd className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="rounded-full bg-[#00629B14] px-3 py-1 text-[13px] font-medium text-[#00629B]">
                {MODE_LABEL[event.venue.mode]}
              </span>
              <span className="text-[16px] sm:text-[17px] text-[#4A5B6B]">
                {event.venue.place}
              </span>
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 px-2 py-4 sm:py-5`}>
            <dt className="label-mono w-full sm:w-[170px] shrink-0 text-[#667585]">
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
                <span className="text-[15px] sm:text-[16px] font-medium text-[#0B1B2B]">
                  {event.tag}
                </span>
              )}
            </dd>
          </div>

          <div className={`${RULE_BOTTOM} flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-2 py-4 sm:py-5`}>
            <dt className="label-mono w-full sm:w-[170px] shrink-0 text-[#667585]">
              REGISTRATION
            </dt>
            <dd className="flex w-full sm:w-auto flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
              <Link
                href={`/events/${event.slug}/register`}
                className="inline-flex items-center justify-center rounded-full bg-[#00629B] px-5 py-2.5 text-[14px] sm:text-[15px] font-semibold text-white transition-colors hover:bg-[#005282]"
              >
                Register as Participant
              </Link>
              <Link
                href={`/events/${event.slug}/apply-oc`}
                className={`${BORDER_BTN2} inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[14px] sm:text-[15px] font-semibold text-[#0B1B2B] transition-colors hover:bg-[#EBF2F7]`}
              >
                Join Organising Committee
              </Link>
            </dd>
          </div>
        </dl>

        <figure className="w-full lg:w-[440px] shrink-0">
          <div
            className={`${BORDER_CARD} overflow-hidden rounded-3xl bg-white`}
          >
            <Image
              src={event.cover}
              alt={photo?.alt ?? ""}
              width={photo?.width ?? 960}
              height={photo?.height ?? 640}
              sizes="(max-width: 1024px) 100vw, 440px"
              priority
              className="aspect-3/2 w-full object-cover"
            />
          </div>
          <figcaption className="label-mono mt-3 text-[#667585]">
            Illustrative CC0 stock frame — not a photograph of this event
          </figcaption>
        </figure>
      </div>

      {/* Collaboration */}
      <div
        className={`${BORDER_CARD} flex w-full flex-col md:flex-row items-start gap-6 md:gap-10 rounded-3xl bg-white p-6 sm:p-8`}
      >
        <div className="flex w-full md:w-[300px] shrink-0 flex-col items-start gap-2.5 sm:gap-3">
          <p className="label-mono text-[#667585]">Collaboration</p>
          <p className="text-[20px] sm:text-[24px] leading-[1.2] font-semibold tracking-[-0.4px] text-[#0B1B2B]">
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
        <p className="flex-1 text-[15px] sm:text-[17px] leading-[1.6] text-[#4A5B6B]">
          {collaboration.description}
        </p>
      </div>

      {/* Sponsors */}
      <div className="flex w-full flex-col items-start gap-4 sm:gap-5">
        <p className="label-mono text-[#667585]">Sponsored by</p>
        <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3">
          {event.sponsors.map((sponsor) => (
            <span
              key={sponsor}
              className={`${BORDER_CARD} rounded-full bg-white px-4 sm:px-5 py-2 sm:py-3 text-[14px] sm:text-[16px] font-medium text-[#0B1B2B]`}
            >
              {sponsor}
            </span>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="flex w-full flex-col items-start gap-8 sm:gap-12">
        <SectionHeading
          title="Gallery"
          lede="Illustrative frames standing in until the event's own photographs arrive."
        />
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="aspect-3/2 w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      <div className="flex w-full flex-col items-start gap-8 sm:gap-12">
        <SectionHeading
          title="Feedback"
          lede="What attendees said after earlier sessions."
        />
        <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {event.feedbacks.map((feedback) => (
            <figure
              key={feedback.name}
              className={`${BORDER_CARD} flex flex-col items-start gap-4 sm:gap-5 rounded-3xl bg-white p-6 sm:p-8`}
            >
              <Quotes
                size={36}
                weight="fill"
                aria-hidden="true"
                className="text-(--unit-brand)"
              />
              <blockquote className="text-[16px] sm:text-[18px] leading-[1.6] text-[#0B1B2B]">
                “{feedback.quote}”
              </blockquote>
              <figcaption className="flex flex-col gap-0.5 sm:gap-1">
                <span className="text-[14px] sm:text-[15px] font-semibold text-[#0B1B2B]">
                  {feedback.name}
                </span>
                <span className="text-[13px] sm:text-[14px] text-[#667585]">
                  {feedback.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Speaker */}
      <div className="flex w-full flex-col items-start gap-8 sm:gap-12">
        <SectionHeading
          title="Speaker"
          lede="Who is on the platform, and what they bring to it."
        />
        <div
          className={`${BORDER_CARD} flex w-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 rounded-3xl bg-white p-6 sm:p-8`}
        >
          <Image
            src={event.speaker.photo}
            alt=""
            width={192}
            height={192}
            sizes="192px"
            className="h-[140px] w-[140px] sm:h-[192px] sm:w-[192px] shrink-0 rounded-2xl object-cover"
          />
          <div className="flex flex-col gap-2 pt-1">
            <h3 className="text-[20px] sm:text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B]">
              {event.speaker.name}
            </h3>
            <p className="text-[14px] sm:text-[15px] font-medium text-[#4A5B6B]">
              {event.speaker.title}
            </p>
            <p className="max-w-[720px] pt-1 sm:pt-2 text-[15px] sm:text-[16px] leading-[1.6] text-[#4A5B6B]">
              {event.speaker.bio}
            </p>
          </div>
        </div>
      </div>

      {/* The rest of the programme */}
      {more.length > 0 ? (
        <div className="flex w-full flex-col items-start gap-8 sm:gap-12">
          <SectionHeading
            title="More from the calendar"
            lede="The other dated sessions the branch has published."
          />
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {more.map((other) => (
              <EventCard key={other.slug} event={other} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
