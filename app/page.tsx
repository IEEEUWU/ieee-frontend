import type { Metadata, Viewport } from "next";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingHero } from "@/components/sections/landing/hero";
import { LandingStats } from "@/components/sections/landing/stats";
import { LandingChapters } from "@/components/sections/landing/chapters";
import { LandingAbout } from "@/components/sections/landing/about";
import { LandingEvents } from "@/components/sections/landing/events";
import { LandingCommittee } from "@/components/sections/landing/committee";
import { LandingJoin } from "@/components/sections/landing/join";
import { LandingFooter } from "@/components/sections/landing/footer";

/**
 * Homepage: a faithful rebuild of the branch's externally designed landing
 * page.
 *
 * The design is a fixed 1200px canvas rather than a responsive layout, so
 * the viewport meta pins the width and the page renders as the source does:
 * a desktop composition that mobile browsers zoom out to fit. The root is a
 * full-width flex column that centres its sections; sections carry their own
 * max-widths (1120 / 1040) and gutters.
 *
 * The root also carries the page's type system (IBM Plex Sans, 1.2 base
 * leading, lining figures reset) as utilities so it stays scoped to this
 * page and never touches the unit pages that share the layout. The
 * `landing-page` class remains as the hook for the few inherited-attribute
 * overrides that cannot be expressed as utilities on a root element.
 */
const SITE_URL = "https://ieee-uwu-student-branch.vercel.app";
const TITLE = "IEEE Student Branch – Uva Wellassa University";
const DESCRIPTION =
  "IEEE Student Branch of Uva Wellassa University: chapters, affinity groups, events and membership.";
const OG_IMAGE = "/photos/robotics-arm.jpg";

export const metadata: Metadata = {
  // Absolute, so the layout's title template is bypassed on the homepage.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // A child openGraph replaces the parent's wholesale in Next's metadata
  // resolution, so every field worth keeping is restated here.
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
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
 * The design targets a 1200px viewport; `initialScale` is dropped so the
 * default `initial-scale=1` is not emitted alongside the pinned width.
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
      <LandingHero />
      <LandingStats />
      <LandingChapters />
      <LandingAbout />
      <LandingEvents />
      <LandingCommittee />
      <LandingJoin />
      <div data-land="spacer" className="h-30 w-full" />
      <LandingFooter />
    </main>
  );
}
