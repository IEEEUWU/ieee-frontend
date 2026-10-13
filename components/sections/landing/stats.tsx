import { STATS } from "./data";
import { BORDER_STATS } from "./styles";

/**
 * Four figures on one bordered plate. Responsive: 2x2 grid on mobile, 4 columns on desktop.
 */
export function LandingStats() {
  return (
    <div className="w-full max-w-[1120px] px-4 sm:px-6 md:px-10">
      <section
        data-land="stats"
        className={`${BORDER_STATS} grid w-full grid-cols-2 md:grid-cols-4 justify-center gap-px overflow-hidden rounded-[20px] bg-[#0B1B2B1A]`}
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex h-full w-full flex-col items-start gap-1 self-start bg-white p-5 sm:p-7"
          >
            <p className="w-full text-[32px] sm:text-[40px] md:text-[44px] font-semibold tracking-[-1px] text-[#00629B]">
              {stat.value}
            </p>
            <p className="w-full text-[13px] sm:text-[15px] text-[#4A5B6B] leading-snug">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
