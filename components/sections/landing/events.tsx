import { EVENTS } from "./data";
import { SectionHeading } from "./heading";
import { BORDER_TAG, LABEL_XS, RULE_BOTTOM, RULE_TOP } from "./styles";

/**
 * Dated rows under a split heading. Each row is one grid of three: date
 * plate, title + description, chapter tag, separated by hairline rules.
 */
export function LandingEvents() {
  return (
    <section
      id="events"
      data-land="events"
      className="flex w-full max-w-280 flex-col items-start gap-12 px-10 pb-30"
    >
      <SectionHeading
        title="Upcoming events"
        lede="Workshops, competitions and talks open to every UWU student."
      />
      <div className={`${RULE_TOP} flex w-full flex-col gap-0`}>
        {EVENTS.map((event) => (
          <div
            key={event.title}
            className={`${RULE_BOTTOM} flex w-full flex-row items-center gap-10 px-2 py-8`}
          >
            <div className="flex w-22 flex-col items-center gap-0.5 rounded-2xl bg-[#00629B14] px-0 py-3.5">
              <p className="text-[32px] font-semibold text-[#00629B]">
                {event.day}
              </p>
              <p className={`${LABEL_XS} text-[#00629B]`}>{event.month}</p>
            </div>
            <div className="flex flex-1 flex-col items-start gap-1.5">
              <div className="w-full">
                <h3 className="text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B]">
                  {event.title}
                </h3>
              </div>
              <div>
                <p className="text-[16px] leading-[1.6] text-[#4A5B6B]">
                  {event.description}
                </p>
              </div>
            </div>
            <div className={`${BORDER_TAG} rounded-full px-3.5 py-2`}>
              <p className="whitespace-pre text-[13px] font-medium text-[#00629B]">
                {event.tag}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
