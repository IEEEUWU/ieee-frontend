import { Section, SectionHeading } from "@/components/layout/shell";
import { SocietyRail } from "@/components/sections/society-rail";

/**
 * Societies.
 *
 * A server component. Only the rail below it is a client island, so the heading,
 * the introduction and the section chrome all reach the browser as HTML.
 *
 * The heading stays static while the cards move horizontally. That contrast is
 * the point: the reader's eye is anchored by a fixed label and freed to travel.
 */
export function Societies() {
  return (
    <Section id="societies" labelledBy="societies-title" tone="surface">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <SectionHeading
          id="societies-title"
          code="Five chartered societies"
          title="Each one owns a discipline."
          lede="Two are open to every undergraduate on campus. Three take members only through recruitment. The rail below lists all five with the charter scope each publishes under."
          className="lg:col-span-5"
        />
      </div>

      <div className="mt-12 lg:mt-16">
        <SocietyRail />
      </div>
    </Section>
  );
}