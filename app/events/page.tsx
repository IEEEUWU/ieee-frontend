import type { Metadata, Viewport } from "next";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingEventCards } from "@/components/sections/landing/event-cards";
import { LandingFooter } from "@/components/sections/landing/footer";

/**
 * Events: the branch's dated programme on its own route.
 *
 * A composition of the landing page's shared parts. The nav and the footer
 * are the same components the homepage renders, and the programme itself is
 * `LandingEventCards`, this route's own card grid: one card per event, each
 * led by its 1:1 cover, built from the homepage's own tokens (heading, date
 * plate, tag pill, card border). The nav's anchors are root-absolute, so
 * they return to the homepage sections from here.
 *
 * The viewport pin, the root utilities and the `landing-page` hook mirror
 * the homepage, so the fixed 1200px canvas and its inherited-attribute
 * overrides apply identically on this route.
 */
const SITE_URL = "https://ieee-uwu-student-branch.vercel.app";
const TITLE = "Events";
const DESCRIPTION =
  "Workshops, competitions and talks run by the IEEE Student Branch of Uva Wellassa University, open to every UWU student.";
const OG_IMAGE = "/photos/robotics-arm.jpg";

export const metadata: Metadata = {
  // A plain string, so the layout's title template renders the full tag.
  title: TITLE,
  description: DESCRIPTION,
  // A child openGraph replaces the parent's wholesale in Next's metadata
  // resolution, so every field worth keeping is restated here.
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: `${SITE_URL}/events`,
    siteName: "IEEE UWU Student Branch",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1800,
        height: 1198,
        alt: "IEEE Uva Wellassa Student Branch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/**
 * Same fixed-canvas contract as the homepage; see `app/page.tsx`.
 */
export const viewport: Viewport = {
  width: 1200,
  initialScale: undefined,
};

export default function Page() {
  return (
    <main
      id="main"
      className="landing-page flex min-h-screen w-full flex-col items-center overflow-clip bg-[#F7F9FB] font-plex leading-[1.2] normal-nums"
    >
      <LandingNav />
      {/* The section carries its own h2; this keeps one h1 per page without
          adding a second visible heading directly above it. */}
      <h1 className="sr-only">Events</h1>
      <div data-land="spacer" className="h-30 w-full" />
      <LandingEventCards />
      <LandingFooter />
    </main>
  );
}
