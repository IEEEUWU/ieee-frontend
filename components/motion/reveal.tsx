"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Motion primitives.
 *
 * Every animation on this page is defined here once and composed elsewhere. No
 * section hand-rolls a transition, an easing curve or an easing array, so the
 * motion language stays coherent and a change to it is a change to one file.
 *
 * The house curve is a single exponential ease-out. Long tail, no overshoot:
 * content decelerates into place rather than snapping.
 */

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared duration scale. Everything is a multiple of 60ms. */
const DURATION = {
  fast: 0.24,
  base: 0.48,
  slow: 0.8,
} as const;

/**
 * Masked word reveal: the hero headline arriving word by word.
 *
 * Each word sits in an overflow-hidden line box and slides up from beneath its
 * own mask, which is what makes it read as type being set rather than as text
 * fading in. Words are real inline text in the DOM, so the headline is real HTML
 * for search engines and screen readers alike.
 */
export function MaskedText({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={className}>
        {lines.map((line, index) => (
          <span key={line} className={lineClassName}>
            {index > 0 ? " " : null}
            {line}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="shown"
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.09, delayChildren: delay } },
      }}
    >
      {lines.map((line) => (
        <span key={line} className={`block overflow-hidden ${lineClassName ?? ""}`}>
          <motion.span
            className="block"
            variants={{
              hidden: { y: "110%" },
              shown: {
                y: "0%",
                transition: { duration: DURATION.slow, ease: EASE },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
