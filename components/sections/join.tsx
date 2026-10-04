"use client";

import { ArrowRight } from "@phosphor-icons/react/ssr";
import { motion, useReducedMotion } from "motion/react";
import { contactChannel, site } from "@/lib/site";
import { Shell } from "@/components/layout/shell";
import { Magnetic } from "@/components/motion/magnetic";
import { EASE } from "@/components/motion/reveal";

/**
 * Three concrete routes in, because "get involved" without a next step is a
 * dead end. Each names the act rather than the feeling.
 */
const routes = [
  {
    step: "01",
    title: "Attend a session",
    body: "Sessions run under the three chapters and the WIE affinity group. Branch-wide events are open to every undergraduate on campus, so no membership is needed to attend.",
  },
  {
    step: "02",
    title: "Ask for the record",
    body: "Founding year, officer roster, chapter marks. Six items from this page are still unpublished. Asking is the fastest way to get any of them filled in.",
  },
  {
    step: "03",
    title: "Join a chapter or group",
    body: "Recruitment runs per technical chapter and affinity group on their own terms and calendars. The hierarchy section above names the areas each one covers.",
  },
] as const;

/**
 * Join.
 *
 * The only place the page inverts to IEEE Blue. One inversion on one page is a
 * decision; five would be a colour scheme. Everything above it is a light
 * document, and this is the solid ground the document was leading to.
 *
 * On touch there is no cursor to lean toward, so the magnetic pull is skipped
 * and the button is a plain, comfortably sized target. The affordance and the
 * action are identical on every input type.
 */
export function JoinBlock() {
  const reduced = useReducedMotion();

  return (
    <section
      id="join"
      aria-labelledby="join-title"
      className="on-inverse relative isolate overflow-hidden bg-inverse text-inverse-text"
    >
      <Shell>
        <div className="relative py-20 md:py-28 lg:py-36">
          {/* Two rules drifting against each other, at different rates. Cheap
              depth, transform only, and both stop under reduced motion. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              className="absolute -top-1/4 left-[-10%] h-[150%] w-px bg-white/15"
              animate={reduced ? undefined : { x: ["0%", "220%"] }}
              transition={reduced ? undefined : { duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -top-1/4 left-[10%] h-[150%] w-px bg-white/15"
              animate={reduced ? undefined : { x: ["0%", "-180%"] }}
              transition={reduced ? undefined : { duration: 19, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <motion.p
                className="label-mono text-inverse-muted"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                Start here
              </motion.p>

              <motion.h2
                id="join-title"
                className="mt-6 text-[clamp(2.5rem,6.4vw,5rem)] leading-[0.92] tracking-[-0.045em]"
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
              >
                Three ways in.
                <br />
                All of them start with showing up.
              </motion.h2>

              <motion.p
                className="mt-8 max-w-[44ch] text-[clamp(1.0625rem,1.35vw,1.25rem)] leading-relaxed text-inverse-muted"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
              >
                There is no application form on this page and no email address,
                because the branch has not published a contact channel yet.
                The route below that needs the least from us is a first session.
              </motion.p>
            </div>

            <ol className="lg:col-span-5 lg:col-start-8">
              {routes.map((route, index) => (
                <motion.li
                  key={route.step}
                  className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t border-white/25 py-6 last:border-b"
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: EASE }}
                >
                  <span className="label-mono pt-1 text-inverse-muted">
                    {route.step}
                  </span>
                  <div>
                    <h3 className="text-[clamp(1.25rem,1.9vw,1.625rem)] leading-tight tracking-[-0.025em]">
                      {route.title}
                    </h3>
                    <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-inverse-muted">
                      {route.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          <motion.div
            className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-6 border-t border-white/25 pt-10"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            <Magnetic className="inline-flex w-full sm:w-auto">
              <a
                href="#societies"
                className="group inline-flex min-h-14 w-full sm:w-auto justify-center items-center gap-3 bg-white px-7 text-[15px] font-semibold text-primary transition-colors duration-200 hover:bg-inverse-muted"
              >
                {site.joinLabel}
                <ArrowRight
                  size={16}
                  weight="regular"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </Magnetic>

            <p className="max-w-[40ch] text-[13px] leading-relaxed text-inverse-muted">
              {contactChannel.reason} Until then, this page is the branch&rsquo;s
              published record.
            </p>
          </motion.div>
        </div>
      </Shell>
    </section>
  );
}