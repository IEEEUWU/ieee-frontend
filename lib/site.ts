/**
 * Branch identity and institutional facts.
 *
 * Everything here is either fixed by IEEE (society charters, the parent Section
 * relationship) or supplied by the branch. Nothing is inferred. A fact the
 * branch has not supplied is typed as `null` or omitted, so the page renders a
 * designed state instead of a plausible guess.
 */

export const lockup = {
  /** Official branch lockup, transparent vector SVG. */
  src: "/brand/uwu-sb-logo.svg",
  intrinsicWidth: 8567,
  intrinsicHeight: 1313,
} as const;

export const site = {
  branchName: "IEEE Uva Wellassa Student Branch",
  /** Set in type for the navigation bar, where the 6.52:1 lockup cannot stay
      legible. The lockup itself is used unboxed in the hero and the footer. */
  wordmark: { lead: "IEEE", tail: "UWU Student Branch" },
  university: "Uva Wellassa University",
  city: "Badulla",
  country: "Sri Lanka",
  parentBody: "IEEE Sri Lanka Section",
  region: "Region 10",
  sectionOffice: {
    known: "Trace Expert City, Colombo 10",
    postalLine: null as string | null,
  },
  /** One label for the join intent, reused in the header, hero and closing CTA
      so the action is named the same way everywhere it appears. */
  joinLabel: "Join the branch",
  establishedYear: null as number | null,
} as const;

/** Primary navigation. Order matches the order sections appear on the page. */
export const navLinks = [
  { href: "#societies", label: "Hierarchy" },
  { href: "#events", label: "Events" },
  { href: "#team", label: "Team" },
  { href: "#branch", label: "The branch" },
] as const;
