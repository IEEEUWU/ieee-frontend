import type { CSSProperties } from "react";
import { CheckCircle, Circle, Star } from "@phosphor-icons/react/ssr";
import type { EventMilestone } from "./data";
import { SectionHeading } from "./heading";
import { BORDER_CARD } from "./styles";

export interface EventTimelineProps {
  timeline: readonly EventMilestone[];
  brandColour?: string;
  inkColour?: string;
}

/**
 * Event timeline / Important dates.
 *
 * Recreates the milestone schedule from event announcements (e.g. IMPETUS 2026 poster):
 * - Desktop (>= 1280px): horizontal milestone rail with node track, header dividers,
 *   and a dedicated highlight card for the final conference/event date.
 * - Mobile / Tablet (< 1280px): clean vertical connected stepper with perfectly aligned
 *   nodes, themed badges, and no dangling border artifacts.
 */
export function EventTimeline({
  timeline,
  brandColour,
  inkColour,
}: EventTimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  // Find the featured milestone (or the last one if explicitly flagged highlight)
  const highlighted = timeline.find((m) => m.highlight);
  const regularMilestones = timeline.filter((m) => !m.highlight);

  const dynamicStyle = {
    "--unit-brand": brandColour ?? "var(--unit-brand, #00629B)",
    "--unit-ink": inkColour ?? "var(--unit-ink, #00629B)",
    "--unit-tint": brandColour ? `${brandColour}14` : "var(--unit-tint, #00629B14)",
  } as CSSProperties;

  return (
    <div
      style={dynamicStyle}
      className="flex w-full flex-col items-start gap-8 sm:gap-12"
    >
      <SectionHeading
        title="Important Dates"
        lede="Key milestones from paper submissions and registrations to the main event day."
      />

      {/* Desktop view (>= 1280px) */}
      <div
        className={`${BORDER_CARD} hidden xl:flex w-full ${
          regularMilestones.length > 0 ? "items-stretch gap-6" : "justify-center"
        } rounded-3xl bg-white p-6 xl:p-8 shadow-[0_2px_12px_rgba(11,27,43,0.03)]`}
      >
        {/* Horizontal rail for regular milestones */}
        {regularMilestones.length > 0 ? (
          <div className="flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ol className="flex w-full items-stretch min-w-0">
              {regularMilestones.map((item, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === regularMilestones.length - 1;

                return (
                  <li
                    key={`${item.date}-${item.title}-${idx}`}
                    className="relative flex flex-1 min-w-[105px] xl:min-w-[115px] flex-col items-center justify-start px-2 xl:px-2.5 py-1 text-center"
                  >
                    {/* Vertical column divider matching poster aesthetic (only between dates at top) */}
                    {!isLast ? (
                      <div
                        className="pointer-events-none absolute right-0 top-1.5 h-5 w-px bg-[#0B1B2B]/10"
                        aria-hidden="true"
                      />
                    ) : null}

                    {/* Date Header */}
                    <time className="flex h-6 items-center justify-center font-mono text-[13px] xl:text-[14px] font-semibold tracking-wider text-(--unit-ink) uppercase">
                      {item.date}
                    </time>

                    {/* Connecting Node Track */}
                    <div className="relative mt-3 mb-4 flex h-8 w-full items-center justify-center">
                      {/* Background horizontal connector line */}
                      {regularMilestones.length > 1 ? (
                        <div
                          className={`absolute top-1/2 h-[2px] -translate-y-1/2 bg-[#E2E8F0] ${
                            isFirst
                              ? "left-1/2 right-0"
                              : isLast
                                ? "left-0 right-1/2"
                                : "left-0 right-0"
                          }`}
                          aria-hidden="true"
                        />
                      ) : null}

                      {/* Status Node */}
                      {item.status === "completed" ? (
                        <span
                          title="Completed milestone"
                          className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-(--unit-brand)/30 bg-(--unit-tint) text-(--unit-ink) shadow-xs"
                        >
                          <CheckCircle size={18} weight="fill" aria-hidden="true" />
                          <span className="sr-only">Completed</span>
                        </span>
                      ) : item.status === "active" ? (
                        <span
                          title="Active milestone"
                          className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-(--unit-brand) text-white ring-4 ring-(--unit-tint) shadow-xs"
                        >
                          <Circle size={10} weight="fill" aria-hidden="true" />
                          <span className="sr-only">Active</span>
                        </span>
                      ) : (
                        <span
                          title="Upcoming milestone"
                          className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#CBD5E1] bg-white text-[#94A3B8] shadow-xs"
                        >
                          <Circle
                            size={8}
                            weight="fill"
                            aria-hidden="true"
                            className="opacity-40"
                          />
                          <span className="sr-only">Upcoming</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex flex-1 flex-col items-center gap-1 text-center">
                      <h3
                        title={item.title}
                        className="text-[12px] xl:text-[13px] font-semibold leading-[1.3] text-[#0B1B2B]"
                      >
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p
                          title={item.description}
                          className="line-clamp-2 text-[11px] leading-[1.35] text-[#667585]"
                        >
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}

        {/* Highlighted Main Date Card (Desktop) */}
        {highlighted ? (
          <div className="relative flex w-[200px] xl:w-[220px] shrink-0 flex-col items-center justify-center rounded-2xl border border-[#FDE68A] bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7] p-5 text-center shadow-xs">
            {highlighted.badge ? (
              <span className="rounded-full bg-[#D97706]/15 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-[#B45309]">
                {highlighted.badge}
              </span>
            ) : null}

            <time className="font-mono text-[22px] font-extrabold text-[#92400E] mt-2">
              {highlighted.date}
            </time>

            <div className="my-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-md ring-4 ring-[#FDE68A]">
              <Star size={20} weight="fill" aria-hidden="true" />
            </div>

            <h3
              title={highlighted.title}
              className="text-[15px] font-bold leading-[1.25] text-[#78350F]"
            >
              {highlighted.title}
            </h3>

            {highlighted.description ? (
              <p
                title={highlighted.description}
                className="mt-1 text-[11px] leading-[1.35] text-[#92400E]/80"
              >
                {highlighted.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Mobile / Tablet view (< 1280px) */}
      <div
        className={`${BORDER_CARD} flex xl:hidden w-full flex-col rounded-3xl bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(11,27,43,0.03)]`}
      >
        <ol className="flex flex-col">
          {timeline.map((item, idx) => {
            const isHighlighted = Boolean(item.highlight);
            const isLast = idx === timeline.length - 1;

            if (isHighlighted) {
              return (
                <li
                  key={`${item.date}-${item.title}-${idx}`}
                  className="relative flex items-start gap-3.5 sm:gap-4"
                >
                  {/* Left Rail: Node + Connector */}
                  <div className="relative flex flex-col items-center self-stretch shrink-0">
                    <div className="relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#F59E0B] text-white ring-4 ring-[#FDE68A] shadow-sm">
                      <Star size={18} weight="fill" aria-hidden="true" />
                    </div>
                    {!isLast ? (
                      <div
                        className="w-[2px] flex-1 bg-[#E2E8F0] my-1"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>

                  {/* Highlighted Card Container */}
                  <div className={`flex-1 ${isLast ? "pb-1" : "pb-6 sm:pb-8"}`}>
                    <div className="rounded-2xl border border-[#FDE68A] bg-gradient-to-br from-[#FFFDF5] to-[#FEF3C7] p-4 sm:p-5 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <time className="font-mono text-[16px] sm:text-[18px] font-bold text-[#92400E]">
                          {item.date}
                        </time>
                        {item.badge ? (
                          <span className="rounded-full bg-[#D97706]/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase text-[#B45309]">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-1.5 text-[16px] sm:text-[18px] font-bold text-[#78350F]">
                        {item.title}
                      </h3>

                      {item.description ? (
                        <p className="mt-1 text-[13px] sm:text-[14px] leading-[1.5] text-[#92400E]/85">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={`${item.date}-${item.title}-${idx}`}
                className="relative flex items-start gap-3.5 sm:gap-4"
              >
                {/* Left Rail: Node + Connector */}
                <div className="relative flex flex-col items-center self-stretch shrink-0">
                  <div className="relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center">
                    {item.status === "completed" ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-(--unit-brand)/30 bg-(--unit-tint) text-(--unit-ink) shadow-xs">
                        <CheckCircle size={18} weight="fill" aria-hidden="true" />
                        <span className="sr-only">Completed</span>
                      </span>
                    ) : item.status === "active" ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--unit-brand) text-white ring-4 ring-(--unit-tint) shadow-xs">
                        <Circle size={10} weight="fill" aria-hidden="true" />
                        <span className="sr-only">Active</span>
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#CBD5E1] bg-white text-[#94A3B8] shadow-xs">
                        <Circle
                          size={8}
                          weight="fill"
                          aria-hidden="true"
                          className="opacity-40"
                        />
                        <span className="sr-only">Upcoming</span>
                      </span>
                    )}
                  </div>
                  {!isLast ? (
                    <div
                      className="w-[2px] flex-1 bg-[#E2E8F0] my-1"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>

                {/* Milestone Details */}
                <div className={`flex-1 ${isLast ? "pb-1" : "pb-6 sm:pb-8"} flex flex-col items-start gap-1`}>
                  <div className="flex items-center gap-2">
                    <time className="rounded-full bg-(--unit-tint) px-2.5 py-0.5 font-mono text-[12px] font-semibold text-(--unit-ink)">
                      {item.date}
                    </time>
                    {item.status ? (
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#667585]">
                        {item.status}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#0B1B2B]">
                    {item.title}
                  </h3>

                  {item.description ? (
                    <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#4A5B6B]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
