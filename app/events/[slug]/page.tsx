import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingFooter } from "@/components/sections/landing/footer";
import { EVENTS } from "@/components/sections/landing/data";
import { LandingEventPreview } from "@/components/sections/landing/event-preview";
import { photoBySrc } from "@/lib/photos";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const SITE_URL = "https://ieee-uwu-student-branch.vercel.app";

/**
 * Same fixed-canvas contract as the homepage, /events and the unit portals:
 * the route draws on the pinned 1200px landing canvas rather than a fluid
 * grid.
 */
export const viewport: Viewport = {
  width: 1200,
  initialScale: undefined,
};

/** One statically generated route per published calendar row. */
export async function generateStaticParams() {
  return EVENTS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = EVENTS.find((row) => row.slug === slug);
  if (!event) return { title: "Event Not Found" };

  const photo = photoBySrc[event.cover];
  // Date and chapter first: a shared card is read before the sentence.
  const DESCRIPTION = `${event.day} ${event.month} · ${event.tag}. ${event.description}`;

  return {
    // A plain string, so the layout's title template renders the full tag.
    title: event.title,
    description: DESCRIPTION,
    // A child openGraph replaces the parent's wholesale in Next's metadata
    // resolution, so every field worth keeping is restated here. The cover is
    // the event's own frame, sized from the manifest rather than guessed.
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: `${SITE_URL}/events/${event.slug}`,
      siteName: "IEEE UWU Student Branch",
      title: event.title,
      description: DESCRIPTION,
      images: [
        {
          url: event.cover,
          width: photo?.width ?? 960,
          height: photo?.height ?? 640,
          alt: photo?.alt ?? event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: DESCRIPTION,
      images: [event.cover],
    },
  };
}

/**
 * Event preview page: `/events/[slug]`.
 *
 * A thin shell in the landing page's own composition — the same nav, pinned
 * 1200px canvas and root utilities the homepage, /events and the unit portals
 * render — wrapping `LandingEventPreview`, which owns the masthead, the
 * record, the plate and the closing grid of the other published events (the
 * shared event card again). An unknown slug is a 404: `generateStaticParams`
 * enumerates the calendar, so a page exists only for an event the branch has
 * actually published.
 */
export default async function EventPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const event = EVENTS.find((row) => row.slug === slug);

  if (!event) {
    notFound();
  }

  return (
    <main
      id="main"
      className="landing-page flex min-h-screen w-full flex-col items-center overflow-clip bg-[#F7F9FB] font-plex leading-[1.2] normal-nums"
    >
      <LandingNav />
      <div data-land="spacer" className="h-30 w-full" />
      <LandingEventPreview
        event={event}
        more={EVENTS.filter((row) => row.slug !== event.slug)}
      />
      <LandingFooter />
    </main>
  );
}
