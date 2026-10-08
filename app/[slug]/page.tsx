import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingFooter } from "@/components/sections/landing/footer";
import { societies, type SocietyId } from "@/lib/units";
import { ChapterPage } from "@/components/sections/unit/chapter";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Same fixed-canvas contract as the homepage and /events: the route draws on
 * the pinned 1200px landing canvas rather than a fluid grid.
 */
export const viewport: Viewport = {
  width: 1200,
  initialScale: undefined,
};

export async function generateStaticParams() {
  return [{ slug: "ias" }, { slug: "cs" }, { slug: "ras" }, { slug: "wie" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const unit = societies.find((s) => s.id === (slug as SocietyId));
  if (!unit) return { title: "Unit Not Found" };

  return {
    title: `${unit.name} (${unit.abbreviation}) · IEEE UWU Student Branch`,
    description: unit.scope,
  };
}

/**
 * Unit portal page.
 *
 * A chapter sits at the top level of the site — `/cs`, `/ias`, `/ras`,
 * `/wie` — not under a chapter or affinity prefix; `next.config.ts`
 * redirects the old prefixed URLs here. The page itself is a thin shell in
 * the landing page's own composition — the same nav, the same pinned 1200px
 * canvas and root utilities the homepage and /events render — wrapping
 * `ChapterPage`, which owns the full chapter index (hero, about, tabbed
 * events, the committee — advisors and the Executive Committee behind its
 * term selector — social links, a footer wearing the chapter's name and
 * colour). The requested path is passed through so the portal notice inside
 * the page describes the URL the reader is on.
 */
export default async function UnitPortalPage({ params }: PageProps) {
  const { slug } = await params;
  const unit = societies.find((s) => s.id === (slug as SocietyId));

  if (!unit) {
    notFound();
  }

  return (
    <main
      id="main"
      className="landing-page flex min-h-screen w-full flex-col items-center overflow-clip bg-[#F7F9FB] font-[family-name:var(--font-plex)] leading-[1.2] normal-nums"
    >
      <LandingNav />
      <div data-land="spacer" className="h-[120px] w-full" />
      <ChapterPage unit={unit} path={`/${slug}`} />
      <LandingFooter
        identity={{
          name: unit.name.startsWith("IEEE ")
            ? unit.name
            : `IEEE ${unit.name}`,
          wordmark: `IEEE${unit.abbreviation}`,
          brand: unit.colour.brand,
        }}
      />
    </main>
  );
}
