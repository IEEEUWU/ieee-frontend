"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

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
export const DURATION = {
  fast: 0.24,
  base: 0.48,
  slow: 0.8,
} as const;

type RevealProps = {
  children: ReactNode;
  /** Seconds. Stagger between siblings when used inside a stagger group. */
  delay?: number;
  /** Travel distance in pixels. Zero gives a pure fade. */
  y?: number;
  x?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "header" | "footer";
};

/**
 * Reveal: the section-level entrance. Fades and translates into place the first
 * time it enters the viewport, then never animates again.
 *
 * Under `prefers-reduced-motion: reduce` the element is rendered in its final
 * state immediately, with no transform and no opacity change, so the page is
 * fully readable rather than merely unanimated.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: DURATION.slow, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

const groupVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

/**
 * Stagger: a parent that reveals its children in sequence. Used where a list
 * reads as one thought arriving in parts rather than as N separate items.
 */
export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}

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