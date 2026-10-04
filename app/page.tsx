import { SiteHeader } from "@/components/navigation/site-header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Mission } from "@/components/sections/mission";
import { Societies } from "@/components/sections/societies";
import { ExplorerSection } from "@/components/sections/explorer-section";
import { Impact } from "@/components/sections/impact";
import { Events } from "@/components/sections/events";
import { Team } from "@/components/sections/team";
import { BranchRecord } from "@/components/sections/record";
import { JoinBlock } from "@/components/sections/join";
import { Footer } from "@/components/sections/footer";

/**
 * Composition root.
 *
 * A server component. It renders the whole page as HTML and contains no state,
 * no hooks and no interactivity of its own. The only client islands it pulls in
 * are the header, the five motion primitives used by sections, the explorer, the
 * rail and the two animated action blocks.
 *
 * Section order is the user journey, and it is not rearranged for variety:
 *
 *   Hero            attention    what this is, and what to do next
 *   Marquee         curiosity    the breadth, in one glance
 *   Mission         understanding what a student branch actually is
 *   Societies       exploration  the five, side by side
 *   Explorer        exploration  one of them, in detail
 *   Impact          proof        the numbers that can be counted
 *   Events          proof        the public record
 *   Team            proof        who is meant to be running it
 *   BranchRecord    trust        what is settled, and what is not
 *   Join            action       three concrete routes
 *   Footer          recall       the promise, stated one last time
 *
 * `page-stack` is a hook and nothing more: it marks the direct children of
 * `main` as snap points so scrolling settles on a section boundary rather than
 * drifting past it. The whole behaviour lives in one media-query block in
 * `globals.css`, so a reader who prefers reduced motion gets an ordinary
 * continuous scroll and no component has to know the rule exists.
 */
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-stack">
        <Hero />
        <Marquee />
        <Mission />
        <Societies />
        <ExplorerSection />
        <Impact />
        <Events />
        <Team />
        <BranchRecord />
        <JoinBlock />
      </main>
      <Footer />
    </>
  );
}