"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BORDER_CARD,
  LABEL_XS,
} from "@/components/sections/landing/styles";
import { PendingCard } from "./section";

/**
 * The shared event fields plus the cover the card is led by, so the same
 * card renders the calendar's published rows and the demo entries alike.
 */
export type EventLike = {
  readonly day: string;
  readonly month: string;
  readonly title: string;
  readonly description: string;
  readonly tag: string;
  readonly cover: string;
};

/**
 * One Events section: the programme and its archive behind a tab pair, so
 * upcoming and past share a heading instead of standing as two sections.
 * Each event gets a card led by its cover — see `EventCard` for how the
 * photograph and the landing's date plate interlock — with every part
 * wearing the unit's theme vars instead of branch blue.
 *
 * The tabs are segmented pills in the hero badge's language: the active view
 * sits on the unit's tint with ink text, the resting one on plain copy. An
 * empty view keeps its designed pending card, so a unit with nothing
 * published reads as awaiting rather than broken.
 */
export function UnitEvents({
  upcoming,
  past,
  showCalendar,
  abbreviation,
}: {
  upcoming: readonly EventLike[];
  past: readonly EventLike[];
  /** The unit has rows in the shared calendar worth linking to. */
  showCalendar: boolean;
  abbreviation: string;
}) {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const events = view === "upcoming" ? upcoming : past;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-row items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-1">
          {(["upcoming", "past"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={`rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors ${
                view === key
                  ? "bg-[color:var(--unit-tint)] text-[color:var(--unit-ink)]"
                  : "text-[#4A5B6B] hover:bg-[color:var(--unit-hover)]"
              }`}
            >
              {key === "upcoming" ? "Upcoming" : "Past"}
            </button>
          ))}
        </div>
        {showCalendar ? (
          <Link
            href="/events"
            className="text-[15px] font-medium text-[color:var(--unit-ink)] underline-offset-4 hover:underline"
          >
            See the full calendar
          </Link>
        ) : null}
      </div>

      {events.length > 0 ? (
        <div className="grid w-full grid-cols-3 gap-10">
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      ) : view === "upcoming" ? (
        <PendingCard title="Session schedule pending">
          No upcoming events are published for {abbreviation} yet. The session
          schedule is listed here once confirmed.
        </PendingCard>
      ) : (
        <PendingCard title="Event archive pending">
          Past events for {abbreviation} are not archived publicly yet. Records
          are listed here as the branch publishes them.
        </PendingCard>
      )}
    </div>
  );
}

/**
 * The redesigned event card: a 16:10 cover leads, the tag rides the image
 * as a white pill, and the unit's tinted date plate straddles the image's
 * bottom edge — half on the photograph, half on the card — so the cover and
 * the landing's own date object interlock instead of stacking. Title and
 * copy sit below in the row's exact type. Covers are the branch's CC0 stock
 * (see `lib/photos.ts`), decorative: they claim nothing documentary.
 */
function EventCard({ event }: { event: EventLike }) {
  return (
    <article
      className={`${BORDER_CARD} flex flex-col overflow-hidden rounded-3xl bg-white`}
    >
      <div className="relative">
        <Image
          src={event.cover}
          alt=""
          width={960}
          height={600}
          sizes="346px"
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="absolute right-4 top-4 rounded-full border border-[#0b1b2b1a] bg-white px-[14px] py-2">
          <p className="whitespace-pre text-[13px] font-medium text-[color:var(--unit-ink)]">
            {event.tag}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <div className="relative z-10 -mt-12 flex w-[88px] flex-col items-center gap-0.5 self-start rounded-2xl border border-[color:var(--unit-line)] bg-white py-[14px]">
          <p className="text-[32px] font-semibold text-[color:var(--unit-ink)]">
            {event.day}
          </p>
          <p className={`${LABEL_XS} text-[color:var(--unit-ink)]`}>
            {event.month}
          </p>
        </div>
        <h3 className="text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B]">
          {event.title}
        </h3>
        <p className="text-[16px] leading-[1.6] text-[#4A5B6B]">
          {event.description}
        </p>
      </div>
    </article>
  );
}
