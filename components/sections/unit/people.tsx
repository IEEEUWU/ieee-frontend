"use client";

import Image from "next/image";
import { Fragment } from "react";
import { motion } from "motion/react";
import {
  COMMITTEE_PHOTO,
  MEMBER_SOCIALS,
  type Member,
} from "@/components/sections/landing/data";
import { BORDER_CARD, LABEL_SM } from "@/components/sections/landing/styles";
import { hoverSpring } from "@/components/sections/landing/hover";

/**
 * People groups in the landing committee's own structure: a tracked group
 * label over rows of 240px member cards — photo, name, role, four social
 * buttons — laid out with the same wrap and cap rules the homepage uses.
 *
 * The card is the homepage's card verbatim; only the colour source changes.
 * The role reads the unit's themed ink, the social buttons sit on the unit's
 * tint and lift to `rgba(brand, 0.18)` — the exact lift the homepage animates
 * from its own blue — because `brand` arrives here as a hex and the motion
 * target needs a literal to interpolate. One prop keeps the server/client
 * boundary serialisable while the rest of the page stays in CSS vars.
 */
export type MemberGroup = {
  readonly label?: string;
  /** Cap the row at 760px so a long list wraps instead of running wide. */
  readonly narrow?: boolean;
  readonly rows: readonly (readonly Member[])[];
};

/** `rgba()` string for a #RRGGBB brand colour at the given alpha. */
function brandRgba(brand: string, alpha: number): string {
  const hex = brand.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function UnitPeople({
  groups,
  brand,
}: {
  groups: readonly MemberGroup[];
  brand: string;
}) {
  const hoverBg = brandRgba(brand, 0.18);

  return (
    <>
      {groups.map((group) => (
        <Fragment key={group.label ?? "members"}>
          {group.label ? (
            <div className="w-full">
              <p className={`text-center ${LABEL_SM} text-[#8796A5]`}>
                {group.label}
              </p>
            </div>
          ) : null}
          {group.rows.map((row, rowIndex) => (
            <div
              key={`${group.label ?? "members"}-${rowIndex}`}
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
                    <p className="w-full text-[15px] text-[color:var(--unit-ink)]">
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
                          className="flex h-9 w-9 flex-row items-center justify-center rounded-full bg-[color:var(--unit-tint)]"
                          whileHover={{
                            backgroundColor: hoverBg,
                            scale: 1.1,
                          }}
                          transition={hoverSpring}
                        >
                          <Icon
                            size={18}
                            weight="regular"
                            className="text-[color:var(--unit-brand)]"
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
    </>
  );
}
