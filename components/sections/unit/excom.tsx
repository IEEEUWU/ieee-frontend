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
  readonly groups: readonly MemberGroup[];
};

const CURRENT = "current";

/**
 * The Executive Committee block of the Committee section: the current
 * members and their archived terms behind one selector, in the landing
 * committee's own structure. The current session is the default option, so
 * the committee on show is this year's until the reader picks a past term —
 * which is how the branch's record works: one committee per term, same
 * seats, same groups. With no archived terms the selector disappears
 * entirely and only the current committee shows.
 */
export function UnitExCom({
  currentLabel,
  current,
  terms,
  brand,
}: {
  /** Year of the session in office, e.g. "2026 / 2027". */
  currentLabel: string;
  current: readonly MemberGroup[];
  terms: readonly ExComTerm[];
  brand: string;
}) {
  const [termId, setTermId] = useState<string>(CURRENT);
  const groups =
    termId === CURRENT
      ? current
      : terms.find((term) => term.id === termId)?.groups ?? [];

  return (
    <div className="flex w-full flex-col items-center gap-7">
      {terms.length > 0 ? (
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="excom-term"
            className={`${LABEL_SM} text-[#8796A5]`}
          >
            Select Year / Term
          </label>
          <select
            id="excom-term"
            value={termId}
            onChange={(event) => setTermId(event.target.value)}
            className="w-full max-w-xs rounded-2xl border border-[color:var(--unit-line)] bg-white px-5 py-3.5 text-[15px] font-medium text-[#0B1B2B]"
          >
            <option value={CURRENT}>
              {currentLabel} · Current
            </option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {groups.length > 0 ? (
        <UnitPeople groups={groups} brand={brand} />
      ) : (
        <PendingCard title="Term record pending">
          No committee record has been published for this term yet. The
          roster appears here once the branch releases it.
        </PendingCard>
      )}
    </div>
  );
}
