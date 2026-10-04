"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import { societies } from "@/lib/units";
import {
  SCROLL_HINT,
  ScrollArrow,
  ScrollRule,
  TRACK_CLASS,
  useEdgeScroll,
} from "@/components/ui/scroller";

/**
 * Society rail: the page's first horizontal row.
 *
 * Five chartered societies, each card carrying its own identity colour as a top
 * edge, scrolled sideways through a native scroll container with snap points.
 *
 * The scroll mechanics are not written here. They live in `components/ui/
 * scroller` and are shared with the events gallery, because two copies of a
 * scroll listener and a pair of edge booleans is a bug waiting to happen — one
 * of them would get the keyboard behaviour and the other would not.
 *
 * Content is fully readable without any interaction at all. The arrows and the
 * progress rule are an enhancement for pointer users, never the only way
 * through.
 */
export function SocietyRail() {
  const { scroller, progressBar, atStart, atEnd, page } =
    useEdgeScroll<HTMLUListElement>();

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between gap-6">
        <p className="text-[13px] text-subtle">{SCROLL_HINT}</p>
        <div className="flex items-center gap-2">
          <ScrollArrow
            label="Previous societies"
            disabled={atStart}
            onClick={() => page(-1)}
          >
            <ArrowLeft size={18} weight="regular" aria-hidden="true" />
          </ScrollArrow>
          <ScrollArrow
            label="Next societies"
            disabled={atEnd}
            onClick={() => page(1)}
          >
            <ArrowRight size={18} weight="regular" aria-hidden="true" />
          </ScrollArrow>
        </div>
      </div>

      <ul
        ref={scroller}
        tabIndex={0}
        aria-label="The five chartered societies"
        className={`${TRACK_CLASS} gap-4`}
      >
        {societies.map((society, index) => (
          <li
            key={society.id}
            className="group relative w-[78vw] max-w-[380px] shrink-0 snap-start border border-border bg-background sm:w-[46vw] lg:w-[400px]"
          >
            {/* Society identity colour as a top edge. The one place a card is
                allowed to carry its society's hue: a 3px bar is read as a shape,
                so it can use the true brand value without ever having to be
                legible as text. It also gives the five cards a scannable
                identity when they are all the same size in a row. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-100 transition-transform duration-300"
              style={{ backgroundColor: society.colour.brand }}
            />
            <a
              href="#societies"
              className="group flex h-full flex-col justify-between gap-8 p-6 transition-colors duration-200 hover:bg-surface lg:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="label-mono"
                  style={{ color: society.colour.ink }}
                >
                  {society.abbreviation}
                </span>
                <span
                  aria-hidden="true"
                  className="label-mono text-subtle"
                >
                  {String(index + 1).padStart(2, "0")}/{societies.length}
                </span>
              </div>

              <div>
                <h3 className="text-[clamp(1.375rem,2vw,1.75rem)] leading-tight tracking-[-0.025em]">
                  {society.name}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-muted">
                  {society.scope}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {society.areas.map((area) => (
                    <li
                      key={area}
                      className="border border-border px-2.5 py-1 text-[12px] leading-tight text-subtle"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              <span className="flex items-center justify-between gap-4 border-t border-border-subtle pt-5">
                <span className="label-mono text-subtle">
                  {society.pending.length} pending
                </span>
                <ArrowRight
                  size={16}
                  weight="regular"
                  aria-hidden="true"
                  className="text-primary transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <ScrollRule barRef={progressBar} className="mt-6" />
    </div>
  );
}