"use client";

import type { CSSProperties } from "react";
import { type Member } from "./data";
import { SectionHeading } from "./heading";
import { UnitExCom } from "@/components/sections/unit/excom";
import { UnitPeople } from "@/components/sections/unit/people";
import {
  INITIAL_BOD_TERMS,
  INITIAL_UNITS,
  type BodMember,
} from "@/lib/srs-data";

function bodToMember(m: BodMember): Member {
  return {
    name: m.name,
    role: m.position,
    email: m.email,
  };
}

function chunkIntoRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/**
 * Executive committee for the IEEE Student Branch (sb):
 * Renders confirmed branch advisors followed by `UnitExCom` with the active
 * and archived terms selector and Senior / Junior committee tier switcher.
 */
export function LandingCommittee() {
  const sbUnit = INITIAL_UNITS.find((u) => u.id === "sb");
  const advisors: readonly Member[] =
    sbUnit?.advisors.map((a) => ({
      name: a.name,
      role: a.designation,
      email: `${a.name.split(" ").pop()?.toLowerCase() ?? "advisor"}@ieeeuwu.org`,
    })) ?? [];

  const currentBodTerm = INITIAL_BOD_TERMS.find(
    (t) => t.unitId === "sb" && t.state === "current",
  );
  const currentSeniorMembers =
    currentBodTerm?.members.filter((m) => m.tier === "senior") ?? [];
  const currentJuniorMembers =
    currentBodTerm?.members.filter((m) => m.tier === "junior") ?? [];

  const currentSeniorGroups =
    currentSeniorMembers.length > 0
      ? [
          {
            label: "SENIOR EXECUTIVE COMMITTEE",
            rows: chunkIntoRows(currentSeniorMembers.map(bodToMember), 3),
          },
        ]
      : [];

  const currentJuniorGroups =
    currentJuniorMembers.length > 0
      ? [
          {
            label: "JUNIOR COMMITTEE & ASSOCIATES",
            rows: chunkIntoRows(currentJuniorMembers.map(bodToMember), 3),
          },
        ]
      : [];

  const pastTerms = INITIAL_BOD_TERMS.filter(
    (t) => t.unitId === "sb" && t.state === "past",
  ).map((t) => ({
    id: t.id,
    label: t.termLabel,
    seniorGroups: [
      {
        label: "SENIOR EXECUTIVE COMMITTEE",
        rows: chunkIntoRows(
          t.members.filter((m) => m.tier === "senior").map(bodToMember),
          3,
        ),
      },
    ],
    juniorGroups: [
      {
        label: "JUNIOR COMMITTEE & ASSOCIATES",
        rows: chunkIntoRows(
          t.members.filter((m) => m.tier === "junior").map(bodToMember),
          3,
        ),
      },
    ],
  }));

  return (
    <section
      id="committee"
      data-land="committee"
      className="flex w-full max-w-280 flex-col items-center gap-7 px-4 sm:px-6 md:px-10 pb-16 sm:pb-20 md:pb-30"
      style={
        {
          "--unit-brand": "#00629B",
          "--unit-ink": "#00629B",
          "--unit-tint": "#00629B14",
          "--unit-line": "#00629B40",
          "--unit-hover": "#00629B2E",
        } as CSSProperties
      }
    >
      <SectionHeading center title="Executive committee" />
      {advisors.length > 0 ? (
        <UnitPeople
          groups={[{ label: "BRANCH COUNSELOR & ADVISORS", rows: [advisors] }]}
          brand="#00629B"
        />
      ) : null}
      <UnitExCom
        currentLabel={currentBodTerm?.termLabel ?? "2025/2026"}
        currentSenior={currentSeniorGroups}
        currentJunior={currentJuniorGroups}
        terms={pastTerms}
        brand="#00629B"
      />
    </section>
  );
}
