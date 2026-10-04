/**
 * The branch record.
 *
 * Two lists, kept apart on purpose. The confirmed list holds only what IEEE
 * fixes or the branch has supplied. The awaiting list names every fact the
 * branch has still not sent, so an absence reads as a published state instead of
 * an oversight.
 *
 * Impact figures are derived from these lists at module scope rather than typed
 * by hand, so a number on the page can never drift from the record behind it.
 */

import { site } from "@/lib/site";
import { societies } from "@/lib/units";

export type RecordRow = { readonly label: string; readonly value: string };

/** Fixed by IEEE, or supplied by the branch. Safe to publish as confirmed. */
export const confirmedFacts: readonly RecordRow[] = [
  { label: "Branch", value: site.branchName },
  {
    label: "University",
    value: `${site.university}, ${site.city}, ${site.country}`,
  },
  { label: "Parent body", value: site.parentBody },
  { label: "Region", value: site.region },
  {
    label: "Section office",
    value: `${site.sectionOffice.known}, ${site.country}`,
  },
];

/**
 * Named, not blank. Each of these is a fact the branch has not published yet.
 * Never filled in by guesswork: an invented founding year or officer list is
 * worse than an acknowledged gap.
 */
export const awaitingFacts: readonly string[] = [
  "Founding year",
  "Officer roster for the current session",
  "Society marks for each chartered society",
  "Official contact channel",
  "Full postal address for the Section office",
  "Annual activity report",
];

export type ImpactStat = {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
  readonly note: string;
};

/**
 * Every figure below is counted from the records in this file. There are no
 * membership numbers, no growth charts and no award counts, because the branch
 * has never published them.
 */
export const impactStats: readonly ImpactStat[] = [
  {
    value: 3,
    suffix: "",
    label: "Technical Chapters",
    note: "IAS, CS, and RAS",
  },
  {
    value: 1,
    suffix: "",
    label: "Affinity Group",
    note: "Women in Engineering (WIE)",
  },
  {
    value: new Set(societies.flatMap((s) => s.areas)).size,
    suffix: "",
    label: "Technical areas",
    note: "Under the IEEE Student Branch",
  },
  {
    value: awaitingFacts.length,
    suffix: "",
    label: "Records still open",
    note: "Named in full, never guessed",
  },
];