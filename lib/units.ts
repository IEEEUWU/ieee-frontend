/**
 * The five societies chartered under the branch, and the public events repository.
 *
 * Two rules govern this file.
 *
 * 1. Society identity and charter scope are fixed by IEEE, so they are safe to
 *    publish as confirmed.
 * 2. Anything branch-specific that has not been supplied is listed in `pending`
 *    and rendered as a designed pending state. It is never invented, and an
 *    invented date would be worse than an empty list.
 */

export type SocietyId = "sb" | "ias" | "cs" | "ras" | "wie";

/**
 * Society identity colour.
 *
 * Each IEEE society has its own established hue, and using the real one is the
 * only honest way to colour-code them: a student who has seen an IAS poster at a
 * Section event should recognise it here.
 *
 * Each society therefore carries two values, and the distinction matters:
 *
 *   `brand` the society's true hue. For fills, bars and marks large enough to
 *           read as a shape rather than as text.
 *   `ink`   a darkened variant of the same hue. For anything that has to be
 *           read as type, a hairline or a focus ring.
 *
 * The split is forced by contrast, not by taste. IEEE CS orange (#E8730C) is
 * only 3.05:1 on white, which fails AA for body text and even fails the 3:1
 * relaxed threshold that display type is allowed. Its ink (#B4530A) reaches
 * 5.02:1 on white and 4.68:1 on the surface tone. Every `ink` below clears
 * 4.5:1 on both white and #F6F7F8.
 */
export type SocietyColour = {
  /** True society hue. Fills and marks only. */
  readonly brand: string;
  /** Text-safe variant. Anything the reader has to read. */
  readonly ink: string;
};

export type UnitType = "branch" | "chapter" | "affinity_group";

export type Society = {
  id: SocietyId;
  /** Charter abbreviation. Rendered in tabular figures as an index reference. */
  abbreviation: string;
  name: string;
  /** Charter scope, published wording. */
  scope: string;
  /** Technical areas students work in under this society. */
  areas: readonly string[];
  /** Fields the branch has not supplied yet. Never filled in by guesswork. */
  pending: readonly string[];
  colour: SocietyColour;
  /** Organizational hierarchy type */
  unitType: UnitType;
  /** Human-readable category label */
  unitTypeLabel: string;
  /** Parent unit id, null for the apex student branch */
  parentId: SocietyId | null;
  /** Subdomain or dedicated sub-page URL for this unit (can be external or internal route) */
  portalUrl: string | null;
  /** Display label for the portal action */
  portalLabel: string;
};

export const societies: readonly Society[] = [
  {
    id: "sb",
    abbreviation: "SB",
    name: "IEEE Student Branch",
    unitType: "branch",
    unitTypeLabel: "Apex Student Branch",
    parentId: null,
    portalUrl: "/",
    portalLabel: "Branch Portal",
    scope:
      "The umbrella parent organization. It oversees branch governance, sets the overarching calendar, and anchors the public technical events that all chapters and affinity groups build upon.",
    areas: ["Branch governance", "Public events & hackathons", "Inter-chapter initiatives"],
    pending: ["Branch officer roster", "Annual activity report"],
    colour: { brand: "#00629B", ink: "#00629B" },
  },
  {
    id: "ias",
    abbreviation: "IAS",
    name: "Industrial Automation Society",
    unitType: "chapter",
    unitTypeLabel: "Technical Chapter",
    parentId: "sb",
    portalUrl: "/chapters/ias",
    portalLabel: "IAS Chapter Portal",
    scope:
      "Process control, instrumentation and factory automation. Members work on control loops, plant logic and the measurement systems that run real equipment.",
    areas: [
      "Process control and instrumentation",
      "PLC and distributed control",
      "Energy and industry practice",
    ],
    pending: ["Society mark", "Officer roster", "Session schedule"],
    colour: { brand: "#00843D", ink: "#00622E" },
  },
  {
    id: "cs",
    abbreviation: "CS",
    name: "Computer Society",
    unitType: "chapter",
    unitTypeLabel: "Technical Chapter",
    parentId: "sb",
    portalUrl: "/chapters/cs",
    portalLabel: "Computer Society Portal",
    scope:
      "Computing practice end to end: languages, systems, networks, data and security. Members build software, run infrastructure and test systems on purpose.",
    areas: ["Software and systems", "Networks and security", "Data and machine learning"],
    pending: ["Society mark", "Officer roster", "Session schedule"],
    colour: { brand: "#E8730C", ink: "#B4530A" },
  },
  {
    id: "ras",
    abbreviation: "RAS",
    name: "Robotics and Automation Society",
    unitType: "chapter",
    unitTypeLabel: "Technical Chapter",
    parentId: "sb",
    portalUrl: "/chapters/ras",
    portalLabel: "RAS Chapter Portal",
    scope:
      "Robotics, mechatronics and control. Members build machines that sense and act, from embedded controllers through to autonomous platforms.",
    areas: ["Embedded systems", "Robot design and control", "Autonomous platforms"],
    pending: ["Society mark", "Officer roster", "Session schedule"],
    colour: { brand: "#A6192E", ink: "#8C1526" },
  },
  {
    id: "wie",
    abbreviation: "WIE",
    name: "Women in Engineering",
    unitType: "affinity_group",
    unitTypeLabel: "Affinity Group",
    parentId: "sb",
    portalUrl: "/affinity/wie",
    portalLabel: "WIE Affinity Portal",
    scope:
      "Advances the participation and progression of women in engineering. Members run outreach, mentoring and STEM programmes for the campus and the surrounding schools under the Student Branch.",
    areas: ["Outreach and mentoring", "STEM programmes", "Career and interview support"],
    pending: ["Society mark", "Officer roster", "Session schedule"],
    colour: { brand: "#6B2FA0", ink: "#5A2288" },
  },
];
