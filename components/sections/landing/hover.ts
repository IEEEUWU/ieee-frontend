/**
 * The single interaction curve used by the landing page's hover states.
 *
 * The source design springs every hover with the same parameters: a firm
 * 0.2-bounce spring that settles in 400ms, so both hover targets (chapter
 * cards, member social buttons) share this object.
 */
import type { Transition } from "motion/react";

export const hoverSpring: Transition = {
  type: "spring",
  bounce: 0.2,
  delay: 0,
  duration: 0.4,
};
