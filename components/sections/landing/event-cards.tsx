"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { EVENTS, PAST_EVENTS } from "./data";
import { SectionHeading } from "./heading";
import { EventCard, type EventRecord } from "@/components/sections/event-card";
import { PendingCard } from "@/components/sections/unit/section";

/**
 * Event cards: the events page's own composition of the programme.
 *
 * The chapter page's tabs, reused whole: one heading, one pair of segmented
 * pills — Upcoming over the published calendar, Past over the archive — and
 * the same three-up card grid underneath, so the branch calendar and a
 * chapter's Events section are the same object in two hues. The section sets
 * the unit vars to branch blue, the page's own accent, for the tabs' active
 * state; each card still resolves its colours from its own tag, so every
 * event keeps its hosting chapter's identity in either view.
 *
 * The empty view keeps the designed pending card rather than a blank grid,
 * so an archive the branch has not filled yet reads as awaited, not broken.
 */
export function LandingEventCards() {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  // Widened to the card's own record so the two tuples share one map.
  const events: readonly EventRecord[] =
    view === "upcoming" ? EVENTS : PAST_EVENTS;

  return (
    <section
      id="events"
      data-land="event-cards"
      className="flex w-full max-w-[1120px] flex-col items-start gap-10 px-10 pb-[120px]"
      style={
        {
          "--unit-brand": "#00629B",
          "--unit-ink": "#00629B",
          "--unit-tint": "#00629B14",
          "--unit-hover": "#00629B2E",
        } as CSSProperties
      }
    >
      <SectionHeading
        title="Upcoming and past events"
        lede="What the branch is running next, and what it has already run."
      />

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-row items-center gap-1">
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

        {events.length > 0 ? (
          <div className="grid w-full grid-cols-3 gap-10">
            {events.map((event) => (
              <EventCard key={event.title} event={event} />
            ))}
          </div>
        ) : view === "upcoming" ? (
          <PendingCard title="SCHEDULE PENDING">
            No upcoming events are published yet. The calendar is listed here
            once confirmed.
          </PendingCard>
        ) : (
          <PendingCard title="EVENT ARCHIVE PENDING">
            Past events are not archived publicly yet. Records are listed here
            as the branch publishes them.
          </PendingCard>
        )}
      </div>
    </section>
  );
}
