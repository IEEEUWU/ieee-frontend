 import type { SocietyId } from "@/lib/units";

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

/**
 * Headline promise. Used by the hero and, in shortened form, the marquee, so
 * the two never drift apart.
 */
export const promise = {
  headline: ["One student branch,", "three chapters, one group."],
  lede: "Engineering and computing students at Uva Wellassa University organize under the IEEE Student Branch, powered by three specialized technical chapters and our Women in Engineering affinity group.",
} as const;

/**
 * Continuous ticker content. Real charter scopes and real institutional facts,
 * never filler. Repeated twice in the DOM so the CSS marquee loops seamlessly.
 */
/**
 * Ticker content. Real charter scopes and real institutional facts, never
 * filler.
 *
 * An optional `societyId` lets a society's own entry wear its identity colour, so
 * the four technical scopes arrive pre-sorted by discipline while the
 * institutional facts stay in neutral ink. Colour here is doing work, not
 * decorating: it is the fastest possible way to say "four technical areas, one
 * organisation".
 */
export const tickerItems: readonly {
  readonly label: string;
  readonly societyId?: SocietyId;
}[] = [
  { label: "Industrial Automation", societyId: "ias" },
  { label: "Computing", societyId: "cs" },
  { label: "Robotics & Automation", societyId: "ras" },
  { label: "Women in Engineering", societyId: "wie" },
  { label: "IEEE Sri Lanka Section" },
  { label: "Uva Wellassa University" },
  { label: "Badulla, Sri Lanka" },
  { label: "Region 10" },
];

/** The branch has not published an official contact channel. Say so once, here. */
export const contactChannel = {
  published: false,
  value: null as string | null,
  reason: "No official contact channel has been published by the branch yet.",
} as const;

/** Public site address, used for canonical URLs, sitemap and social cards. */
export const siteUrl = "https://ieee-uwu-student-branch.vercel.app";
