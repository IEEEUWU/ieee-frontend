"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useReducedMotion } from "motion/react";

/**
 * Horizontal scroll chrome.
 *
 * One implementation of "a row you can scroll sideways" for the whole page. The
 * society rail and the events gallery are the only two things here that scroll
 * horizontally, and they previously each carried their own copy of the same
 * forty lines: a scroll listener, two edge booleans, an imperative progress bar
 * and a page button. Two copies of that is a bug waiting to happen — someone
 * fixes the keyboard behaviour in one and not the other. So the mechanics live
 * here and both sections compose them.
 *
 * The underlying scroller is a genuine scroll container, not a transform rig.
 * Hijacking horizontal scroll means reimplementing trackpad momentum, touch
 * inertia, keyboard paging and screen-reader navigation, and getting all four
 * subtly wrong. A native scroller with snap points gets all four for free and
 * degrades perfectly, so both rows still work if this script never runs.
 *
 * Everything here is an enhancement. Content is fully readable and fully
 * reachable with no script at all.
 */

/** Shared instruction, so the two rows cannot word it differently. */
export const SCROLL_HINT = "Scroll sideways, or use the arrows.";

type EdgeScroll<T extends HTMLElement> = {
  /** Put this on the scroll container. */
  scroller: RefObject<T | null>;
  /** Put this on the inner bar of a `ScrollRule`. */
  progressBar: RefObject<HTMLDivElement | null>;
  /** True when the row is at its left edge, so the back arrow is disabled. */
  atStart: boolean;
  /** True when the row is at its right edge, so the forward arrow is disabled. */
  atEnd: boolean;
  /** Advance the row by one item, forwards or backwards. */
  page: (direction: 1 | -1) => void;
};

/**
 * Scroll state for a horizontal row.
 *
 * The progress bar is written straight to the DOM. It changes on every scroll
 * frame, and routing that through React state would re-render the whole row
 * sixty times a second to move one div's transform. The two edge booleans do go
 * through state, but each only flips twice per pass, so the identity guard keeps
 * them from waking the component on every other frame.
 */
export function useEdgeScroll<T extends HTMLElement>(): EdgeScroll<T> {
  const scroller = useRef<T>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const reduced = useReducedMotion();

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? el.scrollLeft / max : 0;

    if (progressBar.current) {
      progressBar.current.style.transform = `scaleX(${0.08 + ratio * 0.92})`;
    }

    const nextAtStart = el.scrollLeft <= 1;
    const nextAtEnd = el.scrollLeft >= max - 1;
    setAtStart((prev) => (prev === nextAtStart ? prev : nextAtStart));
    setAtEnd((prev) => (prev === nextAtEnd ? prev : nextAtEnd));
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const page = useCallback(
    (direction: 1 | -1) => {
      const el = scroller.current;
      if (!el) return;

      const item = el.querySelector<HTMLElement>("li");
      if (!item) return;

      // Read the gap from the computed style rather than hard-coding it. A
      // literal here is a second place to update whenever the track's `gap`
      // changes, and paging by the wrong amount is visible immediately: the
      // next item lands a few pixels off and snap fights it.
      const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;

      el.scrollBy({
        left: (item.offsetWidth + gap) * direction,
        // Reduced motion is honoured for scripted movement too, not just for
        // entrance animations.
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );

  return { scroller, progressBar, atStart, atEnd, page };
}

/**
 * One edge arrow.
 *
 * `disabled` rather than hidden, so the control does not reflow the row as it
 * reaches each end — and because a disabled button still announces itself,
 * which tells a screen-reader user that the row has a boundary there.
 */
export function ScrollArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  /** Accessible name. Must describe the direction and the row. */
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center border border-border text-text transition-colors duration-200 hover:border-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border"
    >
      {children}
    </button>
  );
}

/**
 * The progress rule under a row.
 *
 * A hairline track with a filled portion, driven imperatively by `useEdgeScroll`.
 * The fill never reaches zero width, because a bar at `scaleX(0)` is invisible
 * and a row that appears to have no progress indicator is worse than one that
 * appears to be at the start.
 */
export function ScrollRule({
  barRef,
  className = "",
}: {
  barRef: RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`h-px w-full bg-border ${className}`}>
      <div
        ref={barRef}
        className="h-px w-full origin-left bg-primary"
        style={{ transform: "scaleX(0.08)" }}
      />
    </div>
  );
}

/**
 * Track classes shared by both horizontal rows.
 *
 * The negative margin plus matching padding is what makes a row inside the page
 * shell bleed to the viewport edge while its content still lines up with every
 * other section. Written once here, because the three breakpoints have to agree
 * with `Shell`'s padding or the first item sits visibly off the grid.
 *
 * `scroll-padding` is load-bearing, not decoration. It has to agree with the
 * padding above, for a specific reason: `snap-mandatory` aligns an item to the
 * *scrollport* edge, not to where the item actually sits. With padding but no
 * matching `scroll-padding`, the browser resolves the first item's only valid
 * snap position as "scrolled forward by the padding amount" — so `scrollLeft`
 * rests at 48px instead of 0 and can never return there. That silently breaks
 * the back-arrow guard, which tests for the left edge, leaving the arrow
 * permanently enabled at the start of the row.
 *
 * Setting `scroll-padding` to the same value moves the snapport out to the
 * item's real position, so the row rests at 0, the arrow guards correctly, and
 * every plate lands flush with the page grid.
 */
export const TRACK_CLASS =
  "no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto scroll-pl-5 scroll-pr-5 px-5 pb-2 focus-visible:outline-2 focus-visible:outline-primary sm:-mx-8 sm:scroll-pl-8 sm:scroll-pr-8 sm:px-8 lg:-mx-12 lg:scroll-pl-12 lg:scroll-pr-12 lg:px-12";