/**
 * Photography manifest.
 *
 * Every frame here is duotoned into IEEE Blue before it reaches the page, so no
 * photograph introduces a colour outside the palette. Deliberately no images of
 * identifiable people: a stock photograph of a stranger must never imply that
 * the person is a member of this branch.
 *
 * Licences are recorded with the assets. The three CC BY images are attributed
 * in the site footer.
 */

export type Photo = {
  readonly src: string;
  /** Describes the frame for a screen reader, in the duotone it appears as. */
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** Omitted for CC0 frames, which require no attribution. */
  readonly credit?: { readonly author: string; readonly license: string };
};

export const photos = {
  /** Hero. Industrial automation hardware, the discipline the branch is named
      for, treated as depth rather than as documentation. */
  hero: {
    src: "/photos/robotics-arm.jpg",
    alt: "Duotone blue industrial robotic arm and automation equipment in a laboratory",
    width: 1800,
    height: 1198,
    credit: {
      author: "Shixart1985",
      license: "CC BY 2.0",
    },
  },

  /** Mission interlude. Instrument detail, used at full bleed. */
  instrument: {
    src: "/photos/control-panel.jpg",
    alt: "Duotone blue close detail of control equipment and instrumentation on display",
    width: 1600,
    height: 1065,
    credit: {
      author: "Shixart1985",
      license: "CC BY 2.0",
    },
  },

  /** Footer texture. A liquid-crystal macro, the one organic frame on the page,
      used at low contrast behind type. */
  texture: {
    src: "/photos/liquid-crystal.jpg",
    alt: "",
    width: 1600,
    height: 1200,
    credit: {
      author: "Wojciech Tomczyk",
      license: "CC BY 4.0",
    },
  },

  /* ---------------------------------------------------------------------
     Event plates.

     Five frames, one per gallery plate, keyed to the event they illustrate.

     These are CC0 and carry no `credit`, because CC0 requires no attribution.
     Source is recorded in the comment beside each anyway, a future editor
     replacing them needs to know where the frame came from, and that is not
     something the absence of a credit line should have to answer.

     They are illustrative, not documentary. No photograph on this site claims to
     show an actual branch activity, because none does: a stock frame of a
     stranger must never imply the person in it is a member, and a stock frame of
     a lab must never imply the branch ran that session. The events section
     states this on the page for the same reason.
     ------------------------------------------------------------------- */

  /** Plate for the Industry Applications Society session. */
  eventPlc: {
    src: "/photos/events/plc-panel.jpg",
    alt: "Duotone blue industrial control panel with switches and indicator lamps",
    width: 960,
    height: 636,
    // StockSnap, CC0.
  },

  /** Plate for the Computer Society build night. */
  eventVision: {
    src: "/photos/events/vision-code.jpg",
    alt: "Duotone blue computer screen showing source code",
    width: 960,
    height: 640,
    // StockSnap, CC0.
  },

  /** Plate for the WIE clinic: the paperwork, not a portrait. */
  eventClinic: {
    src: "/photos/events/cv-clinic.jpg",
    alt: "Duotone blue open notebook and pen on a plain desk",
    width: 960,
    height: 638,
    // StockSnap, CC0.
  },

  /** Plate for the Robotics and Automation Society workshop. */
  eventRobot: {
    src: "/photos/events/ros-robot.jpg",
    alt: "Duotone blue robot hardware in an engineering workshop",
    width: 960,
    height: 640,
    // StockSnap, CC0.
  },

  /** Plate for the branch hack night. */
  eventCircuit: {
    src: "/photos/events/hack-night.jpg",
    alt: "Duotone blue macro detail of a printed circuit board",
    width: 960,
    height: 641,
    // StockSnap, CC0.
  },
} as const satisfies Record<string, Photo>;

/**
 * Distinct credits, deduplicated, for the footer attribution line.
 *
 * The cast is load-bearing rather than a shortcut. `as const satisfies
 * Record<string, Photo>` keeps each frame's literal types, so `Object.values`
 * infers a union of the *specific* frame shapes, and a CC0 frame genuinely has
 * no `credit` property, so `frame.credit` does not type-check on the union.
 * Widening to the declared `Photo` first is what puts the optional property back
 * on the type, and it is sound because `satisfies` already proved every member
 * is a `Photo`.
 */
const frames: readonly Photo[] = Object.values(photos);

/**
 * Cover lookup by `src`.
 *
 * A page that renders one of these frames — the event preview route reads the
 * recorded alt text and intrinsic size for its plate — finds them here instead
 * of repeating them beside the path, so the manifest stays the single place a
 * frame is described.
 */
export const photoBySrc: Readonly<Record<string, Photo>> = Object.fromEntries(
  frames.map((frame) => [frame.src, frame] as const),
);

export const photoCredits: readonly string[] = frames
  .map((frame) => frame.credit)
  .filter((credit): credit is NonNullable<Photo["credit"]> => Boolean(credit))
  .map((credit) => `${credit.author} (${credit.license})`)
  .filter((value, index, all) => all.indexOf(value) === index);