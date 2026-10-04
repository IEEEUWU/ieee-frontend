import { Section, SectionHeading } from "@/components/layout/shell";
import { BranchHierarchy } from "@/components/sections/branch-hierarchy";

/**
 * Branch Hierarchy & Societies Section.
 *
 * Demonstrates the IEEE organizational hierarchy:
 * - Parent: IEEE Student Branch
 * - 3 Technical Chapters: Industrial Automation Society, Computer Society, Robotics and Automation Society
 * - 1 Affinity Group: Women in Engineering
 */
export function Societies() {
  return (
    <Section id="societies" labelledBy="societies-title" tone="surface">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <SectionHeading
          id="societies-title"
          code="Organizational Hierarchy"
          title="Everything operates under the Student Branch."
          lede="The IEEE Student Branch is the umbrella parent organization. Three technical chapters lead specialized engineering disciplines, and the Women in Engineering affinity group advances representation. Select any unit in the tree to inspect its charter scope and details."
          className="lg:col-span-8"
        />
      </div>

      <div className="mt-12 lg:mt-16">
        <BranchHierarchy />
      </div>
    </Section>
  );
}