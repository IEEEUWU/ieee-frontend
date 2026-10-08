import { RULE_TOP_FAINT, TEXT_15_MED } from "./styles";

/**
 * Full-bleed footer: three text columns, then the oversized IEEEUWU
 * wordmark stretched across the viewport.
 *
 * The wordmark is an SVG sized by aspect ratio (74:18). Its text is set
 * with textLength so the glyphs fill the frame exactly, and filled with the
 * source's vertical gradient: solid IEEE blue through the lower 40%,
 * fading to near-nothing at the top.
 */
export function LandingFooter() {
  return (
    <footer
      data-land="footer"
      className={`${RULE_TOP_FAINT} flex w-full flex-col items-start gap-10 bg-white px-10 pt-16 pb-0`}
    >
      <div className="flex w-full flex-row items-start justify-between">
        <div className="w-[320px]">
          <p className="text-[15px] leading-[1.6] text-[#4A5B6B]">
            IEEE Student Branch, Uva Wellassa University, Passara Road, Badulla,
            Sri Lanka
          </p>
        </div>
        <div>
          <p className={TEXT_15_MED}>
            Computer Society · IAS · RAS · WIE
          </p>
        </div>
        <div>
          <p className="whitespace-pre text-[15px] text-[#8796A5]">
            © 2026 IEEE UWU
          </p>
        </div>
      </div>
      <svg
        viewBox="0 0 74 18"
        className="block h-auto w-full"
        role="img"
        aria-label="IEEE UWU"
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
            <stop offset="0" stopColor="#00629B" />
            <stop offset="0.4" stopColor="#00629B" />
            <stop offset="1" stopColor="#00629B" stopOpacity="0.05" />
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
          IEEEUWU
        </text>
      </svg>
    </footer>
  );
}
