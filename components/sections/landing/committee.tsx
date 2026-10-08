"use client";

import Image from "next/image";
import { Fragment } from "react";
import { motion } from "motion/react";
import {
  COMMITTEE_GROUPS,
  COMMITTEE_PHOTO,
  MEMBER_SOCIALS,
} from "./data";
import { SectionHeading } from "./heading";
import { BORDER_CARD, LABEL_SM } from "./styles";
import { hoverSpring } from "./hover";

/**
 * Executive committee 2026.
 *
 * Grouped rows of member cards; leadership stacks one card per row, the team
 * members row is capped at 760px so six cards wrap three-by-three. The only
 * hover here belongs to the four social buttons on each card: the card
 * itself is static.
 */
export function LandingCommittee() {
  return (
    <section
      id="committee"
      data-land="committee"
      className="flex w-full max-w-[1120px] flex-col items-center gap-7 px-10 pb-[120px]"
    >
      <SectionHeading center title="Executive committee 2026" />
      {COMMITTEE_GROUPS.map((group) => (
        <Fragment key={group.label}>
          <div className="w-full">
            <p className={`text-center ${LABEL_SM} text-[#8796A5]`}>
              {group.label}
            </p>
          </div>
          {group.rows.map((row, rowIndex) => (
            <div
              key={`${group.label}-${rowIndex}`}
              className={`flex w-full flex-row flex-wrap items-start justify-center gap-5 ${
                group.narrow ? "max-w-[760px]" : "max-w-full"
              }`}
            >
              {row.map((member, memberIndex) => (
                <article
                  key={`${member.role}-${memberIndex}`}
                  className={`${BORDER_CARD} flex w-[240px] shrink-0 flex-col items-start gap-4 rounded-3xl bg-white px-3 pb-5 pt-3`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                    <Image
                      src={COMMITTEE_PHOTO}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-2">
                    <p className="w-full text-[18px] font-semibold text-[#0B1B2B]">
                      {member.name}
                    </p>
                    <p className="w-full text-[15px] text-[#00629B]">
                      {member.role}
                    </p>
                  </div>
                  <div className="flex w-full flex-row items-center gap-2 px-2">
                    {MEMBER_SOCIALS.map((social) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={social.name}
                          href={social.href(member)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label(member)}
                          className="flex h-9 w-9 flex-row items-center justify-center rounded-full bg-[rgba(0,98,155,0.08)]"
                          whileHover={{
                            backgroundColor: "rgba(0, 98, 155, 0.18)",
                            scale: 1.1,
                          }}
                          transition={hoverSpring}
                        >
                          <Icon
                            size={18}
                            weight="regular"
                            className="text-[#00629B]"
                          />
                        </motion.a>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          ))}
        </Fragment>
      ))}
    </section>
  );
}
