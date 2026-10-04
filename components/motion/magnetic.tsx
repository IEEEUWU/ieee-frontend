"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Magnetic button: the element leans toward the cursor while it is near, and
 * springs back on exit.
 *
 * Pointer-driven, so it is a progressive enhancement and not a control. It is
 * attached to real links and buttons whose behaviour never depends on it, and
 * it is skipped entirely for reduced motion and for coarse pointers, where there
 * is no cursor to follow.
 *
 * The offsets live in motion values and are written straight to the transform, so
 * following the pointer never re-renders a React tree.
 *
 * This module used to also export `Parallax` and `DepthScale`. Both are gone.
 * The page now settles on section boundaries, and an image translating or scaling
 * against the scroll fought that: the section could never land cleanly. Removing
 * them was not only a simplification but the thing that made the snap behave.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
  radius = 110,
}: {
  children: ReactNode;
  className?: string;
  /** Fraction of the cursor offset the element follows. */
  strength?: number;
  /** Activation radius in pixels from the element's centre. */
  radius?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 240, damping: 18, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 240, damping: 18, mass: 0.6 });

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(event) => {
        // A touch pointer has no hover position to follow, so the lean is a
        // pointer-only enhancement and never a requirement.
        if (event.pointerType === "touch") return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        if (Math.hypot(dx, dy) > radius) return;
        rawX.set(dx * strength);
        rawY.set(dy * strength);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}