import type { ReactNode } from "react";
import { Clock } from "@phosphor-icons/react/ssr";
import { SectionHeading } from "@/components/sections/landing/heading";
import { BORDER_CARD, LABEL_SM } from "@/components/sections/landing/styles";

/**
 * Section shell for the chapter page.
 *
 * The landing page's own split heading (48px display title, lede in the
 * right-hand 360px column) over child content, laid out on the same 1120px
 * canvas rhythm as the homepage sections. `center` switches to the form the
 * homepage's committee section uses — centred title, no lede, the section's
 * own 7px rhythm — because people sections keep that structure verbatim.
 * Content composes its own state: filled when the branch has supplied the
 * data, `PendingCard` when it has not.
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
        className="flex w-full max-w-[1120px] flex-col items-center gap-7"
      >
        <SectionHeading center title={title} />
        <div className="flex w-full flex-col items-center gap-7">
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="flex w-full max-w-[1120px] flex-col items-start gap-8"
    >
      <SectionHeading title={title} lede={lede} />
      <div className="flex w-full flex-col gap-5">{children}</div>
    </section>
  );
}

/**
 * The designed awaiting-publication state, as a landing card.
 *
 * Every block whose data the branch has not yet supplied renders this instead
 * of an empty box or a plausible placeholder. A named gap reads as a
 * published state; an invented roster cannot be taken back. The wording
 * mirrors the `pending` lists in `lib/units.ts`, so the page and the record
 * behind it always say the same thing, and the kicker is the landing's
 * 13px tracked label doing the job it was written for: naming a state.
 */
export function PendingCard({
  title = "Awaiting Official Publication",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${BORDER_CARD} relative flex w-full gap-4 rounded-3xl bg-white p-8`}>
      <Clock
        size={20}
        weight="bold"
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-[color:var(--unit-brand)]"
      />
      <div className="flex flex-col gap-2">
        <h3 className={`${LABEL_SM} text-[#8796A5]`}>{title}</h3>
        <p className="max-w-[64ch] text-[15px] leading-[1.6] text-[#4A5B6B]">
          {children}
        </p>
      </div>
    </div>
  );
}
