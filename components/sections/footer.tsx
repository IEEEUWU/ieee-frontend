"use client";

import { ArrowUp } from "@phosphor-icons/react/ssr";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { navLinks, site } from "@/lib/site";
import { photoCredits } from "@/lib/photos";
import { Shell } from "@/components/layout/shell";
import { Logo } from "@/components/ui/primitives";
import { EASE, MaskedText } from "@/components/motion/reveal";

/**
 * Footer.
 *
 * The last thing on the page is the loudest thing on the page.
 *
 * The display type repeats the hero's promise almost verbatim, because recall is
 * the entire job of a closing statement. It arrives oversized and settles as the
 * reader reaches it: a scroll-linked scale that resolves the type onto the grid
 * instead of simply letting it sit there. Under reduced motion the type is
 * already settled and no scale is applied at all.
 *
 * The official lockup returns here at its native proportion, unboxed, and the
 * CC BY photograph credits sit in the small print where attribution belongs.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.22, 1]);
  const settle = useTransform(scrollYProgress, [0, 1], [56, 0]);

  return (
    <footer
      ref={ref}
      className="relative isolate overflow-hidden border-t border-border bg-background"
    >
      {/* Display statement. Leading is pulled below the type's natural value so
          the lines optically interlock at display sizes. */}
      <Shell>
        <div className="pt-20 md:pt-28 lg:pt-36">
          <p className="label-mono text-primary">IEEE UWU Student Branch</p>

          <motion.div
            style={reduced ? undefined : { scale, y: settle }}
            className="mt-8 origin-bottom-left will-change-transform max-w-full"
          >
            <h2 className="text-[clamp(2rem,10.5vw,12rem)] sm:text-[clamp(2.75rem,13.5vw,12rem)] leading-[0.85] sm:leading-[0.82] tracking-[-0.055em] break-words">
              <MaskedText lines={["Five societies.", "One branch."]} delay={0.1} />
            </h2>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-1 gap-8 border-t border-border pt-8 md:grid-cols-12"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="max-w-[40ch] text-[clamp(1.0625rem,1.5vw,1.375rem)] leading-snug tracking-[-0.02em] md:col-span-5">
              Engineering and computing students at Uva Wellassa University,
              organising under one IEEE banner.
            </p>

            <div className="flex flex-wrap items-start gap-x-10 gap-y-4 md:col-span-4 md:col-start-9 md:justify-end">
              <a
                href="#top"
                className="group -ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-[14px] font-semibold text-text"
              >
                <ArrowUp
                  size={16}
                  weight="regular"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-1"
                />
                Back to top
              </a>
            </div>
          </motion.div>
        </div>
      </Shell>

      {/* Identity block. The lockup at native proportion, and nothing that would
          distort it. */}
      <div className="mt-20 border-t border-border bg-surface md:mt-28">
        <Shell>
          <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:gap-8 lg:py-16">
            <div className="md:col-span-5">
              <div className="max-w-[260px]">
                <Logo />
              </div>
              <p className="mt-6 max-w-[34ch] text-[13px] leading-relaxed text-subtle">
                A student branch of the {site.parentBody}, {site.region}.
              </p>
            </div>

            <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
              <h2 className="label-mono text-subtle">On this page</h2>
              <ul className="mt-5 space-y-3">
                {[...navLinks, { href: "#join", label: "Join" }].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="link-underline text-[15px] text-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-3 md:col-start-10">
              <h2 className="label-mono text-subtle">Branch</h2>
              <address className="mt-5 space-y-1 text-[14px] leading-relaxed text-muted not-italic">
                <div>{site.university}</div>
                <div>
                  {site.city}, {site.country}
                </div>
                <div className="pt-2 text-subtle">{site.region}</div>
              </address>
            </div>
          </div>

          <Shell>
            <div className="flex flex-col gap-2 border-t border-border py-6 text-[12px] leading-relaxed text-subtle sm:flex-row sm:items-baseline sm:justify-between">
              <p>
                &copy; {site.branchName}. Charter scope quoted from IEEE
                publications.
              </p>
              <p>
                Photography: {photoCredits.join(", ")}, via Wikimedia Commons.
              </p>
            </div>
          </Shell>
        </Shell>
      </div>
    </footer>
  );
}