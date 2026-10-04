import { Section, SectionHeading } from "@/components/layout/shell";
import { SocietyExplorer } from "@/components/sections/explorer";

/**
 * Explorer section shell.
 *
 * A server component wrapping the one client island. Its only job beyond layout
 * is to give the explorer's content a heading of its own: without it, the tab
 * list and panel would be orphaned under the preceding section's outline and a
 * screen-reader user navigating by heading would pass straight over them.
 */
export function ExplorerSection() {
  return (
    <Section
      labelledBy="explorer-title"
      tone="plain"
      className="border-t border-border"
    >
      <SectionHeading
        id="explorer-title"
        code="Go deeper"
        title="One society, in full."
        lede="The rail showed what exists. This shows everything on file about one of them: its charter scope, every technical area it covers, and what the branch still has not supplied."
        className="max-w-[62ch]"
      />

      <div className="mt-12 lg:mt-16">
        <SocietyExplorer />
      </div>
    </Section>
  );
}