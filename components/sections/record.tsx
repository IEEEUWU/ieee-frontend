import { Check, Clock } from "@phosphor-icons/react/ssr";
import { awaitingFacts, confirmedFacts } from "@/lib/record";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { Shell } from "@/components/layout/shell";
import { Photo } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * The branch record.
 *
 * Two columns, kept deliberately unbalanced: five confirmed facts on the left,
 * six named absences on the right.
 *
 * Most organisation pages hide their gaps. This one prints them. A prospective
 * member deciding whether to turn up to a first meeting needs to know which
 * details are settled and which are not, and a page that quietly implies a
 * founding year it does not have is lying by omission. The right-hand column is
 * a real list of real records the branch has not published, each one an explicit
 * instruction about what to ask for.
 */
export function BranchRecord() {
  return (
    <section
      id="branch"
      aria-labelledby="branch-title"
      className="border-t border-border bg-background"
    >
      <Shell>
        <div className="grid grid-cols-1 gap-10 pb-16 md:pb-24 lg:grid-cols-12 lg:gap-8 lg:pb-32">
          <Reveal className="lg:col-span-7">
            <p className="label-mono text-primary">The record</p>
            <h2
              id="branch-title"
              className="mt-6 max-w-[20ch] text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.98] tracking-[-0.035em]"
            >
              Published, and not yet published.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <Photo
              photo={photos.texture}
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="aspect-4/5 w-full"
            />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h3 className="label-mono border-b border-border pb-4 text-primary">
              <span className="flex items-center gap-2">
                <Check size={13} weight="bold" aria-hidden="true" />
                Confirmed &middot; {confirmedFacts.length}
              </span>
            </h3>
            <Stagger as="ul" className="mt-2">
              {confirmedFacts.map((fact) => (
                <StaggerItem
                  as="li"
                  key={fact.label}
                  className="grid grid-cols-1 gap-1 border-b border-border-subtle py-5 sm:grid-cols-12 sm:gap-6"
                >
                  <dt className="label-mono text-subtle sm:col-span-4">
                    {fact.label}
                  </dt>
                  <dd className="text-[15px] leading-snug font-medium sm:col-span-8">
                    {fact.value}
                  </dd>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <h3 className="label-mono border-b border-border pb-4 text-subtle">
              <span className="flex items-center gap-2">
                <Clock size={13} weight="regular" aria-hidden="true" />
                Awaiting the branch &middot; {awaitingFacts.length}
              </span>
            </h3>
            <Stagger as="ul" className="mt-2">
              {awaitingFacts.map((fact) => (
                <StaggerItem
                  as="li"
                  key={fact}
                  className="border-b border-border-subtle py-5 text-[15px] leading-snug text-subtle"
                >
                  {fact}
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-6 text-[14px] leading-relaxed text-subtle">
              Each item above is a real gap in this page. Nothing on it has been
              estimated to make the record look more complete than it is. Ask for
              any of them at the next session.
            </p>
          </div>
        </div>

        <Reveal delay={0.15}>
          <p className="mt-12 border-t border-border pt-6 text-[14px] leading-relaxed text-subtle">
            {site.branchName} is a student branch of the {site.parentBody},{" "}
            {site.region}, at {site.university} in {site.city}, {site.country}.
          </p>
        </Reveal>
      </Shell>
    </section>
  );
}