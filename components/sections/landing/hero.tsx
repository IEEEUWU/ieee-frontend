import { BORDER_BTN2 } from "./styles";

/**
 * Opening block: status badge, display headline, lede, two actions.
 * Responsive for mobile to desktop screen widths.
 */
export function LandingHero() {
  return (
    <section
      data-land="hero"
      className="flex w-full max-w-[1120px] flex-col items-start gap-6 sm:gap-8 px-4 sm:px-6 md:px-10 pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-16 md:pb-20"
    >
      <div
        data-land="badge"
        className="flex flex-row items-center gap-2 rounded-full bg-[#00629B14] px-3.5 sm:px-4 py-1.5 sm:py-2"
      >
        <div className="h-2 w-2 shrink-0 rounded-full bg-[#00629B]" />
        <p className="whitespace-normal sm:whitespace-pre text-[12px] sm:text-[14px] font-medium text-[#00629B]">
          IEEE Student Branch · Uva Wellassa University, Badulla
        </p>
      </div>
      <div className="w-full">
        <h1 className="text-[36px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-semibold tracking-[-1px] sm:tracking-[-1.5px] md:tracking-[-2.5px] leading-[1.08] text-[#0B1B2B]">
          Advancing technology for humanity, starting on campus.
        </h1>
      </div>
      <div className="w-full max-w-[680px]">
        <p className="text-[16px] sm:text-[19px] leading-[1.6] text-[#4A5B6B] text-pretty">
          We are a community of engineers, builders and researchers at UWU,
          connecting students to the world&apos;s largest technical professional
          organization through workshops, competitions and real-world projects.
        </p>
      </div>
      <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
        <a
          href="#join"
          className="rounded-full bg-[#00629B] px-7 py-3.5 sm:py-4 text-center text-[15px] sm:text-[16px] font-semibold text-white transition-colors hover:bg-[#005282]"
        >
          Become a member
        </a>
        <a
          href="#chapters"
          className={`${BORDER_BTN2} rounded-full bg-white px-7 py-3.5 sm:py-4 text-center text-[15px] sm:text-[16px] font-semibold text-[#0B1B2B] transition-colors hover:bg-[#EBF2F7]`}
        >
          Explore chapters
        </a>
      </div>
    </section>
  );
}
