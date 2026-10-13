import type { ReactNode } from "react";
import { Clock } from "@phosphor-icons/react/ssr";
import { SectionHeading } from "@/components/sections/landing/heading";
import { BORDER_CARD, LABEL_SM } from "@/components/sections/landing/styles";

/**
 * Section shell for the chapter page. Responsive vertical padding.
 */
export function UnitSection({
  id,
  title,
  lede,
  center = false,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  /** Centered committee-style heading instead of the split form. */
  center?: boolean;
  children: ReactNode;
}) {
  if (center) {
    return (
      <section
        id={id}
        className="flex w-full max-w-280 flex-col items-center gap-6 sm:gap-7 pt-10 sm:pt-14 md:pt-18"
      >
        <SectionHeading center title={title} />
        <div className="flex w-full flex-col items-center gap-6 sm:gap-7">
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="flex w-full max-w-280 flex-col items-start gap-8 sm:gap-12 pt-10 sm:pt-14 md:pt-18"
    >
      <SectionHeading title={title} lede={lede} />
      <div className="flex w-full flex-col gap-5">{children}</div>
    </section>
  );
}

/**
 * The designed awaiting-publication state, as a landing card.
 */
export function PendingCard({
  title = "AWAITING OFFICIAL PUBLICATION",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${BORDER_CARD} relative flex w-full gap-3.5 sm:gap-4 rounded-3xl bg-white p-5 sm:p-8`}>
      <Clock
        size={20}
        weight="bold"
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-(--unit-brand)"
      />
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <h3 className={`${LABEL_SM} text-[#8796A5]`}>{title}</h3>
        <p className="max-w-[64ch] text-[14px] sm:text-[15px] leading-[1.6] text-[#4A5B6B]">
          {children}
        </p>
      </div>
    </div>
  );
}
