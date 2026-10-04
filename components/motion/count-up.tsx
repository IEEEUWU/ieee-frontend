"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/reveal";

/**
 * Count-up.
 *
 * Counts a figure once, when it first enters the viewport, and never again.
 *
 * The rendered markup always contains the *final* value, including in the
 * server response. The animation is a client-side refinement layered over
 * correct HTML, so a crawler, a screen reader or a browser with JavaScript
 * disabled all read the real number rather than a zero that never arrives.
 *
 * The value is deliberately never a live region: a counter that announces
 * itself on every frame is hostile to anyone listening.
 */
export function CountUp({
  value,
  duration = 1.3,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return <span ref={ref}>{shown}</span>;
}