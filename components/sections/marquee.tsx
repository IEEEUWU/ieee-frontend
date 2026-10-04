import { tickerItems } from "@/lib/site";
import { societyInk } from "@/lib/units";

/**
 * Ticker.
 *
 * One continuous band of real charter scopes and real institutional facts. It
 * exists to do a single job: make the breadth of the branch legible in two
 * seconds, in a form that moves because a static list of five words would not.
 *
 * Implemented in CSS rather than JavaScript. The track holds two identical
 * copies and translates by exactly -50%, so the seam is arithmetically
 * impossible to see, and the whole thing runs off the main thread. It pauses on
 * hover and focus so it never moves under a reader who is trying to read it.
 */
export function Marquee() {
  const track = (
    <div className="marquee-track flex w-max shrink-0 items-center">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 ? "true" : undefined}
          className="flex shrink-0 items-center"
        >
          {tickerItems.map((item) => (
            <li
              key={`${copy}-${item.label}`}
              className="flex items-center gap-8 pr-8 text-[clamp(1.5rem,3.6vw,3rem)] font-extrabold leading-none tracking-[-0.035em] text-text"
            >
              <span style={
                item.societyId ? { color: societyInk(item.societyId) } : undefined
              }>
                {item.label}
              </span>
              <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );

  return (
    <section
      aria-label="Branch scope"
      className="overflow-hidden border-y border-border bg-secondary py-8 lg:py-10"
    >
      <div
        className="marquee edge-fade flex w-full"
        style={{ "--marquee-duration": "42s" } as React.CSSProperties}
      >
        {track}
      </div>
    </section>
  );
}