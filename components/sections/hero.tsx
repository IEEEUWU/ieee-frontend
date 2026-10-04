"use client";

import { promise, site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { Shell } from "@/components/layout/shell";
import { Logo, Photo, ActionPrimary, ActionSecondary } from "@/components/ui/primitives";
import { SignalTrace } from "@/components/ui/signal-trace";
import { MaskedText } from "@/components/motion/reveal";
import { motion, useReducedMotion } from "motion/react";

/**
 * Hero.
 *
 * Locked to exactly one viewport: `100svh`, no more and no less. The hero is the
 * cover of the page, and a cover that runs past the fold stops being a cover.
 * Every internal length is therefore flex-relative rather than fixed — the image
 * takes whatever height the type leaves it instead of claiming an aspect ratio,
 * which is what previously pushed the composition to roughly 1.2 screens.
 *
 * `svh` rather than `vh`: on mobile, `vh` is measured against the browser chrome
 * hidden state, so `100vh` is taller than the visible screen on load and the
 * bottom of the hero starts out of sight. `svh` is the smallest viewport, so the
 * hero always fits what the reader can actually see, with no resize jank when
 * the chrome retracts.
 *
 * `min-h-0` on every flex child is load-bearing. Without it a flex item refuses
 * to shrink below its content, the overflow lands on the section instead of
 * being absorbed, and the hero grows back past the fold.
 *
 * The composition is asymmetric by intent. Type takes seven of twelve columns on
 * desktop and runs against a photograph that bleeds off the right edge, so the
 * page opens with tension rather than symmetry. On mobile the two planes stack:
 * type first, because that is what a first-time visitor needs, then the image
 * filling whatever room is left.
 */
export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      className="relative isolate flex h-[100svh] flex-col overflow-hidden bg-background"
    >
      {/* Decorative trace layer behind the type. aria-hidden, inert, and drawn
          entirely in SVG with no JavaScript. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 text-primary opacity-[0.14]"
      >
        <SignalTrace />
      </div>

      <Shell className="hero__shell flex min-h-0 flex-1 flex-col pt-24 sm:pt-28 lg:pt-28">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Type plane. Shrink-free on mobile so it always shows in full;
              stretched on desktop so the eyebrow pins to the top of the grid and
              the display type settles onto the image's baseline, which fills the
              upper-left quadrant instead of leaving it as a void. */}
          <div className="hero__type relative z-20 flex shrink-0 flex-col justify-between gap-6 lg:col-span-7 lg:gap-10">
            <motion.p
              className="label-mono text-primary"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {site.parentBody} &middot; {site.region}
            </motion.p>

            <div>
              {/* The ramp is capped so the longest line, "Five societies.", always
                  fits its column on one line. A headline that re-wraps at a
                  single breakpoint reads as broken rather than fluid, so 7vw is
                  the widest rate that holds from 390 to 1440. */}
              <h1 className="hero__title text-[clamp(2.75rem,7vw,6rem)] leading-[0.92] tracking-[-0.045em]">
                <MaskedText lines={promise.headline} delay={0.18} />
              </h1>

              <motion.p
                className="hero__lede mt-6 max-w-[54ch] text-[clamp(1.0625rem,1.35vw,1.25rem)] leading-relaxed text-muted lg:mt-8"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {promise.lede}
              </motion.p>

              <motion.div
                className="hero__actions mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-10"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
              >
                <ActionPrimary href="#join" magnetic>
                  {site.joinLabel}
                </ActionPrimary>
                <ActionSecondary href="#societies">
                  Browse the five societies
                </ActionSecondary>
              </motion.div>
            </div>
          </div>

          {/* Image plane. Takes the leftover height instead of declaring an
              aspect ratio, so it can never push the section past the fold.
              Static: the frame holds still rather than sliding against the
              scroll, which is what lets the section settle cleanly on a snap
              boundary instead of drifting through it. It arrives by clipping
              open from the bottom edge. */}
          <div className="hero__image relative z-10 min-h-0 flex-1 lg:col-span-5 lg:flex-none">
            <div className="relative h-full">
              <motion.div
                initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full"
              >
                <Photo
                  photo={photos.hero}
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="h-full w-full"
                />
              </motion.div>
            </div>

            {/* The official lockup, unboxed, on its own opaque plate so it stays
                legible over the photograph and the two never compete with the
                headline for the first glance. */}
            <motion.div
              className="absolute bottom-4 right-4 z-30 w-[min(240px,64%)] bg-background p-3 lg:bottom-6 lg:right-6"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <Logo />
            </motion.div>
          </div>
        </div>

        {/* The page's governing rule, drifting against the type above it. Held
            inside the viewport rather than below it, so it marks the fold
            instead of the start of the next section. */}
        <div
          aria-hidden="true"
          className="drift-rule rise-in mt-8 h-px w-full shrink-0 bg-border lg:mt-10"
        />
      </Shell>
    </section>
  );
}