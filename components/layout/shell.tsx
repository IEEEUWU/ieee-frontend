import type { ReactNode } from "react";

/**
 * The page grid.
 *
 * One container width for every section, so the vertical rules line up from the
 * navigation to the footer and the composition reads as a single sheet rather
 * than as a stack of independently sized blocks.
 *
 * The gutter is fluid between 20px and 48px: 20 on a phone, 32 on a tablet,
 * 48 from the desktop breakpoint. All three are multiples of 4.
 */
export function Shell({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "header" | "footer" | "nav" | "section";
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * Section rhythm.
 *
 * Vertical padding is 64px on mobile, 96px from tablet, 128px on desktop, so
 * every section lands on the same 4px grid and the page has one tempo. The
 * border is a hairline rather than a change of background, because this page
 * commits its one colour inversion to a single place: the closing action block.
 */
/**
 * The four surface tones a section may sit on.
 *
 * A named union rather than a bare `string`, so the tone map below is checked
 * against it at compile time. It previously declared `Record<string, string>`,
 * which types every key as present and every lookup as a valid string — meaning a
 * typo like `tone="inverted"` compiled cleanly and rendered a section with no
 * background at all.
 *
 * `inverse` is reserved for the single closing action block. Adding a fifth tone
 * is the one change here that would need a design decision, which is exactly what
 * a union is for.
 */
export type SectionTone = "plain" | "surface" | "secondary" | "inverse";

const TONES: Record<SectionTone, string> = {
  plain: "bg-background text-text",
  surface: "bg-surface text-text",
  secondary: "bg-secondary text-text",
  inverse: "on-inverse bg-inverse text-inverse-text",
};

export function Section({
  id,
  children,
  className = "",
  tone = "plain",
  as: Tag = "section",
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  as?: "section" | "div";
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={`${TONES[tone]} border-t border-border py-16 md:py-24 lg:py-32 ${className}`}
    >
      <Shell>{children}</Shell>
    </Tag>
  );
}

/**
 * Section heading pair. One component so every section on the page introduces
 * itself the same way: a mono code, a headline, and at most one line of context.
 */
export function SectionHeading({
  code,
  title,
  lede,
  id,
  className = "",
}: {
  /** Short technical reference, e.g. the charter code or section index. */
  code: string;
  title: string;
  lede?: string;
  /** Id for the heading, so the section can point at it. */
  id?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="label-mono text-primary">{code}</p>
      <h2
        id={id}
        className="mt-6 max-w-[18ch] text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.98] tracking-[-0.035em]"
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-6 max-w-[62ch] text-[clamp(1rem,1.3vw,1.1875rem)] leading-relaxed text-muted">
          {lede}
        </p>
      ) : null}
    </div>
  );
}