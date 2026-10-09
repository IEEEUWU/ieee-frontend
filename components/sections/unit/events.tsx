"use client";

import Link from "next/link";
import { useState } from "react";
import { EventCard, type EventRecord } from "@/components/sections/event-card";
import { PendingCard } from "./section";

/**
 * The chapter page's event records are the shared card's records: one shape
 * for the calendar's published rows and this file's demo entries alike. The
 * alias keeps the name this page has always exported; the card itself lives
 * in `components/sections/event-card.tsx`, so every grid in the site renders
 * the same object.
 */
export type EventLike = EventRecord;

/**
 * One Events section: the programme and its archive behind a tab pair, so
 * upcoming and past share a heading instead of standing as two sections.
 * Each event gets the shared card — a 16:10 cover led, the tag riding the
 * frame, the date plate straddling its bottom edge — wearing the hosting
 * chapter's own colours, resolved from the event's tag.
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
                  ? "bg-(--unit-tint) text-(--unit-ink)"
                  : "text-[#4A5B6B] hover:bg-(--unit-hover)"
              }`}
            >
              {key === "upcoming" ? "Upcoming" : "Past"}
            </button>
          ))}
        </div>
        {showCalendar ? (
          <Link
            href="/events"
            className="text-[15px] font-medium text-(--unit-ink) underline-offset-4 hover:underline"
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
        <PendingCard title="SESSION SCHEDULE PENDING">
          No upcoming events are published for {abbreviation} yet. The session
          schedule is listed here once confirmed.
        </PendingCard>
      ) : (
        <PendingCard title="EVENT ARCHIVE PENDING">
          Past events for {abbreviation} are not archived publicly yet. Records
          are listed here as the branch publishes them.
        </PendingCard>
      )}
    </div>
  );
}
