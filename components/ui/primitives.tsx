import Image from "next/image";
import { ArrowRight as ArrowGlyph } from "@phosphor-icons/react/ssr";
import { lockup, site } from "@/lib/site";

/**
 * The official branch lockup.
 *
 * Rendered unboxed, undistorted, at its native 6.52:1 proportion, exactly as
 * supplied. It is never cropped, rotated, tinted or placed inside a container
 * that would change its shape. Where the mark cannot stay legible at the size a
 * layout demands, the layout gives way to the wordmark instead.
 *
 * `width`/`height` carry the true intrinsic pixel size so the browser reserves
 * the exact ratio and nothing can squash it. `sizes` then tells the optimiser
 * how wide the mark actually renders: without it, an 8567px-wide source would be
 * served at 3840px for a 280px slot, which is roughly two orders of magnitude
 * more image than the layout uses.
 */
export function Logo({
  className = "",
  sizes = "280px",
}: {
  className?: string;
  /** Rendered width, used to pick the right image candidate. */
  sizes?: string;
}) {
  const hasHeight = className.includes("h-");
  const hasWidth = className.includes("w-");
  const baseClass = `${hasHeight ? "" : "h-auto"} ${hasWidth ? "" : "w-full"}`.trim();
  const resolvedClass = `${baseClass} ${className}`.trim();

  return (
    <Image
      src={lockup.src}
      alt={site.branchName}
      width={lockup.intrinsicWidth}
      height={lockup.intrinsicHeight}
      sizes={sizes}
      unoptimized
      className={resolvedClass}
    />
  );
}

type ActionProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Primary action: solid IEEE Blue, square, no radius. The single strongest
 * element on the page, used once per viewport at most.
 */
export function ActionPrimary({ href, children, className = "" }: ActionProps) {
  return (
    <a href={href} className={`inline-flex ${className}`}>
      <span className="group inline-flex min-h-14 items-center gap-3 bg-primary px-7 text-[15px] font-semibold text-inverse-text transition-colors duration-200 hover:bg-primary-deep">
        {children}
        <ArrowGlyph
          size={16}
          weight="regular"
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </a>
  );
}
