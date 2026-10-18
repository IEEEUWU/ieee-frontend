import Link from "next/link";
import type { ReactNode } from "react";
import { EventImage } from "@/components/sections/event-image";
import { loadPublicEvents, publicEventCover } from "@/lib/events/server";
import { eventCard, eventFilters } from "@/lib/events/shared";
import { SectionHeading } from "./heading";
import { BORDER_TAG, LABEL_XS, RULE_BOTTOM, RULE_TOP } from "./styles";

/**
 * Dated rows under a split heading: date plate, compact cover,
 * title + description, and chapter tag, separated by hairline rules.
 *
 * The whole row is the link to the event's own preview page, so the calendar
 * leads somewhere instead of only describing it: the title turns brand blue
 * on hover, and `:focus-visible` marks the row for keyboard readers.
 */
function EventsSection({ children }: { children: ReactNode }) {
  return (
    <section
      id="events"
      data-land="events"
      className="flex w-full max-w-280 flex-col items-start gap-12 px-10 pb-30"
    >
      <SectionHeading
        title="Upcoming events"
        lede="Workshops, competitions and talks open to every UWU student."
      />
      <div className={`${RULE_TOP} flex w-full flex-col gap-0`}>
        {children}
      </div>
      <Link href="/events?timeframe=all" className="inline-flex items-center rounded-full bg-[#00629B] px-7 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[#005282]">See all events</Link>
    </section>
  );
}

export function LandingEventsLoading() {
  return <EventsSection><p role="status" className={`${RULE_BOTTOM} px-2 py-8 text-[16px] leading-[1.6] text-[#4A5B6B]`}>Loading upcoming events…</p></EventsSection>;
}

export async function LandingEvents() {
  let catalogue;
  try { catalogue = await loadPublicEvents(eventFilters({ timeframe: "upcoming", per_page: "3" })); }
  catch {
    return <EventsSection><div className={`${RULE_BOTTOM} px-2 py-8 text-[16px] leading-[1.6] text-[#4A5B6B]`}><p role="status">Upcoming events are temporarily unavailable.</p><Link href="/events" className="mt-3 inline-block font-medium text-[#00629B] hover:underline">Browse events</Link></div></EventsSection>;
  }
  const events = catalogue.data.map((event) => eventCard(event, publicEventCover(event.cover_image_url !== undefined ? event.cover_image_url : event.cover_image)));
  return <EventsSection>
        {events.map((event) => (
          <Link
            key={event.slug}
            href={`/events/${encodeURIComponent(event.slug)}`}
            className={`${RULE_BOTTOM} group flex w-full flex-row items-center gap-10 px-2 py-8`}
          >
            <div className="flex w-22 shrink-0 flex-col items-center gap-0.5 rounded-2xl bg-[#00629B14] px-0 py-3.5">
              <p className="text-[32px] font-semibold text-[#00629B]">
                {event.day}
              </p>
              <p className={`${LABEL_XS} text-[#00629B]`}>{event.month}</p>
            </div>
            <EventImage src={event.cover} alt="" width={96} height={64} sizes="96px" className="hidden h-16 w-24 shrink-0 rounded-xl object-cover md:block" />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
              <div className="w-full">
                <h3 className="break-words text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B] transition-colors group-hover:text-[#00629B]">
                  {event.title}
                </h3>
              </div>
              <div>
                <p className="line-clamp-2 text-[16px] leading-[1.6] text-[#4A5B6B]">
                  {event.description}
                </p>
              </div>
            </div>
            <div className={`${BORDER_TAG} shrink-0 rounded-full px-3.5 py-2`}>
              <p className="whitespace-pre text-[13px] font-medium text-[#00629B]">
                {event.tag}
              </p>
            </div>
          </Link>
        ))}
        {!events.length && <p className={`${RULE_BOTTOM} px-2 py-8 text-[16px] leading-[1.6] text-[#4A5B6B]`}>No upcoming events are published yet. Check back soon.</p>}
    </EventsSection>;
}
