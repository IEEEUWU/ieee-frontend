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
};

export const societies: readonly Society[] = [
  {
    id: "sb",
    abbreviation: "SB",
    name: "IEEE Student Branch",
    scope:
      "The umbrella society. It runs the branch calendar and the public technical events that every other society builds on.",
    areas: ["Events and hackathons", "Technical workshops", "Branch governance"],
    pending: ["Branch officer roster", "Annual activity report"],
    colour: { brand: "#00629B", ink: "#00629B" },
  },
  {
    id: "ias",
    abbreviation: "IAS",
    name: "Industrial Automation Society",
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
    scope:
      "Advances the participation and progression of women in engineering. Members run outreach, mentoring and STEM programmes for the campus and the surrounding schools.",
    areas: ["Outreach and mentoring", "STEM programmes", "Career and interview support"],
    pending: ["Society mark", "Officer roster", "Session schedule"],
    colour: { brand: "#6B2FA0", ink: "#5A2288" },
  },
];

/**
 * Lookup, not a second source of truth.
 *
 * Four components need to resolve a `SocietyId` to a society, and three of them
 * were each rebuilding a `Map` at module scope to do it. That is one lookup
 * written four times, and it drifts the moment a section needs a different
 * accessor. It lives here, once, next to the data it indexes.
 *
 * `Map` rather than a plain object so a bad id yields `undefined` under a type
 * check, instead of quietly producing a prototype member.
 */
const index: ReadonlyMap<SocietyId, Society> = new Map(
  societies.map((item) => [item.id, item]),
);

/**
 * Resolve a society by id.
 *
 * Every `SocietyId` in this codebase is produced by iterating `societies` or from
 * the union declared above, so a miss means the data is internally inconsistent
 * rather than that a reader typed something wrong. Returning `Society` and
 * throwing is the honest signature: it turns a rendering bug into a loud failure
 * instead of an `undefined.colour` crash three components later.
 */
export function societyById(id: SocietyId): Society {
  const found = index.get(id);
  if (!found) {
    throw new Error(`Unknown society id: ${id}`);
  }
  return found;
}

/**
 * The text-safe colour for a society, or `undefined` where there is no society —
 * a branch-wide committee seat, or a marquee entry that is an institutional fact
 * rather than a charter scope.
 *
 * Null-tolerant on purpose, so no caller has to repeat the same guard.
 */
export function societyInk(
  id: SocietyId | null | undefined,
): string | undefined {
  return id ? index.get(id)?.colour.ink : undefined;
}
