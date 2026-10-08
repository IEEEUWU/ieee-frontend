/**
 * Section headings.
 *
 * The source pairs a fixed 560px title column with a 360px lede on a
 * space-between row: chapters and events use that form verbatim. The
 * committee drops the lede and centres the title instead. Both wear the
 * one 48px display style, defined here once.
 */

const TITLE =
  "text-[48px] font-semibold tracking-[-1.5px] leading-[1.1] text-[#0B1B2B]";
const LEDE = "text-[17px] leading-[1.6] text-[#4A5B6B]";

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
      <div className="w-full">
        <h2 className={`text-center ${TITLE}`}>{title}</h2>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-row items-end justify-between">
      <div className="w-[560px]">
        <h2 className={TITLE}>{title}</h2>
      </div>
      <div className="w-[360px]">
        <p className={LEDE}>{lede}</p>
      </div>
    </div>
  );
}
