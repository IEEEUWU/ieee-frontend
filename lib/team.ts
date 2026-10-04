import { type SocietyId } from "@/lib/units";

/**
 * The branch committee.
 *
 * This file models seats and their holders. `holder` is currently seeded with
 * sample names so the roster can be reviewed in a filled state — see
 * `lib/sample.ts` for how to replace them.
 *
 * The shape separates two things that are easy to conflate. A branch committee is
 * *constituted*: three branch-wide offices and one officer seat per chartered
 * society. That structure is a fact and publishes in full. Who holds each seat is
 * supplied by the branch, so `holder` is nullable and the section has a designed
 * state for it rather than a placeholder portrait.
 *
 * `discipline` is the field that stays useful even when a seat is vacant: it is
 * the technical field the work comes from, taken from the charter scope of the
 * society the seat reports to. It answers the question a prospective member
 * actually has about a committee.
 */

export type CommitteeSeat = {
  id: string;
  /** The office, as a branch constitution would name it. */
  role: string;
  /**
   * Society this seat reports to. `null` for the three branch-wide offices, which
   * sit above the societies rather than inside one.
   */
  societyId: SocietyId | null;
  /** What the seat is accountable for. */
  remit: string;
  /** The technical field the work comes from. Published, and always available. */
  discipline: string;
  /** Named holder. `null` renders an explicit awaiting-nomination state. */
  holder: string | null;
};

/**
 * Committee seats.
 *
 * Written out rather than derived from `societies`. The alternative was a
 * `filter().map()` that filled `discipline` with `areas[0]`, which is a real
 * charter area but an arbitrary choice of it — the first item in an array is
 * ordering, not meaning, and it silently changes if someone reorders the scope.
 * Each seat now names its own field.
 */
export const committee: readonly CommitteeSeat[] = [
  {
    id: "chair",
    role: "Branch Chair",
    societyId: null,
    remit:
      "Chairs the committee, sets the branch calendar, and represents the branch to the Section.",
    discipline: "Branch governance",
    holder: "Dilan Perera",
  },
  {
    id: "secretary",
    role: "Branch Secretary",
    societyId: null,
    remit:
      "Keeps minutes and records, handles correspondence, and maintains what the branch can actually prove.",
    discipline: "Administration and records",
    holder: "Nimasha Fernando",
  },
  {
    id: "treasurer",
    role: "Branch Treasurer",
    societyId: null,
    remit:
      "Holds the budget, tracks subscriptions, and files what the Section requires.",
    discipline: "Finance and Section reporting",
    holder: "Kasun Jayawardena",
  },
  {
    id: "officer-ias",
    role: "IAS Officer",
    societyId: "ias",
    remit:
      "Runs Industrial Automation Society sessions and reports the society's activity into the branch committee.",
    discipline: "Process control and instrumentation",
    holder: "Sanduni Wickramasinghe",
  },
  {
    id: "officer-cs",
    role: "CS Officer",
    societyId: "cs",
    remit:
      "Runs Computer Society sessions and reports the society's activity into the branch committee.",
    discipline: "Software and systems",
    holder: "Ruwan Bandara",
  },
  {
    id: "officer-ras",
    role: "RAS Officer",
    societyId: "ras",
    remit:
      "Runs Robotics and Automation Society sessions and reports the society's activity into the branch committee.",
    discipline: "Embedded systems and robot control",
    holder: "Ishara Gunathilake",
  },
  {
    id: "officer-wie",
    role: "WIE Officer",
    societyId: "wie",
    remit:
      "Runs Women in Engineering programmes and reports the society's activity into the branch committee.",
    discipline: "Outreach and mentoring",
    holder: "Amaya Dissanayake",
  },
];

/**
 * What the roster contains, counted rather than asserted.
 *
 * Plain numbers rather than a getter on a frozen object. A getter here reads
 * tidily but breaks the moment anything serialises this module — `JSON.stringify`
 * drops it, a spread evaluates it once and freezes that value, and React DevTools
 * shows a property that does not behave like its neighbours. Counting once at
 * module scope gives three ordinary numbers that mean the same thing everywhere.
 */
const filled = committee.filter((seat) => seat.holder !== null).length;

export const rosterStats = {
  seats: committee.length,
  filled,
  awaiting: committee.length - filled,
} as const;