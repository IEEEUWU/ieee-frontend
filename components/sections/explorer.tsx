"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Clock } from "@phosphor-icons/react/ssr";
import { societies, type Society } from "@/lib/units";
import { EASE } from "@/components/motion/reveal";

/**
 * Society explorer.
 *
 * A tablist over the same five societies the rail shows, but going one level
 * deeper: full charter scope, every technical area on file, and the fields each
 * society still has to supply.
 *
 * Two states, one control. The rail answers "what exists", this answers "tell me
 * about one". Building it twice from one dataset is deliberate — duplication of
 * data would be a bug, duplication of *presentation* is how progressive
 * disclosure works.
 *
 * Keyboard contract follows the WAI-ARIA tabs pattern: one tab stop for the
 * whole list, arrow keys move between tabs, Home and End jump to the ends.
 */
export function SocietyExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const reduced = useReducedMotion();
  const current: Society = societies[active];

  function move(next: number) {
    const total = societies.length;
    setActive((next + total) % total);
    tabs.current[(next + total) % total]?.focus();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <p className="mb-2 text-[12px] font-medium text-subtle lg:hidden">
          Scroll horizontally to switch society
        </p>
        <div
          role="tablist"
          aria-label="Society detail"
          aria-orientation="vertical"
          className="-mx-5 flex gap-1.5 overflow-x-auto no-scrollbar px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          onKeyDown={(event) => {
            switch (event.key) {
              case "ArrowRight":
              case "ArrowDown":
                event.preventDefault();
                move(active + 1);
                break;
              case "ArrowLeft":
              case "ArrowUp":
                event.preventDefault();
                move(active - 1);
                break;
              case "Home":
                event.preventDefault();
                move(0);
                break;
              case "End":
                event.preventDefault();
                move(societies.length - 1);
                break;
              default:
                return;
            }
          }}
        >
          {societies.map((society, index) => {
            const selected = index === active;
            return (
              <button
                key={society.id}
                ref={(el) => {
                  tabs.current[index] = el;
                }}
                role="tab"
                id={`${baseId}-tab-${society.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                className={`relative flex shrink-0 items-center justify-between gap-3 sm:gap-4 border px-3.5 py-3 sm:px-4 sm:py-4 text-left transition-colors duration-200 lg:w-full lg:px-5 ${
                  selected
                    ? "border-text bg-background text-text"
                    : "border-border-subtle text-muted hover:border-border hover:text-text"
                }`}
              >
                <span className="flex items-center gap-2.5 sm:gap-3">
                  {/* The active society keeps its own identity colour in the tab and in the
                      sliding marker, so the selected society is identifiable by
                      hue as well as by position. Inactive tabs stay neutral,
                      because five competing hues in a list would be noise. */}
                  <span
                    className={`label-mono text-[12px] sm:text-[13px] ${selected ? "" : "text-subtle"}`}
                    style={selected ? { color: society.colour.ink } : undefined}
                  >
                    {society.abbreviation}
                  </span>
                  <span className="text-[13px] sm:text-[15px] font-semibold whitespace-nowrap">
                    {society.name}
                  </span>
                </span>

                {/* One shared element slides between tabs, so the selection is a
                    moving object rather than five independent states. */}
                {selected ? (
                  <motion.span
                    layoutId="explorer-marker"
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 lg:inset-y-0 lg:left-0 lg:bottom-auto lg:h-full lg:w-1"
                    style={{ backgroundColor: society.colour.brand }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 38 }
                    }
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${current.id}`}
            tabIndex={0}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="border border-border bg-background p-6 focus-visible:outline-2 focus-visible:outline-primary lg:p-10"
          >
            <div
              className="flex items-center gap-4"
              style={{ color: current.colour.ink }}
            >
              <span
                aria-hidden="true"
                className="size-3 shrink-0"
                style={{ backgroundColor: current.colour.brand }}
              />
              <p className="label-mono">{current.abbreviation}</p>
            </div>
            <h3 className="mt-4 text-[clamp(1.625rem,2.6vw,2.25rem)] leading-tight tracking-[-0.03em]">
              {current.name}
            </h3>
            <p className="mt-5 max-w-[58ch] leading-relaxed text-muted">
              {current.scope}
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <h4 className="label-mono text-subtle">Technical areas on file</h4>
              <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {current.areas.map((area) => (
                  <li
                    key={area}
                    className="flex items-baseline gap-3 text-[15px]"
                  >
                    <Check
                      size={14}
                      weight="bold"
                      aria-hidden="true"
                      className="shrink-0 translate-y-0.5 text-primary"
                    />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {current.pending.length > 0 ? (
              <div className="mt-8 border-t border-border pt-6">
                <h4 className="label-mono text-subtle">
                  Not yet published by the branch
                </h4>
                <ul className="mt-4 space-y-2">
                  {current.pending.map((item) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-3 text-[14px] text-subtle"
                    >
                      <Clock
                        size={14}
                        weight="regular"
                        aria-hidden="true"
                        className="shrink-0 translate-y-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}