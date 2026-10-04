/**
 * Signal trace.
 *
 * A decorative circuit-trace layer, drawn as inline SVG rather than in a canvas.
 *
 * The choice is deliberate: a canvas version of this needs a client component, a
 * resize observer, a devicePixelRatio-aware backing store and a running rAF loop
 * to animate strokes that SVG expresses declaratively with two attributes. Same
 * visual result, no main-thread work, and it renders on the server.
 *
 * The traces draw themselves in as the block enters the viewport, driven by a
 * CSS `view()` timeline rather than a JavaScript scroll listener, so the whole
 * component ships as zero JavaScript. It is `aria-hidden` and takes no pointer
 * events: it is texture behind type, never an interactive layer.
 */

type Trace = {
  d: string;
  /** Draw order. Traces land in sequence, so the eye follows the signal. */
  delay: number;
  width: number;
};

/** Orthogonal routes with right-angle turns, like a routed PCB layer. */
const TRACES: readonly Trace[] = [
  { d: "M40 96 H300 L340 136 H620", delay: 0, width: 1.5 },
  { d: "M40 176 H220 L260 216 H520 L560 256 H900", delay: 0.08, width: 1.5 },
  { d: "M40 296 H380 L420 336 H700 L740 296 H1160", delay: 0.16, width: 1.5 },
  { d: "M120 424 H520 L560 384 H820", delay: 0.24, width: 1.5 },
  { d: "M680 496 H1000 L1040 456 H1160", delay: 0.32, width: 1.5 },
  { d: "M200 56 V240 L240 280 V520", delay: 0.12, width: 1 },
  { d: "M920 64 V200 L960 240 V520", delay: 0.2, width: 1 },
];

/** Via pads at the turn points, sized as squares to match the page's zero radius. */
const PADS: readonly { x: number; y: number }[] = [
  { x: 300, y: 96 },
  { x: 340, y: 136 },
  { x: 220, y: 176 },
  { x: 260, y: 216 },
  { x: 380, y: 296 },
  { x: 420, y: 336 },
  { x: 520, y: 424 },
  { x: 560, y: 384 },
  { x: 700, y: 336 },
  { x: 740, y: 296 },
  { x: 1000, y: 496 },
  { x: 1040, y: 456 },
  { x: 240, y: 280 },
  { x: 960, y: 240 },
];

export function SignalTrace({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={`h-full w-full ${className}`}
    >
      <g stroke="currentColor" fill="none" strokeLinecap="square">
        {TRACES.map((trace) => (
          <path
            key={trace.d}
            d={trace.d}
            strokeWidth={trace.width}
            pathLength={1}
            className="trace-draw"
            style={{ animationDelay: `${trace.delay}s` }}
          />
        ))}
      </g>
      <g fill="currentColor">
        {PADS.map((pad) => (
          <rect
            key={`${pad.x}-${pad.y}`}
            x={pad.x - 4}
            y={pad.y - 4}
            width={8}
            height={8}
            className="trace-pad"
          />
        ))}
      </g>
    </svg>
  );
}