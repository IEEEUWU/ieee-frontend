import { STATS } from "./data";
import { BORDER_STATS } from "./styles";

/**
 * Four figures on one bordered plate. The 1px gaps between cells expose the
 * plate's tinted ground, which is what draws the internal dividers.
 */
export function LandingStats() {
  return (
    <section
      data-land="stats"
      className={`${BORDER_STATS} grid w-full max-w-[1040px] grid-cols-4 justify-center gap-px rounded-[20px] bg-[#0B1B2B1A]`}
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex h-full w-full flex-col items-start gap-1 self-start bg-white p-7"
        >
          <p className="w-full text-[44px] font-semibold tracking-[-1px] text-[#00629B]">
            {stat.value}
          </p>
          <p className="w-full text-[15px] text-[#4A5B6B]">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}
