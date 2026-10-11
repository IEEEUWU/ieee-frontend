"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { EVENTS, PAST_EVENTS } from "./data";
import { SectionHeading } from "./heading";
import { EventCard, type EventRecord } from "@/components/sections/event-card";
import { PendingCard } from "@/components/sections/unit/section";

/**
 * Event cards: the events page's own composition of the programme.
 * Responsive: 1-col on mobile, 2-col on tablets, 3-col on desktop.
 */
export function LandingEventCards() {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const events: readonly EventRecord[] =
    view === "upcoming" ? EVENTS : PAST_EVENTS;

  return (
    <section
      id="events"
      data-land="event-cards"
      className="flex w-full max-w-[1120px] flex-col items-start gap-8 sm:gap-10 px-4 sm:px-6 md:px-10 pb-16 sm:pb-24 md:pb-[120px]"
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
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
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
