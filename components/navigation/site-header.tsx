"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { ArrowRight, List, X } from "@phosphor-icons/react/ssr";
import { navLinks, site } from "@/lib/site";
import { Shell } from "@/components/layout/shell";
import { ActionPrimary, Logo } from "@/components/ui/primitives";
import { EASE } from "@/components/motion/reveal";

/** Distance past which the bar switches to its compact, solid state. */
const COMPACT_AT = 64;

/**
 * Navigation.
 *
 * Three states, all predictable:
 *   1. Over the hero the bar is transparent and full height, so it does not
 *      compete with the headline for the first glance.
 *   2. Once the reader commits and scrolls, it becomes a compact solid bar with
 *      a hairline, so it stays out of the way and never floats over content.
 *   3. On small screens it is replaced by a full-height drawer, which is a
 *      different control rather than a squeezed version of the desktop one.
 *
 * The active section is tracked with an IntersectionObserver, not a scroll
 * handler, and the reading-progress bar is pure CSS driven by the scroller.
 */
export function SiteHeader() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  useEffect(() => {
    // The bar's compact state is driven by Motion's scroll value rather than a
    // window listener, so it shares Motion's single rAF-batched scroll reader
    // instead of adding a second one. The equality guard means setState is only
    // ever called when the boolean actually flips: scrolling the rest of the
    // page causes no re-render at all.
    const update = (y: number) => {
      setCompact((prev) => {
        const next = y > COMPACT_AT;
        return prev === next ? prev : next;
      });
    };
    update(scrollY.get());
    return scrollY.on("change", update);
  }, [scrollY]);

  useEffect(() => {
    const ids = navLinks.map((link) => link.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          compact || open
            ? "border-b border-border bg-background"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <Shell>
          <div
            className={`flex items-center justify-between gap-6 transition-[height] duration-300 ${
              compact || open ? "h-16" : "h-16 sm:h-20 lg:h-24"
            }`}
          >
            {/* The official branch lockup, unboxed and at native proportion.
                Rendered at a fixed height rather than a fixed width: the lockup
                is 6.52:1, so constraining the height keeps the mark on a single
                optical line across the bar's two heights while never touching
                its aspect ratio. `sizes` matches the width that height implies,
                so the optimiser is never asked for more pixels than the bar
                displays. */}
            <a
              href="#top"
              aria-label={`${site.branchName}, back to top`}
              className="-mx-2 flex min-h-11 items-center px-2"
            >
              <Logo
                className={`w-auto transition-[height] duration-300 ${
                  compact ? "h-8 sm:h-9" : "h-8 sm:h-10 lg:h-12"
                }`}
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 270px, 220px"
              />
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    aria-current={active === link.href ? "true" : undefined}
                    className={`relative flex min-h-11 items-center py-1 text-[14px] font-medium transition-colors duration-200 ${
                      active === link.href ? "text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1.5 left-0 h-px w-full origin-left bg-primary transition-transform duration-300 ${
                        active === link.href ? "scale-x-100" : "scale-x-0"
                      }`}
                      style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                    />
                  </a>
                ))}
                <ActionPrimary href="#join" className="ml-2 hidden xl:inline-flex">
                  {site.joinLabel}
                </ActionPrimary>
              </nav>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                className="inline-flex h-11 items-center gap-2 border border-border px-4 text-[13px] font-semibold text-text transition-colors hover:border-text lg:hidden"
              >
                {open ? "Close" : "Menu"}
                {open ? (
                  <X size={16} weight="regular" aria-hidden="true" />
                ) : (
                  <List size={16} weight="regular" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </Shell>

        {/* Reading progress. Scale-x driven by the scroller in CSS, no JS. */}
        <div aria-hidden="true" className="h-px w-full bg-transparent">
          <div className="scroll-progress h-px w-full bg-primary" />
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            aria-label="Primary"
            initial={reduced ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background lg:hidden"
          >
            <Shell>
              <ul className="pt-8">
                {[...navLinks, { href: "#join", label: "Join" }].map(
                  (link, index) => (
                    <motion.li
                      key={link.href}
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: reduced ? 0 : 0.06 + index * 0.05,
                        ease: EASE,
                      }}
                      className="border-b border-border-subtle"
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-20 items-center justify-between text-[clamp(1.75rem,7vw,2.5rem)] font-extrabold tracking-[-0.03em] text-text"
                      >
                        {link.label}
                        <ArrowRight size={22} weight="light" aria-hidden="true" />
                      </a>
                    </motion.li>
                  ),
                )}
              </ul>
              <p className="py-8 text-[13px] leading-relaxed text-subtle">
                {site.university}, {site.city}, {site.country}. A student branch of
                the {site.parentBody}.
              </p>
            </Shell>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </>
  );
}