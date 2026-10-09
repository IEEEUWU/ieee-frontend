"use client";

import { useState } from "react";
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
  const [activeTier, setActiveTier] = useState<"senior" | "junior" | "all">("senior");

  const selectedTerm = termId === CURRENT ? null : terms.find((term) => term.id === termId);

  // Resolve senior and junior groups for current or selected term
  const seniorGroups =
    termId === CURRENT
      ? (currentSenior ?? current ?? [])
      : (selectedTerm?.seniorGroups ?? selectedTerm?.groups ?? []);

  const juniorGroups =
    termId === CURRENT
      ? (currentJunior ?? [])
      : (selectedTerm?.juniorGroups ?? []);

  // Determine which groups to render based on activeTier
  let displayedGroups: readonly MemberGroup[] = [];
  if (activeTier === "senior") {
    displayedGroups = seniorGroups;
  } else if (activeTier === "junior") {
    displayedGroups = juniorGroups;
  } else {
    displayedGroups = [...seniorGroups, ...juniorGroups];
  }

  const hasTiers = (seniorGroups.length > 0 && juniorGroups.length > 0);

  return (
    <div className="flex w-full flex-col items-center gap-7">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {terms.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <label
              htmlFor="excom-term"
              className={`${LABEL_SM} text-[#8796A5]`}
            >
              SELECT YEAR / TERM
            </label>
            <select
              id="excom-term"
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
              className="w-full min-w-55 max-w-xs rounded-2xl border border-[color:var(--unit-line)] bg-white px-5 py-3 text-[15px] font-medium text-[#0B1B2B]"
            >
              <option value={CURRENT}>
                {currentLabel} · Current
              </option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.label} · Archived
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Tier Selector (FR-BOD-02: Junior and Senior committee tiers) */}
        {hasTiers ? (
          <div className="flex flex-col items-center gap-2">
            <span className={`${LABEL_SM} text-[#8796A5]`}>COMMITTEE TIER</span>
            <div className="flex items-center rounded-2xl border border-[color:var(--unit-line)] bg-white p-1">
              <button
                type="button"
                onClick={() => setActiveTier("senior")}
                className={`rounded-xl px-4 py-2 text-[14px] font-semibold transition-colors ${
                  activeTier === "senior"
                    ? "bg-[#00629B] text-white"
                    : "text-[#4A5B6B] hover:text-[#0B1B2B]"
                }`}
                style={activeTier === "senior" ? { backgroundColor: brand } : undefined}
              >
                Senior ExCom
              </button>
              <button
                type="button"
                onClick={() => setActiveTier("junior")}
                className={`rounded-xl px-4 py-2 text-[14px] font-semibold transition-colors ${
                  activeTier === "junior"
                    ? "bg-[#00629B] text-white"
                    : "text-[#4A5B6B] hover:text-[#0B1B2B]"
                }`}
                style={activeTier === "junior" ? { backgroundColor: brand } : undefined}
              >
                Junior ExCom
              </button>
              <button
                type="button"
                onClick={() => setActiveTier("all")}
                className={`rounded-xl px-4 py-2 text-[14px] font-semibold transition-colors ${
                  activeTier === "all"
                    ? "bg-[#00629B] text-white"
                    : "text-[#4A5B6B] hover:text-[#0B1B2B]"
                }`}
                style={activeTier === "all" ? { backgroundColor: brand } : undefined}
              >
                All Members
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {displayedGroups.length > 0 ? (
        <UnitPeople groups={displayedGroups} brand={brand} />
      ) : (
        <PendingCard title="ROSTER PENDING">
          No committee members have been recorded under this tier for the selected term yet.
        </PendingCard>
      )}
    </div>
  );
}
