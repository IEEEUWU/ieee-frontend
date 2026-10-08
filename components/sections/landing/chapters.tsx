"use client";

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
    iconBox: "bg-[#00629B14]",
    icon: "text-[#00629B]",
    tag: "text-[#8796A5]",
    title: "text-[#0B1B2B]",
    body: "text-[#4A5B6B]",
  },
  dark: {
    card: "bg-[#00629B]",
    iconBox: "bg-[#FFFFFF26]",
    icon: "text-white",
    tag: "text-[rgba(255,255,255,0.7)]",
    title: "text-white",
    body: "text-[rgba(255,255,255,0.8)]",
  },
} as const;

/**
 * Chapter + affinity cards.
 *
 * The only interactive section besides the committee cards: each card lifts
 * 4px, scales 1.1 and grows a soft brand shadow on hover, on the shared
 * spring.
 */
export function LandingChapters() {
  return (
    <section
      id="chapters"
      data-land="chapters"
      className="flex w-full max-w-[1120px] flex-col items-start gap-12 px-10 pt-[120px]"
    >
      <SectionHeading
        title="Our chapters & affinity group"
        lede="Four communities, one branch: each focused on a frontier of engineering."
      />
      <div
        data-land="chap-grid"
        className="grid w-full auto-rows-fr grid-cols-2 gap-5"
      >
        {CHAPTERS.map((chapter) => {
          const Icon = chapter.icon;
          const tone = chapter.dark ? TONE.dark : TONE.light;
          return (
            <motion.article
              key={chapter.title}
              className={`flex h-full w-full flex-col items-start gap-14 rounded-3xl p-8 ${tone.card}`}
              style={{ boxShadow: "0px 0px 0px 0px rgba(0, 98, 155, 0)" }}
              whileHover={{
                boxShadow: "0px 20px 40px 0px rgba(0, 98, 155, 0.12)",
                scale: 1.1,
                y: -4,
              }}
              transition={hoverSpring}
            >
              <div className="flex w-full flex-row items-center justify-between">
                <div
                  className={`flex h-14 w-14 flex-row items-center justify-center rounded-2xl ${tone.iconBox}`}
                >
                  <Icon size={28} weight="regular" className={tone.icon} />
                </div>
                <p className={`${LABEL_XS} ${tone.tag}`}>{chapter.tag}</p>
              </div>
              <div className="flex w-full flex-col items-start gap-2.5">
                <h3
                  className={`w-full text-[26px] font-semibold tracking-[-0.5px] ${tone.title}`}
                >
                  {chapter.title}
                </h3>
                <p
                  className={`text-[16px] leading-[1.6] text-pretty ${tone.body}`}
                >
                  {chapter.description}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
