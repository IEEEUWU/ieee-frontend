import { LABEL_SM } from "./styles";

/**
 * Two-column statement: a fixed label column and the branch description
 * taking the remaining width.
 */
export function LandingAbout() {
  return (
    <section
      id="about"
      data-land="about"
      className="flex w-full max-w-[1120px] flex-row items-start gap-16 px-10 py-[120px]"
    >
      <div className="w-[240px]">
        <p className={`${LABEL_SM} text-[#00629B]`}>
          ABOUT THE BRANCH
        </p>
      </div>
      <div className="flex-1">
        <p className="text-[32px] tracking-[-0.6px] leading-[1.35] text-[#0B1B2B] text-pretty">
          The IEEE Student Branch of Uva Wellassa University gives students a
          platform to learn beyond the curriculum, lead real initiatives and
          connect with a global network of professionals, all while advancing
          technology for the benefit of humanity.
        </p>
      </div>
    </section>
  );
}
