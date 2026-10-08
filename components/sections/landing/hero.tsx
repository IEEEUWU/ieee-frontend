import { BORDER_BTN2 } from "./styles";

/**
 * Opening block: status badge, display headline, lede, two actions.
 *
 * The headline wrapper fills the column (text-wrap: balance does the rest);
 * the lede is capped at 680px so it breaks where the source breaks.
 */
export function LandingHero() {
  return (
    <section
      data-land="hero"
      className="flex w-full max-w-[1120px] flex-col items-start gap-8 px-10 pt-24 pb-20"
    >
      <div
        data-land="badge"
        className="flex flex-row items-center gap-2 rounded-full bg-[#00629B14] px-4 py-2"
      >
        <div className="h-2 w-2 rounded-full bg-[#00629B]" />
        <p className="whitespace-pre text-[14px] font-medium text-[#00629B]">
          IEEE Student Branch · Uva Wellassa University, Badulla
        </p>
      </div>
      <div className="w-full">
        <h1 className="text-[72px] font-semibold tracking-[-2.5px] leading-[1.05] text-[#0B1B2B]">
          Advancing technology for humanity, starting on campus.
        </h1>
      </div>
      <div className="w-[680px]">
        <p className="text-[19px] leading-[1.6] text-[#4A5B6B] text-pretty">
          We are a community of engineers, builders and researchers at UWU,
          connecting students to the world&apos;s largest technical professional
          organization through workshops, competitions and real-world projects.
        </p>
      </div>
      <div className="flex flex-row items-start gap-3">
        <a
          href="#join"
          className="rounded-full bg-[#00629B] px-7 py-4 text-[16px] font-semibold text-white"
        >
          Become a member
        </a>
        <a
          href="#chapters"
          className={`${BORDER_BTN2} rounded-full bg-white px-7 py-4 text-[16px] font-semibold text-[#0B1B2B]`}
        >
          Explore chapters
        </a>
      </div>
    </section>
  );
}
