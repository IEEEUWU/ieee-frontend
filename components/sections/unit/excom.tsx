"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { LABEL_SM } from "@/components/sections/landing/styles";
import { PendingCard } from "./section";
import { UnitPeople, type MemberGroup } from "./people";

/** One term of office: the committee the 15-seat skeleton produced that year. */
export type ExComTerm = {
  readonly id: string;
  /** Display label for the selector, e.g. "2025 / 2026". */
  readonly label: string;
  readonly groups?: readonly MemberGroup[];
  readonly seniorGroups?: readonly MemberGroup[];
  readonly juniorGroups?: readonly MemberGroup[];
};

const CURRENT = "current";

/**
 * The Executive Committee block of the Committee section: the current
 * members and their archived terms behind one selector, supporting distinct
 * Junior and Senior committee tiers under current and archived terms (FR-BOD-02).
 */
export function UnitExCom({
  currentLabel,
  current,
  currentSenior,
  currentJunior,
  terms,
  brand,
}: {
  /** Year of the session in office, e.g. "2026 / 2027". */
  currentLabel: string;
  current?: readonly MemberGroup[];
  currentSenior?: readonly MemberGroup[];
  currentJunior?: readonly MemberGroup[];
  terms: readonly ExComTerm[];
  brand: string;
}) {
  const [termId, setTermId] = useState<string>(CURRENT);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const selectedTerm = termId === CURRENT ? null : terms.find((term) => term.id === termId);

  const termOptions = [
    { id: CURRENT, label: currentLabel, badge: "Current", isCurrent: true },
    ...terms.map((term) => ({
      id: term.id,
      label: term.label,
      badge: "Archived",
      isCurrent: false,
    })),
  ];
  const activeOption =
    termOptions.find((opt) => opt.id === termId) ?? termOptions[0];

  // Resolve senior and junior groups for current or selected term
  const seniorGroups =
    termId === CURRENT
      ? (currentSenior ?? current ?? [])
      : (selectedTerm?.seniorGroups ?? selectedTerm?.groups ?? []);

  const juniorGroups =
    termId === CURRENT
      ? (currentJunior ?? [])
      : (selectedTerm?.juniorGroups ?? []);

  const displayedGroups: readonly MemberGroup[] = [
    ...seniorGroups,
    ...juniorGroups,
  ];

  return (
    <div className="flex w-full flex-col items-center gap-7">
      {terms.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <span
            id="excom-term-label"
            className={`${LABEL_SM} text-[#8796A5]`}
          >
            SELECT YEAR / TERM
          </span>
          <div ref={dropdownRef} className="relative">
            <button
              id="excom-term"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-labelledby="excom-term-label"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="group flex min-w-62 items-center justify-between gap-3 rounded-2xl border border-[color:var(--unit-line)] bg-white p-1 pl-4 pr-1.5 text-[14px] font-semibold text-[#0B1B2B] transition-all hover:border-[color:var(--unit-brand)] focus:outline-none"
            >
              <span className="flex items-center gap-2.5">
                <span className="tracking-[-0.01em]">{activeOption.label}</span>
                <span
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] ${
                    activeOption.isCurrent
                      ? "bg-(--unit-tint) text-(--unit-ink)"
                      : "bg-[#EEF2F6] text-[#4A5B6B]"
                  }`}
                >
                  {activeOption.badge}
                </span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F7F9FB] text-[#4A5B6B] transition-colors group-hover:bg-(--unit-tint) group-hover:text-(--unit-ink)">
                <CaretDown
                  size={14}
                  weight="bold"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180 text-(--unit-ink)" : ""
                  }`}
                />
              </span>
            </button>

            <AnimatePresence>
              {isDropdownOpen ? (
                <motion.div
                  role="listbox"
                  aria-labelledby="excom-term-label"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 top-[calc(100%+8px)] z-30 flex w-full min-w-62 flex-col gap-1 rounded-2xl border border-[color:var(--unit-line)] bg-white p-1.5 shadow-[0_16px_36px_-8px_rgba(11,27,43,0.14),0_4px_12px_-2px_rgba(11,27,43,0.06)]"
                >
                  {termOptions.map((option) => {
                    const isSelected = option.id === termId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setTermId(option.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors ${
                          isSelected
                            ? "bg-(--unit-tint) font-semibold text-(--unit-ink)"
                            : "font-medium text-[#0B1B2B] hover:bg-[#F7F9FB]"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span>{option.label}</span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              option.isCurrent
                                ? "bg-white/90 text-(--unit-ink)"
                                : "bg-[#EEF2F6] text-[#4A5B6B]"
                            }`}
                          >
                            {option.badge}
                          </span>
                        </span>
                        {isSelected ? (
                          <Check
                            size={15}
                            weight="bold"
                            aria-hidden="true"
                            className="shrink-0 text-(--unit-brand)"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      {displayedGroups.length > 0 ? (
        <UnitPeople groups={displayedGroups} brand={brand} />
      ) : (
        <PendingCard title="ROSTER PENDING">
          No committee members have been recorded for the selected term yet.
        </PendingCard>
      )}
    </div>
  );
}
