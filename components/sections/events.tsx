import { ArrowRight, CalendarPlus } from "@phosphor-icons/react/ssr";
import { societyById, societyInk } from "@/lib/units";
import {
  buildGoogleCalendarUrl,
  eventsByDateDesc,
  programmes,
  type PublicEvent,
} from "@/lib/events";
import { Shell } from "@/components/layout/shell";
import { Photo, SampleNotice } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";
import { EventGallery } from "@/components/sections/event-gallery";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * ISO date split into display parts.
 *
 * Rendered by hand rather than through `Intl.DateTimeFormat` on purpose. The
 * locale-formatted string a runtime produces varies with the reader's locale —
 * "3 March 2026" in one place and "March 3, 2026" in another — and this page's
 * register has to look like one document to everyone reading it. Splitting the
 * ISO string also avoids the timezone trap that makes `new Date("2026-03-03")`
 * render as the 2nd for anyone west of UTC.
 */
function formatDate(iso: string): { day: string; month: string; year: string } {
  const [year, month, day] = iso.split("-");
  return { day, month, year };
}

/** Two-digit plate number, zero padded, so the run of figures aligns. */
function plateNumber(index: number, total: number): string {
  return `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
}

/**
 * One event, as a plate in the horizontal run.
 *
 * The gallery replaced a text list, and the trap in that swap is reaching for the
 * obvious thing: five equal cards in a row, each the same width, each showing
 * the same fields at the same size. That is the exact shape this page exists to
 * avoid, and in a horizontal row it would read as a template even faster than it
 * would vertically.
 *
 * So the widths alternate. A wide plate shows more of the frame; a narrow one
 * crops in on it. The frames themselves all share one height, which is what
 * keeps the run's baseline straight — a contact sheet rather than a shelf of
 * differently-sized rectangles. Because the height is fixed and only the width
 * changes, the crop is produced by `object-cover` and no frame is ever
 * distorted to fit.
 *
 * Both the widths and the height are responsive, and deliberately so. Every
 * source frame is 3:2, so any frame box far from that ratio throws away most of
 * the picture — an earlier pass held a constant height at every breakpoint,
 * which left the narrow plate rendering at 0.64 on a phone and silently
 * discarding 57% of the image width. The values below keep every plate between
 * roughly 1.0 and 1.9 at every width, so the crop stays a crop rather than a
 * excision.
 *
 * The alternation is a function of position rather than a hard-coded layout, so
 * adding or removing an event re-rhythms the whole run instead of leaving one odd
 * plate at the end.
 *
 * The plate carries the society mark as a hairline segment above its own text,
 * because that is the only colour on it. The frame is duotoned into the brand
 * hue like every other photograph on the site; five different tints across five
 * frames would undo the palette discipline that keeps the society colours
 * readable as marks rather than as decoration.
 *
 * Rendered on the server and handed to `EventGallery` as a child, so this is
 * real HTML with no client-side data behind it.
 */
function EventPlate({
  event,
  index,
  total,
}: {
  event: PublicEvent;
  index: number;
  total: number;
}) {
  const { day, month, year } = formatDate(event.date);
  const society = societyById(event.societyId);
  const ink = societyInk(event.societyId);
  const wide = index % 2 === 0;

  return (
    <Reveal
      as="li"
      y={0}
      x={-12}
      className={`flex shrink-0 snap-start flex-col ${
        wide
          ? "w-[84vw] sm:w-[62vw] lg:w-[46vw] lg:max-w-[660px]"
          : "w-[58vw] sm:w-[44vw] lg:w-[32vw] lg:max-w-[440px]"
      }`}
    >
      <Photo
        photo={event.photo}
        sizes={
          wide
            ? "(min-width: 1024px) 660px, (min-width: 640px) 62vw, 84vw"
            : "(min-width: 1024px) 440px, (min-width: 640px) 44vw, 58vw"
        }
        className="h-[200px] sm:h-[260px] lg:h-[clamp(280px,40vh,420px)]"
      />

      {/* Society mark: a hairline segment, the plate's only colour. */}
      <div
        aria-hidden="true"
        className="mt-6 h-0.5 w-12"
        style={{ backgroundColor: ink ?? "var(--color-text)" }}
      />

      <div className="mt-5 flex items-baseline gap-4">
        <span className="label-mono text-subtle tabular-nums">
          {plateNumber(index, total)}
        </span>
        <time dateTime={event.date} className="label-mono tabular-nums" style={{ color: ink }}>
          {day} {MONTHS[Number(month) - 1]?.slice(0, 3)} {year}
        </time>
      </div>

      <h3 className="mt-4 text-[clamp(1.375rem,2.2vw,1.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
        {event.title}
      </h3>

      <p className="mt-3 max-w-[38ch] text-[14px] text-muted">
        <span className="sr-only">Hosted by </span>
        {society.name} · {event.location}
      </p>

      {event.note ? (
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-subtle">
          {event.note}
        </p>
      ) : null}

      {/* Action controls: RSVP / Register and Add to Google Calendar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 pt-2">
        <a
          href={event.rsvpUrl ?? "#join"}
          className="group inline-flex min-h-10 items-center gap-2 border border-text bg-text px-4 text-[13px] font-semibold text-background transition-colors duration-200 hover:border-primary hover:bg-primary"
        >
          <span>RSVP / Register</span>
          <ArrowRight
            size={14}
            weight="bold"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </a>

        <a
          href={buildGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 border border-border px-3.5 text-[13px] font-semibold text-text transition-colors duration-200 hover:border-text hover:bg-surface"
          title={`Add "${event.title}" to Google Calendar`}
        >
          <CalendarPlus size={16} weight="regular" aria-hidden="true" />
          <span>Add to Calendar</span>
        </a>
      </div>
    </Reveal>
  );
}

/**
 * Events.
 *
 * The public events register, as a gallery of plates scrolled sideways rather
 * than stacked, and it is deliberately two registers in one section rather than
 * one padded-out list.
 *
 * The row is a native horizontal scroller with snap points, sharing its scroll
 * mechanics with the society rail via `components/ui/scroller`. The plates
 * themselves are rendered on the server and handed to that scroller as children,
 * so the section gains a real scroll container without giving up its HTML.
 *
 * The dated register is currently seeded with sample records, flagged as such on
 * the page itself. That flag is not decoration: a fabricated event would be the
 * worst thing this site could ship, because a student would turn up on a day
 * that does not exist and conclude the whole organisation was fiction. So the
 * notice is rendered from a single flag in `lib/sample.ts`, and the plates carry
 * a standing note that the frames are illustrative — no photograph here claims to
 * show an actual branch activity.
 *
 * Underneath, the recurring programmes. Those are constitution rather than
 * calendar — society sessions, committee meetings, Section programmes are how a
 * branch is built — so they publish truthfully with no date attached.
 *
 * Data-driven end to end. Add a verified record to `publishedEvents`, with a
 * frame, and the gallery renders it, the headline rewrites itself, and the empty
 * state retires without any other change.
 */
export function Events() {
  const count = eventsByDateDesc.length;
  const hasEvents = count > 0;

  return (
    <section
      id="events"
      aria-labelledby="events-title"
      className="border-t border-border bg-surface"
    >
      <Shell>
        <div className="py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            <Reveal className="lg:col-span-5">
              <p className="label-mono text-primary">Public record</p>
              <h2
                id="events-title"
                className="mt-6 text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.98] tracking-[-0.035em]"
              >
                {hasEvents
                  ? "Events you can plan around."
                  : "Nothing scheduled to announce yet."}
              </h2>
              <p className="mt-6 max-w-[46ch] text-[clamp(1rem,1.25vw,1.1875rem)] leading-relaxed text-muted">
                {hasEvents
                  ? `${count} public event${count === 1 ? "" : "s"} confirmed for publication, each with a date and a venue.`
                  : "No public event has been confirmed for publication yet. This page will list one the day the branch confirms it."}
              </p>
              <div className="mt-8 max-w-[46ch]">
                <SampleNotice />
              </div>
            </Reveal>

            {/* The recurring programmes. Structural, so publishable today. */}
            <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
              <div className="border-t border-border">
                <h3 className="label-mono pt-6 text-subtle">
                  What does happen under the branch
                </h3>
                <ul className="mt-6">
                  {programmes.map((programme) => (
                    <li
                      key={programme.id}
                      className="grid grid-cols-1 gap-1 border-t border-border-subtle py-5 sm:grid-cols-12 sm:gap-6"
                    >
                      <span className="text-[15px] font-semibold sm:col-span-4">
                        {programme.title}
                      </span>
                      <span className="text-[14px] leading-relaxed text-muted sm:col-span-8">
                        {programme.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {hasEvents ? (
            <>
              <div className="mt-16 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-border pt-6 lg:mt-24">
                <h3 className="label-mono text-subtle">Dated register</h3>
                <p className="label-mono text-subtle">
                  {count} record{count === 1 ? "" : "s"} · frames illustrative
                </p>
              </div>
              <div className="mt-10">
                <EventGallery label="Public events" count={count}>
                  {eventsByDateDesc.map((event, index) => (
                    <EventPlate
                      key={event.id}
                      event={event}
                      index={index}
                      total={count}
                    />
                  ))}
                </EventGallery>
              </div>
            </>
          ) : null}
        </div>
      </Shell>
    </section>
  );
}