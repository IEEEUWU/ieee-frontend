"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import {
  SCROLL_HINT,
  ScrollArrow,
  ScrollRule,
  TRACK_CLASS,
  useEdgeScroll,
} from "@/components/ui/scroller";

/**
 * The events gallery's scroll chrome.
 *
 * Client component, but it never sees an event. The plates arrive as
 * `children`, already rendered by the server, so the dates, venues and notes
 * stay in the HTML and are never shipped as client-side data — the section keeps
 * its original property of adding almost no JavaScript, while gaining a real
 * scroll container.
 *
 * That split is also why the plates are rendered here as a `ul` supplied from
 * outside rather than being mapped internally: this component owns the scroll
 * mechanics and nothing else, so it has no reason to know what a plate is.
 */
export function EventGallery({
  label,
  count,
  children,
}: {
  /** Accessible name for the row. Names what the row contains. */
  label: string;
  /** Total plates, announced as a running position. */
  count: number;
  children: ReactNode;
}) {
  const { scroller, progressBar, atStart, atEnd, page } =
    useEdgeScroll<HTMLUListElement>();

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between gap-6">
        <p className="text-[13px] text-subtle">{SCROLL_HINT}</p>
        <div className="flex items-center gap-2">
          <ScrollArrow
            label="Previous events"
            disabled={atStart}
            onClick={() => page(-1)}
          >
            <ArrowLeft size={18} weight="regular" aria-hidden="true" />
          </ScrollArrow>
          <ScrollArrow
            label="Next events"
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
        aria-label={`${label}, ${count} in total`}
        className={`${TRACK_CLASS} gap-6 md:gap-8`}
      >
        {children}
      </ul>

      <ScrollRule barRef={progressBar} className="mt-6" />
    </div>
  );
}