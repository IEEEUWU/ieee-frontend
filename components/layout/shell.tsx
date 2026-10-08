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
    <Tag className={`mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Tag>
  );
}
