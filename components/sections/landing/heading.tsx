/**
 * Section headings.
 * Responsive: stacked on mobile, split row on desktop. Fluid display sizes.
 */

const TITLE =
  "text-[28px] sm:text-[36px] md:text-[48px] font-semibold tracking-[-0.7px] sm:tracking-[-1.2px] md:tracking-[-1.5px] leading-[1.15] text-[#0B1B2B]";
const LEDE = "text-[15px] sm:text-[17px] leading-[1.6] text-[#4A5B6B]";

export function SectionHeading({
  title,
  lede,
  center = false,
}: {
  title: string;
  /** Supporting line in the right-hand column (split form). */
  lede?: string;
  /** Centred single-line form instead of the split row. */
  center?: boolean;
}) {
  if (center) {
    return (
      <div className="w-full px-2">
        <h2 className={`text-center ${TITLE}`}>{title}</h2>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col md:flex-row md:items-end justify-between gap-3 md:gap-8">
      <div className="w-full md:w-[560px]">
        <h2 className={TITLE}>{title}</h2>
      </div>
      {lede ? (
        <div className="w-full md:w-[360px]">
          <p className={LEDE}>{lede}</p>
        </div>
      ) : null}
    </div>
  );
}
