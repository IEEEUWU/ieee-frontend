import Link from "next/link";
import { RULE_TOP_FAINT, TEXT_15_MED } from "./styles";

/**
 * The chapter identity a unit page's footer carries: its name leading the
 * address line, its charter letters in the wordmark, and its brand colour in
 * the wordmark gradient. Optional — the homepage and /events pass nothing
 * and render the published branch footer byte for byte.
 */
export type FooterIdentity = {
  /** Full display name leading the address, e.g. "IEEE Computer Society". */
  readonly name: string;
  /** Charter letters for the wordmark, e.g. "IEEECS". */
  readonly wordmark: string;
  /** The unit's brand colour, replacing IEEE blue in the gradient. */
  readonly brand: string;
};

/**
 * Full-bleed footer: three columns, oversized wordmark.
 * Responsive: stacks cleanly on mobile, fluid typography.
 */
export function LandingFooter({ identity }: { identity?: FooterIdentity }) {
  const accent = identity?.brand ?? "#00629B";

  return (
    <footer
      data-land="footer"
      className={`${RULE_TOP_FAINT} flex w-full flex-col items-start gap-8 sm:gap-10 bg-white px-4 sm:px-6 md:px-10 pt-10 sm:pt-16 pb-0`}
    >
      <div className="flex w-full flex-col md:flex-row items-start justify-between gap-6 md:gap-8">
        <div className="w-full md:w-[320px]">
          <p className="text-[14px] sm:text-[15px] leading-[1.6] text-[#4A5B6B]">
            {identity?.name ?? "IEEE Student Branch"}, Uva Wellassa University,
            Passara Road, Badulla, Sri Lanka
          </p>
        </div>
        <div>
          <div className={`${TEXT_15_MED} flex flex-wrap items-center gap-x-2 gap-y-1`}>
            <Link href="/cs" className="hover:text-[#00629B] hover:underline">
              Computer Society
            </Link>
            <span aria-hidden="true" className="text-[#8796A5]">·</span>
            <Link href="/ias" className="hover:text-[#00629B] hover:underline">
              IAS
            </Link>
            <span aria-hidden="true" className="text-[#8796A5]">·</span>
            <Link href="/ras" className="hover:text-[#00629B] hover:underline">
              RAS
            </Link>
            <span aria-hidden="true" className="text-[#8796A5]">·</span>
            <Link href="/wie" className="hover:text-[#00629B] hover:underline">
              WIE
            </Link>
            <span aria-hidden="true" className="text-[#8796A5]">·</span>
            <Link href="/events" className="hover:text-[#00629B] hover:underline">
              Events
            </Link>
          </div>
        </div>
        <div>
          <p className="text-[14px] sm:text-[15px] text-[#8796A5]">
            © 2026 IEEE UWU
          </p>
        </div>
      </div>
      <svg
        viewBox="0 0 74 18"
        className="block h-auto w-full select-none"
        role="img"
        aria-label={identity?.name ?? "IEEE UWU"}
      >
        <defs>
          <linearGradient
            id="landing-wordmark-gradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="18"
            x2="0"
            y2="0"
          >
            <stop offset="0" stopColor={accent} />
            <stop offset="0.4" stopColor={accent} />
            <stop offset="1" stopColor={accent} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <text
          x="37"
          y="14.8"
          textAnchor="middle"
          textLength="74"
          lengthAdjust="spacingAndGlyphs"
          fontSize="16"
          fontWeight="700"
          fill="url(#landing-wordmark-gradient)"
        >
          {identity?.wordmark ?? "IEEEUWU"}
        </text>
      </svg>
    </footer>
  );
}
