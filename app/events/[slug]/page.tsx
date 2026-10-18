import type { Metadata, Viewport } from "next";
import { cache, type CSSProperties } from "react";
import { notFound } from "next/navigation";
import { EventImage as Image } from "@/components/sections/event-image";
import Link from "next/link";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingFooter } from "@/components/sections/landing/footer";
import { loadPublicEvent, publicEventCover, PublicEventError } from "@/lib/events/server";
import { eventDate } from "@/lib/events/shared";
import { societies } from "@/lib/units";
type PageProps = { params: Promise<{ slug: string }> };
export const viewport: Viewport = { width: 1200, initialScale: undefined };
const getEvent = cache(async (slug: string) => {
  try { return await loadPublicEvent(slug); }
  catch (error) { if (error instanceof PublicEventError && error.status === 404) notFound(); throw error; }
});
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return { title: event.title, description: event.description ?? undefined, openGraph: { title: event.title, description: event.description ?? undefined, images: [publicEventCover(event.cover_image_url !== undefined ? event.cover_image_url : event.cover_image)] }, twitter: { card: "summary_large_image", title: event.title, description: event.description ?? undefined, images: [publicEventCover(event.cover_image_url !== undefined ? event.cover_image_url : event.cover_image)] } };
}
export default async function EventPreviewPage({ params }: PageProps) {
  const event = await getEvent((await params).slug);
  const host = societies.find((unit) => unit.abbreviation === event.chapter);
  const facts = [
    ["START", eventDate(event.start_date)], ["END", eventDate(event.end_date)], ["TIMEZONE", "Sri Lanka (UTC+05:30)"],
    ["VENUE", `${({ PHYSICAL: "In person", ONLINE: "Online", HYBRID: "Hybrid" })[event.mode]}${event.venue ? ` · ${event.venue}` : ""}`],
    ["HOSTED BY", host?.name ?? "IEEE Student Branch"],
    ["REGISTRATION", event.is_registration_open ? "Open" : "Closed"], ["OC APPLICATIONS", event.is_oc_open ? "Open" : "Closed"],
    ...(event.max_participants ? [["CAPACITY", String(event.max_participants)]] : []),
    ...(event.contact_email ? [["CONTACT EMAIL", event.contact_email]] : []), ...(event.contact_phone ? [["CONTACT PHONE", event.contact_phone]] : []),
  ];
  return <main id="main" className="landing-page flex min-h-screen w-full flex-col items-center overflow-clip bg-[#F7F9FB] font-plex leading-[1.2] normal-nums">
    <LandingNav /><div data-land="spacer" className="h-30 w-full" />
    <section data-land="event-preview" style={{ "--event-ink": host?.colour.ink ?? "#00629B", "--event-brand": host?.colour.brand ?? "#00629B" } as CSSProperties} className="flex w-full max-w-[1120px] flex-col gap-16 px-10 pb-[120px]">
      <Link href="/events" className="w-fit text-sm font-medium text-[#667585] hover:text-[#00629B]">← All events</Link>
      <header className="relative"><span aria-hidden="true" className="pointer-events-none absolute -top-6 right-0 select-none text-[190px] font-bold leading-none tracking-[-6px] text-(--event-brand) opacity-[0.07]">{event.chapter}</span><p className="mb-5 text-sm font-medium text-(--event-ink)">{event.chapter}</p><h1 className="max-w-[850px] text-[72px] leading-[1.05] font-semibold tracking-[-2.5px] text-[#0B1B2B]">{event.title}</h1>{event.description && <p className="mt-6 max-w-[760px] whitespace-pre-wrap text-[19px] leading-[1.6] text-[#4A5B6B]">{event.description}</p>}</header>
      <div className="flex w-full flex-col items-start gap-15 lg:flex-row"><dl className="w-full flex-1 border-t border-[#0B1B2B26]">{facts.map(([label, value]) => <div key={label} className="flex items-start gap-6 border-b border-[#0B1B2B26] px-2 py-5"><dt className="label-mono w-[170px] shrink-0 text-[#667585]">{label}</dt><dd className="min-w-0 break-words text-[17px] leading-relaxed text-[#0B1B2B]">{value}</dd></div>)}</dl><figure className="w-full lg:w-[440px] lg:shrink-0"><Image src={publicEventCover(event.cover_image_url !== undefined ? event.cover_image_url : event.cover_image)} unoptimized alt={event.cover_image ? event.title : ""} width={960} height={640} sizes="440px" priority className="aspect-3/2 w-full rounded-3xl border border-[#0B1B2B26] object-cover" />{!event.cover_image && <figcaption className="mt-3 text-xs text-[#667585]">Illustrative image</figcaption>}</figure></div>
    </section><LandingFooter />
  </main>;
}
