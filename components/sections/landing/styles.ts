/**
 * Shared landing-page class constants.
 *
 * The source draws every border as an overlay pseudo-element rather than a
 * real border, so bordered boxes keep exactly the size of unbordered ones:
 * cards stay 240px, the six-card committee row still fits three per line.
 * `OVERLAY_FRAME` reproduces that: an absolutely positioned frame inset to
 * the element box (`relative` makes the host the positioning context), the
 * element's own radius inherited, contributing nothing to layout. The
 * variants add per-side widths and the exact source colour on top.
 *
 * The `LABEL_*` / `TEXT_*` constants capture the type styles worn by more
 * than one section, so a size or tracking change stays a single edit.
 * Every string here is written out in full so Tailwind's scanner sees each
 * utility literally: never build one by interpolating a colour.
 */

export const OVERLAY_FRAME =
  "relative before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:rounded-[inherit]";

export const BORDER_CARD = `${OVERLAY_FRAME} before:border before:border-[#0b1b2b14]`;
export const BORDER_STATS = `${OVERLAY_FRAME} before:border before:border-[#0b1b2b1a]`;
export const BORDER_BTN2 = `${OVERLAY_FRAME} before:border before:border-[#0b1b2b26]`;
export const BORDER_TAG = `${OVERLAY_FRAME} before:border before:border-[#00629b40]`;
export const RULE_TOP = `${OVERLAY_FRAME} before:border-t before:border-t-[#0b1b2b1a]`;
export const RULE_BOTTOM = `${OVERLAY_FRAME} before:border-b before:border-b-[#0b1b2b1a]`;
export const RULE_TOP_FAINT = `${OVERLAY_FRAME} before:border-t before:border-t-[#0b1b2b14]`;

/** The small uppercase-ish kicker above a paragraph or group (13px). */
export const LABEL_SM = "text-[13px] font-medium tracking-[1.5px]";

/** The 12px tracked label on chapter tags and event dates. */
export const LABEL_XS =
  "whitespace-pre text-[12px] font-medium tracking-[1.5px]";

/** Medium 15px ink text: nav links and the footer's chapter list. */
export const TEXT_15_MED =
  "whitespace-pre text-[15px] font-medium text-[#0B1B2B]";
