"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Check, Clock, GitFork, Circuitry, UsersThree, ArrowSquareOut, ArrowRight } from "@phosphor-icons/react/ssr";
import {
  societies,
  type SocietyId,
  type Society,
  studentBranch,
  chapters,
  affinityGroups,
} from "@/lib/units";
import { EASE } from "@/components/motion/reveal";

/**
 * Branch hierarchy with full-card animated color fill on hover and click.
 */
export function BranchHierarchy() {
  const [activeId, setActiveId] = useState<SocietyId>("sb");
  const reduced = useReducedMotion();
  const current: Society =
    societies.find((s) => s.id === activeId) ?? studentBranch;

  return (
    <div className="space-y-10 lg:space-y-12">
      {/* ─────────────────────────────────────────────────────────────
          HIERARCHY TREE (Interactive Navigator)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* LEVEL 1: APEX STUDENT BRANCH */}
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => setActiveId("sb")}
            aria-pressed={activeId === "sb"}
            className="group relative flex w-full flex-col justify-between overflow-hidden border border-border bg-background p-5 text-left transition-all duration-300 sm:p-6"
            style={{
              borderColor: activeId === "sb" ? studentBranch.colour.brand : undefined,
              "--brand": studentBranch.colour.brand,
              "--ink": studentBranch.colour.ink,
            } as React.CSSProperties}
          >
            {/* Full-card color expansion animation */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 z-0 origin-top transition-transform duration-300 ease-out ${
                activeId === "sb" ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
              }`}
              style={{ backgroundColor: studentBranch.colour.brand }}
            />

            {/* Static top brand line */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-10 h-[3px]"
              style={{ backgroundColor: studentBranch.colour.brand }}
            />

            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`size-2.5 rounded-full transition-colors duration-300 ${
                      activeId === "sb" ? "bg-white" : "bg-[var(--brand)] group-hover:bg-white"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`label-mono text-[11px] tracking-wider uppercase transition-colors duration-300 ${
                      activeId === "sb" ? "text-white" : "text-[var(--ink)] group-hover:text-white"
                    }`}
                  >
                    {studentBranch.abbreviation} &middot; {studentBranch.unitTypeLabel}
                  </span>
                </div>

                <span
                  className={`text-[12px] font-mono transition-colors duration-300 ${
                    activeId === "sb" ? "text-white/80" : "text-subtle group-hover:text-white/80"
                  }`}
                >
                  3 Chapters &middot; 1 Affinity Group
                </span>
              </div>

              <div className="mt-3">
                <h3
                  className={`text-[clamp(1.25rem,2vw,1.625rem)] font-bold tracking-tight transition-colors duration-300 ${
                    activeId === "sb" ? "text-white" : "text-text group-hover:text-white"
                  }`}
                >
                  {studentBranch.name}
                </h3>
              </div>
            </div>
          </button>
        </div>

        {/* Tree Connectors (Desktop) */}
        <div aria-hidden="true" className="relative hidden py-1 lg:block">
          {/* Vertical stem from Apex Student Branch */}
          <div className="mx-auto h-7 w-[2px] bg-primary" />

          {/* Horizontal crossbar spanning between the two columns */}
          <div
            className="relative h-[2px] bg-primary"
            style={{ width: "50%", marginLeft: "37.5%" }}
          >
            {/* Junction node at Apex drop point */}
            <span className="absolute -top-[5px] left-[25%] size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-xs" />

            {/* Drop stem to Technical Chapters */}
            <div className="absolute left-0 top-0 h-7 w-[2px] bg-primary">
              <span className="absolute -top-[5px] left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-xs" />
            </div>

            {/* Drop stem to Affinity Group */}
            <div className="absolute right-0 top-0 h-7 w-[2px] bg-primary">
              <span className="absolute -top-[5px] left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-xs" />
            </div>
          </div>
          <div className="h-7" />
        </div>

        {/* Tree Connectors (Mobile Divider) */}
        <div aria-hidden="true" className="flex items-center justify-center py-2 lg:hidden">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="h-6 w-[2px] bg-primary" />
            <GitFork size={20} weight="bold" />
            <div className="h-6 w-[2px] bg-primary" />
          </div>
        </div>

        {/* LEVEL 2: CHAPTERS (3) & AFFINITY GROUP (1) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Category 1: Technical Chapters (spans 9 of 12 columns = 3 columns of cards) */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-9">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Circuitry size={16} weight="bold" className="text-primary" />
              <h4 className="text-[14px] font-bold tracking-tight">
                Technical Chapters
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {chapters.map((chapter) => {
                const isSelected = activeId === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveId(chapter.id)}
                    aria-pressed={isSelected}
                    className="group relative flex min-h-[108px] w-full flex-col justify-between overflow-hidden border border-border bg-background p-4 text-left transition-all duration-300"
                    style={{
                      borderColor: isSelected ? chapter.colour.brand : undefined,
                      "--brand": chapter.colour.brand,
                      "--ink": chapter.colour.ink,
                    } as React.CSSProperties}
                  >
                    {/* Full-card color expansion animation */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 z-0 origin-top transition-transform duration-300 ease-out ${
                        isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                      }`}
                      style={{ backgroundColor: chapter.colour.brand }}
                    />

                    {/* Static top brand line */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-10 h-[3px]"
                      style={{ backgroundColor: chapter.colour.brand }}
                    />

                    {/* Card Content */}
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`label-mono text-[12px] font-bold transition-colors duration-300 ${
                            isSelected ? "text-white" : "text-[var(--ink)] group-hover:text-white"
                          }`}
                        >
                          {chapter.abbreviation}
                        </span>
                        <ArrowSquareOut
                          size={14}
                          weight="bold"
                          aria-hidden="true"
                          className={`transition-colors duration-300 ${
                            isSelected ? "text-white/80" : "text-subtle group-hover:text-white/80"
                          }`}
                        />
                      </div>
                      <h5
                        className={`mt-2 text-[15px] font-bold leading-snug tracking-tight transition-colors duration-300 ${
                          isSelected ? "text-white" : "text-text group-hover:text-white"
                        }`}
                      >
                        {chapter.name}
                      </h5>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category 2: Affinity Group (spans 3 of 12 columns, demarcated with generous spacing) */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <UsersThree size={16} weight="bold" className="text-primary" />
              <h4 className="text-[14px] font-bold tracking-tight">
                Affinity Group
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {affinityGroups.map((group) => {
                const isSelected = activeId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActiveId(group.id)}
                    aria-pressed={isSelected}
                    className="group relative flex min-h-[108px] w-full flex-col justify-between overflow-hidden border border-border bg-background p-4 text-left transition-all duration-300"
                    style={{
                      borderColor: isSelected ? group.colour.brand : undefined,
                      "--brand": group.colour.brand,
                      "--ink": group.colour.ink,
                    } as React.CSSProperties}
                  >
                    {/* Full-card color expansion animation */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 z-0 origin-top transition-transform duration-300 ease-out ${
                        isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                      }`}
                      style={{ backgroundColor: group.colour.brand }}
                    />

                    {/* Static top brand line */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-10 h-[3px]"
                      style={{ backgroundColor: group.colour.brand }}
                    />

                    {/* Card Content */}
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`label-mono text-[12px] font-bold transition-colors duration-300 ${
                            isSelected ? "text-white" : "text-[var(--ink)] group-hover:text-white"
                          }`}
                        >
                          {group.abbreviation}
                        </span>
                        <ArrowSquareOut
                          size={14}
                          weight="bold"
                          aria-hidden="true"
                          className={`transition-colors duration-300 ${
                            isSelected ? "text-white/80" : "text-subtle group-hover:text-white/80"
                          }`}
                        />
                      </div>
                      <h5
                        className={`mt-2 text-[15px] font-bold leading-snug tracking-tight transition-colors duration-300 ${
                          isSelected ? "text-white" : "text-text group-hover:text-white"
                        }`}
                      >
                        {group.name}
                      </h5>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UNIT PROFILE (Open Editorial Layout)
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          role="region"
          aria-label={`${current.name} details`}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="grid grid-cols-1 gap-10 border-t border-border pt-10 lg:grid-cols-12 lg:gap-12"
        >
          {/* Left Column: Scope & Context */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: current.colour.brand }}
                aria-hidden="true"
              />
              <span
                className="label-mono font-bold"
                style={{ color: current.colour.ink }}
              >
                {current.abbreviation}
              </span>
              <span className="text-subtle">&middot;</span>
              <span className="label-mono text-subtle">
                {current.unitTypeLabel}
              </span>
              <span className="text-subtle">&middot;</span>
              <span className="label-mono text-subtle">
                {current.parentId ? "Under IEEE Student Branch" : "Apex Umbrella Organization"}
              </span>
            </div>

            <h3 className="mt-4 text-[clamp(1.75rem,2.8vw,2.5rem)] font-bold leading-tight tracking-[-0.035em]">
              {current.name}
            </h3>

            <p className="mt-5 max-w-[56ch] text-[clamp(1rem,1.25vw,1.125rem)] leading-relaxed text-muted">
              {current.scope}
            </p>

            {/* Direct portal link to subgroup subdomain or subpage */}
            {current.portalUrl && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={current.portalUrl}
                  target={current.portalUrl.startsWith("http") ? "_blank" : undefined}
                  rel={current.portalUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group/btn inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2.5 text-[13px] font-bold text-white transition-all duration-200 hover:bg-primary-hover hover:shadow-sm"
                >
                  <span>{current.portalLabel}</span>
                  {current.portalUrl.startsWith("http") ? (
                    <ArrowSquareOut
                      size={15}
                      weight="bold"
                      aria-hidden="true"
                      className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  ) : (
                    <ArrowRight
                      size={15}
                      weight="bold"
                      aria-hidden="true"
                      className="transition-transform group-hover/btn:translate-x-0.5"
                    />
                  )}
                </Link>

                <div className="flex items-center gap-1.5 text-[12px] text-subtle">
                  <span className="label-mono text-[10px] uppercase tracking-wider text-subtle">
                    {current.portalUrl.startsWith("http") ? "Subdomain" : "Target Route"}:
                  </span>
                  <code className="bg-surface-tone px-2 py-0.5 font-mono text-[11px] text-text">
                    {current.portalUrl}
                  </code>
                </div>
              </div>
            )}

            {/* Subordinate breakdown if Student Branch, or parent relationship note */}
            {current.id === "sb" ? (
              <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-border-subtle pt-6 sm:grid-cols-2">
                <div>
                  <dt className="label-mono text-subtle">3 Technical Chapters</dt>
                  <dd className="mt-2 text-[14px] font-medium leading-snug text-text">
                    Industrial Automation, Computer Society, Robotics &amp; Automation
                  </dd>
                </div>
                <div>
                  <dt className="label-mono text-subtle">1 Affinity Group</dt>
                  <dd className="mt-2 text-[14px] font-medium leading-snug text-text">
                    Women in Engineering (WIE)
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="mt-8 flex items-baseline gap-2 border-t border-border-subtle pt-6 text-[13px] text-subtle">
                <span className="label-mono text-text">Chartered under:</span>
                <span>IEEE Student Branch, Uva Wellassa University</span>
              </div>
            )}
          </div>

          {/* Right Column: Technical Areas & Records */}
          <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
            <div>
              <h4 className="label-mono text-subtle">Technical areas on file</h4>
              <ul className="mt-4 space-y-2.5">
                {current.areas.map((area) => (
                  <li
                    key={area}
                    className="flex items-baseline gap-3 text-[14px] text-text"
                  >
                    <Check
                      size={14}
                      weight="bold"
                      aria-hidden="true"
                      className="shrink-0 translate-y-0.5 text-primary"
                    />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {current.pending.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h4 className="label-mono text-subtle">Awaiting branch publication</h4>
                <ul className="mt-4 space-y-2">
                  {current.pending.map((item) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-3 text-[13px] text-subtle"
                    >
                      <Clock
                        size={13}
                        weight="regular"
                        aria-hidden="true"
                        className="shrink-0 translate-y-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
