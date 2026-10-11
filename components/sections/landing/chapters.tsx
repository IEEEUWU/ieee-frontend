"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { CHAPTERS } from "./data";
import { SectionHeading } from "./heading";
import { BORDER_CARD, LABEL_XS } from "./styles";
import { hoverSpring } from "./hover";

/**
 * The two card tones, resolved once per card instead of once per property.
 * `light` chapters sit on white behind a hairline overlay; the Women in
 * Engineering card inverts to the brand ground and carries no border.
 */
const TONE = {
  light: {
    card: `${BORDER_CARD} bg-white`,
    tag: "text-[#8796A5]",
    title: "text-[#0B1B2B]",
    body: "text-[#4A5B6B]",
  },
  dark: {
    card: "bg-[#00629B]",
    tag: "text-[rgba(255,255,255,0.7)]",
    title: "text-white",
    body: "text-[rgba(255,255,255,0.8)]",
  },
} as const;

/**
 * Chapter + affinity cards. Responsive: 1-col on mobile, 2-col on desktop.
 */
export function LandingChapters() {
  return (
    <section
      id="chapters"
      data-land="chapters"
      className="flex w-full max-w-280 flex-col items-start gap-8 sm:gap-12 px-4 sm:px-6 md:px-10 pt-16 sm:pt-20 md:pt-30"
    >
      <SectionHeading
        title="Our chapters & affinity group"
        lede="Four communities, one branch: each focused on a frontier of engineering."
      />
      <div
        data-land="chap-grid"
        className="grid w-full auto-rows-fr grid-cols-1 md:grid-cols-2 gap-5"
      >
        {CHAPTERS.map((chapter) => {
          const tone = chapter.dark ? TONE.dark : TONE.light;
          return (
            <Link
              key={chapter.title}
              href={chapter.href}
              className="block h-full w-full rounded-3xl"
            >
              <motion.article
                className={`flex h-full w-full flex-col items-start gap-8 sm:gap-14 rounded-3xl p-6 sm:p-8 ${tone.card}`}
                style={{ boxShadow: "0px 0px 0px 0px rgba(0, 98, 155, 0)" }}
                whileHover={{
                  boxShadow: "0px 20px 40px 0px rgba(0, 98, 155, 0.12)",
                  scale: 1.02,
                  y: -3,
                }}
                transition={hoverSpring}
              >
                <div className="flex w-full flex-row items-center justify-between gap-4">
                  <Image
                    src={chapter.logo.src}
                    alt=""
                    width={chapter.logo.width}
                    height={chapter.logo.height}
                    sizes="(max-width: 640px) 160px, 224px"
                    className={
                      chapter.dark
                        ? "h-10 sm:h-14 w-auto max-w-[150px] sm:max-w-[224px] shrink-0 object-contain object-left brightness-0 invert"
                        : "h-10 sm:h-14 w-auto max-w-[150px] sm:max-w-[224px] shrink-0 object-contain object-left"
                    }
                  />
                  <p className={`${LABEL_XS} ${tone.tag} shrink-0`}>{chapter.tag}</p>
                </div>
                <div className="flex w-full flex-col items-start gap-2.5">
                  <h3
                    className={`w-full text-[22px] sm:text-[26px] font-semibold tracking-[-0.5px] ${tone.title}`}
                  >
                    {chapter.title}
                  </h3>
                  <p
                    className={`text-[15px] sm:text-[16px] leading-[1.6] text-pretty ${tone.body}`}
                  >
                    {chapter.description}
                  </p>
                </div>
              </motion.article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
