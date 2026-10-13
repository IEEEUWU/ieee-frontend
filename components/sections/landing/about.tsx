import { LABEL_SM } from "./styles";

/**
 * Two-column statement: a fixed label column and the branch description
 * taking the remaining width. Responsive: stacks on mobile screens.
 */
export function LandingAbout() {
  return (
    <section
      id="about"
      data-land="about"
      className="flex w-full max-w-280 flex-col md:flex-row items-start gap-4 sm:gap-6 md:gap-16 px-4 sm:px-6 md:px-10 py-16 sm:py-20 md:py-30"
    >
      <div className="w-full md:w-60">
        <p className={`${LABEL_SM} text-[#00629B]`}>
          ABOUT THE BRANCH
        </p>
      </div>
      <div className="flex-1">
        <p className="text-[20px] sm:text-[26px] md:text-[32px] tracking-[-0.4px] md:tracking-[-0.6px] leading-[1.35] text-[#0B1B2B] text-pretty">
          The IEEE Student Branch of Uva Wellassa University gives students a
          platform to learn beyond the curriculum, lead real initiatives and
          connect with a global network of professionals, all while advancing
          technology for the benefit of humanity.
        </p>
      </div>
    </section>
  );
}
