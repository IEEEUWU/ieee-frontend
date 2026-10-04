import Image from "next/image";
import { ArrowRight as ArrowGlyph } from "@phosphor-icons/react/ssr";
import { lockup, site } from "@/lib/site";
import { SAMPLE_DATA, sampleNotice } from "@/lib/sample";
import { Magnetic } from "@/components/motion/magnetic";
import type { Photo } from "@/lib/photos";

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
 * how wide the mark actually renders — without it, a 8567px-wide source would be
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

/**
 * Photography.
 *
 * Wraps `next/image` so every frame on the page gets the same duotone treatment,
 * which is what keeps imported photography inside the IEEE palette instead of
 * importing a second colour scheme. Alt text is required at the type level and
 * decorative frames must pass an empty string.
 */
export function Photo({
  photo,
  sizes,
  priority = false,
  className = "",
  position,
}: {
  photo: Photo;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Tailwind `object-position` value. Sets which part of the frame survives
      the crop when the layout aspect ratio differs from the photo's. */
  position?: string;
}) {
  return (
    <div className={`duotone ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover ${position ?? ""}`}
      />
    </div>
  );
}

type ActionProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Magnetic lean. Skipped automatically for touch and reduced motion. */
  magnetic?: boolean;
};

/**
 * Primary action: solid IEEE Blue, square, no radius. The single strongest
 * element on the page, used once per viewport at most.
 */
export function ActionPrimary({ href, children, className = "", magnetic }: ActionProps) {
  const inner = (
    <span className="group inline-flex min-h-14 items-center gap-3 bg-primary px-7 text-[15px] font-semibold text-inverse-text transition-colors duration-200 hover:bg-primary-deep">
      {children}
      <ArrowGlyph
        size={16}
        weight="regular"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </span>
  );

  return (
    <a href={href} className={`inline-flex ${className}`}>
      {magnetic ? <Magnetic className="inline-flex">{inner}</Magnetic> : inner}
    </a>
  );
}

/**
 * Secondary action: a text link with an arrow, never a second button. One filled
 * control per view keeps the primary action unambiguous.
 */
export function ActionSecondary({ href, children, className = "" }: ActionProps) {
  return (
    <a
      href={href}
      className={`group inline-flex min-h-11 items-center gap-2.5 border-b border-border py-2 text-[15px] font-semibold text-text transition-colors duration-200 hover:border-text ${className}`}
    >
      {children}
      <ArrowGlyph
        size={16}
        weight="regular"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </a>
  );
}

/**
 * Sample-data notice.
 *
 * Rendered by any section still showing placeholder records, and driven entirely
 * by the single flag in `lib/sample.ts`. Two sections need it, so it is one
 * component rather than two copies that can fall out of step — and it owns the
 * wording, so replacing the sample records is a data edit and not a copy edit.
 *
 * The markup is a `role="status"` aside rather than a plain `div`: it changes the
 * page's meaning the moment it appears or disappears, and a screen reader should
 * hear about that rather than discover it silently on the next focus.
 */
export function SampleNotice() {
  if (!SAMPLE_DATA) return null;

  return (
    <p
      role="status"
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-dashed border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-muted"
    >
      <span className="label-mono text-primary">{sampleNotice.label}</span>
      <span className="max-w-[62ch]">{sampleNotice.body}</span>
    </p>
  );
}