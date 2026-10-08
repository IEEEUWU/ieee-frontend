import Image from "next/image";
import { EVENTS } from "./data";
import { SectionHeading } from "./heading";
import { BORDER_CARD, BORDER_TAG, LABEL_XS } from "./styles";

/**
 * Event cards: the events page's own composition of the programme.
 *
 * A three-up card grid on the same 1120px canvas, one card per event, each
 * led by its event's 1:1 frame. The card wears the landing page's own
 * tokens: white ground, 24px radius, the committee card's hairline border,
 * the row's date plate and tag pill reused verbatim, so the cards read as
 * the same design system as the homepage. The frames are the branch's CC0
 * illustrative stock (see `lib/photos.ts`), so the covers are marked
 * decorative and claim nothing documentary.
 */
export function LandingEventCards() {
  return (
    <section
      id="events"
      data-land="event-cards"
      className="flex w-full max-w-[1120px] flex-col items-start gap-12 px-10 pb-[120px]"
    >
      <SectionHeading
        title="Upcoming events"
        lede="Workshops, competitions and talks open to every UWU student."
      />
      <div className="grid w-full grid-cols-3 gap-10">
        {EVENTS.map((event) => (
          <article
            key={event.title}
            className={`${BORDER_CARD} flex flex-col overflow-hidden rounded-3xl bg-white`}
          >
            <Image
              src={event.cover}
              alt=""
              width={960}
              height={640}
              sizes="346px"
              className="aspect-square w-full object-cover"
            />
            <div className="flex flex-col gap-4 px-6 pt-5 pb-6">
              <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex w-[88px] flex-col items-center gap-0.5 rounded-2xl bg-[#00629B14] px-0 py-[14px]">
                  <p className="text-[32px] font-semibold text-[#00629B]">
                    {event.day}
                  </p>
                  <p className={`${LABEL_XS} text-[#00629B]`}>{event.month}</p>
                </div>
                <div className={`${BORDER_TAG} rounded-full px-[14px] py-2`}>
                  <p className="whitespace-pre text-[13px] font-medium text-[#00629B]">
                    {event.tag}
                  </p>
                </div>
              </div>
              <h3 className="text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B]">
                {event.title}
              </h3>
              <p className="text-[16px] leading-[1.6] text-[#4A5B6B]">
                {event.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
