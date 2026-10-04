import { impactStats } from "@/lib/record";
import { Shell } from "@/components/layout/shell";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Impact.
 *
 * Four figures, every one counted from the record files rather than typed by
 * hand, so a number on this page cannot drift from the data behind it.
 *
 * There are no membership counts, no growth charts and no award tallies here,
 * because the branch has never published any. The fourth figure is the number
 * of records still open, given the same weight as the rest. That is the honest
 * version of an impact section, and it is also the more interesting one: it
 * tells a prospective member exactly how new this page is.
 */
export function Impact() {
  return (
    <section
      aria-labelledby="impact-title"
      className="border-t border-border bg-background"
    >
      <Shell>
        <div className="py-16 md:py-24 lg:py-32">
          <Reveal>
            <p className="label-mono text-primary">Proof</p>
            <h2
              id="impact-title"
              className="mt-6 max-w-[22ch] text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.98] tracking-[-0.035em]"
            >
              Only what can be counted.
            </h2>
          </Reveal>

          <Stagger
            as="ul"
            className="mt-14 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
          >
            {impactStats.map((stat) => (
              <StaggerItem
                as="li"
                key={stat.label}
                className="flex flex-col justify-between gap-8 bg-background p-6 lg:p-8"
              >
                <span className="text-[clamp(3.5rem,6vw,4.75rem)] font-extrabold leading-[0.85] tracking-[-0.05em] text-primary">
                  <CountUp value={stat.value} />
                  {stat.suffix}
                </span>
                <span className="block">
                  <span className="block text-[15px] font-semibold leading-snug">
                    {stat.label}
                  </span>
                  <span className="mt-1 block text-[13px] leading-snug text-subtle">
                    {stat.note}
                  </span>
                </span>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[70ch] text-[14px] leading-relaxed text-subtle">
              Figures are read directly from this site&rsquo;s published record
              files. Nothing on this page is estimated, projected or rounded up.
            </p>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}