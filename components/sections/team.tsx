import { societyInk } from "@/lib/units";
import { committee, rosterStats, type CommitteeSeat } from "@/lib/team";
import { Section, SectionHeading } from "@/components/layout/shell";
import { SampleNotice } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Team.
 *
 * The branch committee, as a numbered ledger rather than a card grid. Cards were
 * rejected on purpose: seven equal rectangles is the shape the whole page is
 * built to avoid, and a committee is a list of offices with a sequence, not a
 * set of interchangeable highlights. The index rail on the left is the argument —
 * `01` through `07` reads as an ordered instrument, which is what a committee is.
 *
 * The seats are real and complete. The names are absent, and each row says so in
 * the same place a name would go, at the same weight, rather than hiding the gap
 * behind a placeholder silhouette. `discipline` is published in place of a name
 * because it answers the question a prospective member is actually asking: what
 * kind of work does this seat involve?
 *
 * A server component. The roster is static content, so it reaches the browser as
 * HTML with no client JavaScript at all.
 */
export function Team() {
  return (
    <Section id="team" labelledBy="team-title" tone="plain">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <SectionHeading
          id="team-title"
          code="Who runs it"
          title="Seven seats, one committee."
          lede="Three offices hold the branch together and four society officers carry their own disciplines into it. The seats are published in full. The people holding them are not on this page yet, because the branch has not supplied them."
          className="lg:col-span-5"
        />

        {/* The count, stated as a count. */}
        <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
          <dl className="border-t border-border">
            <div className="flex items-baseline justify-between gap-6 border-b border-border-subtle py-4">
              <dt className="label-mono text-subtle">Seats published</dt>
              <dd className="text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-none tracking-[-0.04em] text-primary tabular-nums">
                {rosterStats.seats}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-border-subtle py-4">
              <dt className="label-mono text-subtle">Named holders</dt>
              <dd className="text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-none tracking-[-0.04em] text-text tabular-nums">
                {rosterStats.filled}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className="label-mono text-subtle">Awaiting nomination</dt>
              <dd className="text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-none tracking-[-0.04em] text-subtle tabular-nums">
                {rosterStats.awaiting}
              </dd>
            </div>
          </dl>
          <div className="mt-8">
            <SampleNotice />
          </div>
        </Reveal>
      </div>

      <Stagger as="ol" className="mt-14 border-t border-border lg:mt-20">
        {committee.map((seat, index) => (
          <Seat key={seat.id} seat={seat} index={index} />
        ))}
      </Stagger>

      <Reveal delay={0.1}>
        <p className="mt-10 max-w-[68ch] text-[14px] leading-relaxed text-subtle">
          A branch committee is elected, so this roster changes and the branch
          publishes a new one when it does. If you want one of these roles, the
          route is the same as any other: come to a session, or ask at the next
          committee meeting.
        </p>
      </Reveal>
    </Section>
  );
}

/**
 * One seat. The index rail, the office, the remit, and the holder or the gap.
 *
 * `societyId` decides what the mark on the right is: the society's identity hue
 * for the four society officer seats, ink for the three branch-wide offices. That
 * split is what makes the structure readable without a legend. There is no avatar
 * and no portrait placeholder — a seat with no named holder shows the words
 * instead, rather than an empty frame implying a person who is not there.
 */
function Seat({ seat, index }: { seat: CommitteeSeat; index: number }) {
  const ink = societyInk(seat.societyId);

  return (
    <StaggerItem
      as="li"
      className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-border-subtle py-8 sm:grid-cols-12 lg:py-10"
    >
      {/* Index rail */}
      <p className="label-mono text-subtle sm:col-span-1" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </p>

      {/* Office */}
      <div className="sm:col-span-3">
        <h3 className="text-[clamp(1.25rem,1.9vw,1.625rem)] leading-tight tracking-[-0.025em]">
          {seat.role}
        </h3>
        <p className="label-mono mt-3 text-subtle">{seat.discipline}</p>
      </div>

      {/* Remit */}
      <p className="max-w-[54ch] text-[15px] leading-relaxed text-muted sm:col-span-5">
        {seat.remit}
      </p>

      {/* Holder, or the gap, in the same slot at the same weight. */}
      <div className="sm:col-span-3 sm:text-right">
        {seat.holder ? (
          <p className="text-[15px] font-semibold">{seat.holder}</p>
        ) : (
          <p className="text-[15px] font-semibold text-subtle">
            Awaiting nomination
          </p>
        )}
        {/* The mark. The four society seats carry their society's identity hue;
            the three branch-wide offices carry ink, which is what makes the
            structural split readable at a glance without a legend. */}
        <span
          aria-hidden="true"
          className="mt-4 block h-[3px] w-full sm:ml-auto sm:w-10"
          style={{ backgroundColor: ink ?? "var(--color-text)" }}
        />
      </div>
    </StaggerItem>
  );
}