import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { BORDER_CARD, LABEL_XS } from "@/components/sections/landing/styles";
import { societies } from "@/lib/units";

/**
 * The shared event fields, plus the cover the card is led by and the slug
 * that gives it a preview page. One shape renders the published calendar
 * (`EVENTS`, slug present) and the chapter pages' demo entries (slug absent)
 * alike.
 */
export type EventRecord = {
  readonly day: string;
  readonly month: string;
  readonly title: string;
  readonly description: string;
  readonly tag: string;
  readonly cover: string;
  /** Present only on published rows — those are the ones with a route. */
  readonly slug?: string;
};

/** The branch's own blue, for a tag that names no chartered society. */
const BRANCH = { brand: "#00629B", ink: "#00629B" } as const;

/**
 * The event card, used by every grid that shows events: the chapter page's
 * tabs, the `/events` calendar, and the preview route's closing grid.
 *
 * A 16:10 cover leads, the tag rides the image as a white pill on a themed
 * hairline, and the date plate straddles the image's bottom edge — half on
 * the photograph, half on the card — so the cover and the landing's date
 * object interlock instead of stacking. Title and copy sit below in the row's
 * exact type. Covers are the branch's CC0 stock (see `lib/photos.ts`),
 * decorative: they claim nothing documentary.
 *
 * The card carries its own identity: the five custom properties are resolved
 * from the event's own `tag`, using the chapter page's exact recipe, so the
 * card wears its hosting chapter's colour wherever it is rendered — on the
 * chapter page it matches the page's own vars exactly, on the branch calendar
 * each card marks who runs what, and a card in the preview route's closing
 * grid never picks up the host chapter beside it. A tag with no society falls
 * back to branch blue and never borrows an identity it does not have.
 *
 * With a `slug` the whole card is the link to its preview page, so the link's
 * accessible name is the card as it is read; the title turns the chapter's
 * ink on hover, and `:focus-visible` marks the stop for keyboard readers.
 * Without one it stays a plain article — a demo entry links nowhere.
 */
export function EventCard({ event }: { event: EventRecord }) {
  const colour =
    societies.find(
      (unit) => unit.name === event.tag || unit.abbreviation === event.tag,
    )?.colour ?? BRANCH;

  const style = {
    "--unit-brand": colour.brand,
    "--unit-ink": colour.ink,
    "--unit-tint": `${colour.brand}14`,
    "--unit-line": `${colour.ink}40`,
    "--unit-hover": `${colour.brand}2E`,
  } as CSSProperties;

  const shell = `${BORDER_CARD} group flex flex-col overflow-hidden rounded-3xl bg-white`;

  const body = (
    <>
      <div className="relative">
        <Image
          src={event.cover}
          alt=""
          width={960}
          height={600}
          sizes="346px"
          className="aspect-16/10 w-full object-cover"
        />
        <div className="absolute right-4 top-4 rounded-full border border-(--unit-line) bg-white px-3.5 py-2">
          <p className="whitespace-pre text-[13px] font-medium text-(--unit-ink)">
            {event.tag}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <div className="relative z-10 -mt-12 flex w-22 flex-col items-center gap-0.5 self-start rounded-2xl border border-(--unit-line) bg-white py-3.5">
          <p className="text-[32px] font-semibold text-(--unit-ink)">
            {event.day}
          </p>
          <p className={`${LABEL_XS} text-(--unit-ink)`}>{event.month}</p>
        </div>
        <h3 className="text-[24px] font-semibold tracking-[-0.5px] text-[#0B1B2B] transition-colors group-hover:text-(--unit-ink)">
          {event.title}
        </h3>
        <p className="text-[16px] leading-[1.6] text-[#4A5B6B]">
          {event.description}
        </p>
      </div>
    </>
  );

  return event.slug ? (
    <Link href={`/events/${event.slug}`} className={shell} style={style}>
      {body}
    </Link>
  ) : (
    <article className={shell} style={style}>
      {body}
    </article>
  );
}
