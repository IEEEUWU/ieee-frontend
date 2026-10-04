import { photos } from "@/lib/photos";
import { Shell } from "@/components/layout/shell";
import { Photo } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";

/**
 * Mission.
 *
 * The one place the page states what it actually is, and the one place a
 * photograph runs full-bleed. The image is instrument hardware rather than a
 * stock portrait, duotoned into the brand hue, and it holds still so the section
 * reads as a pause rather than another block of copy.
 *
 * This section exists to answer the question a first-time visitor has after the
 * hero: is this a real organisation with real work, or a page about a page.
 */
export function Mission() {
  return (
    <section id="mission" aria-labelledby="mission-title" className="bg-background">
      <Shell>
        <div className="grid grid-cols-1 gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-8 lg:py-32">
          {/* The statement gets seven columns rather than five. At five it set to
              four lines at display size, which read as a paragraph wearing a
              heading's clothes instead of as a statement. */}
          <Reveal className="lg:col-span-7">
            <p className="label-mono text-primary">What this is</p>
            <h2
              id="mission-title"
              className="mt-6 max-w-[26ch] text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.98] tracking-[-0.035em]"
            >
              A student branch is a set of working groups, not a brochure.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <div className="space-y-6 text-[clamp(1rem,1.25vw,1.1875rem)] leading-relaxed text-muted">
              <p>
                Everything operates under the IEEE Student Branch. Three technical chapters—Industrial Automation Society, Computer Society, and Robotics &amp; Automation Society—lead specialized disciplines, while the Women in Engineering affinity group advances participation, mentorship, and STEM progression.
              </p>
              <p>
                Charter scope is fixed by IEEE and published here verbatim.
                Everything branch-specific is published only once the branch
                supplies it. Where a fact is missing, this page names the gap
                instead of filling it with a plausible guess, because a confident
                wrong number is worse than an acknowledged blank.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-2">
              <div>
                <dt className="label-mono text-subtle">Chartered by</dt>
                <dd className="mt-2 text-[15px] font-semibold">IEEE</dd>
              </div>
              <div>
                <dt className="label-mono text-subtle">Under</dt>
                <dd className="mt-2 text-[15px] font-semibold">
                  IEEE Sri Lanka Section
                </dd>
              </div>
              <div>
                <dt className="label-mono text-subtle">Based at</dt>
                <dd className="mt-2 text-[15px] font-semibold">
                  Uva Wellassa University, Badulla
                </dd>
              </div>
              <div>
                <dt className="label-mono text-subtle">Open to</dt>
                <dd className="mt-2 text-[15px] font-semibold">
                  Engineering and computing undergraduates
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Shell>

      {/* Full-bleed interlude. Static: the image sits still rather than drifting
          against the scroll.

          It used to run inside `Parallax`, which translated the frame against the
          scroll offset. Two things made that a bad trade here. It fought the
          section snap — an image sliding inside a page that is meant to settle
          reads as the page failing to land. And this frame sits directly above
          the societies rail, so the last moving thing before a horizontal
          scroller was vertical drift, which set up the wrong axis of motion for
          the reader. Nothing is lost: the image still earns its full-bleed
          interruption, and it now arrives by clipping open instead. */}
      <div className="relative h-[52svh] w-full overflow-hidden md:h-[62svh]">
        <div className="h-full w-full">
          <Photo
            photo={photos.instrument}
            sizes="100vw"
            className="h-full w-full"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent"
        />
      </div>
    </section>
  );
}