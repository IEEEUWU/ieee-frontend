import Link from "next/link";
import { SectionHeading } from "./heading";
import { EventCard } from "@/components/sections/event-card";
import { CHAPTERS, TIMEFRAMES, eventCard, eventFilters, eventQuery } from "@/lib/events/shared";
import { loadPublicEvents, publicEventCover } from "@/lib/events/server";
const button = "rounded-full border border-[#0B1B2B26] px-5 py-2.5 text-[15px] font-medium text-[#00629B] hover:bg-[#00629B14]";
export async function LandingEventCards({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  let filters;
  try { filters = eventFilters(searchParams); }
  catch (error) { return <section className="w-full max-w-[1120px] px-10 pb-30"><p role="alert" className="mb-6 text-[#A6192E]">{error instanceof Error ? error.message : "Check your event filters."}</p><Link href="/events" className={button}>Reset filters</Link></section>; }
  const catalogue = await loadPublicEvents(filters);
  return <section id="events" data-land="event-cards" className="flex w-full max-w-[1120px] flex-col items-start gap-10 px-10 pb-[120px]">
    <SectionHeading title="Upcoming and past events" lede="What the branch is running next, and what it has already run." />
    <nav aria-label="Event timeframe" className="flex flex-wrap gap-2">{TIMEFRAMES.map((timeframe) => <Link key={timeframe} href={`/events?${eventQuery({ ...filters, timeframe, page: 1 })}`} aria-current={filters.timeframe === timeframe ? "page" : undefined} className={`${button} capitalize ${filters.timeframe === timeframe ? "bg-[#00629B14]" : ""}`}>{timeframe === "all" ? "All events" : timeframe}</Link>)}</nav>
    <form action="/events" className="flex w-full flex-wrap items-end gap-4">
      <input type="hidden" name="timeframe" value={filters.timeframe} /><input type="hidden" name="per_page" value={filters.per_page} />
      <label className="flex flex-1 flex-col gap-2 text-sm text-[#4A5B6B]">Search events<input name="search" defaultValue={filters.search} maxLength={255} placeholder="Search by title or description" className="min-w-60 rounded-xl border border-[#0B1B2B26] bg-white px-4 py-3" /></label>
      <label className="flex flex-col gap-2 text-sm text-[#4A5B6B]">Chapter<select name="chapter" defaultValue={filters.chapter} className="rounded-xl border border-[#0B1B2B26] bg-white px-4 py-3"><option value="">All chapters</option>{CHAPTERS.map((chapter) => <option key={chapter}>{chapter}</option>)}</select></label>
      <button type="submit" className="rounded-full bg-[#00629B] px-6 py-3 text-white hover:bg-[#005282]">Find events</button>
    </form>
    {catalogue.data.length ? <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">{catalogue.data.map((event) => <EventCard key={event.id} event={eventCard(event, publicEventCover(event.cover_image_url !== undefined ? event.cover_image_url : event.cover_image))} />)}</div> : <div role="status" className="w-full rounded-3xl border border-[#0B1B2B26] bg-white p-8 text-[#4A5B6B]">No published events match these filters.</div>}
    <nav aria-label="Event pages" className="flex w-full flex-wrap items-center justify-between gap-4 text-sm text-[#4A5B6B]"><p>Showing {catalogue.from ?? 0}–{catalogue.to ?? 0} of {catalogue.total} events</p><div className="flex items-center gap-4">{filters.page > 1 && <Link className={button} href={`/events?${eventQuery({ ...filters, page: filters.page - 1 })}`}>Previous</Link>}<span>Page {catalogue.current_page} of {catalogue.last_page}</span>{filters.page < catalogue.last_page && <Link className={button} href={`/events?${eventQuery({ ...filters, page: filters.page + 1 })}`}>Next</Link>}</div></nav>
  </section>;
}
