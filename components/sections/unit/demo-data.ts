/**
 * TEMPORARY DEMO DATA for the unit pages.
 *
 * Every roster, event, term and channel below is placeholder content so the
 * chapter page can be reviewed as a finished design instead of a column of
 * pending cards. None of it is published fact: the names are invented for
 * layout, the dates are sample archive entries, and the social links point
 * at the platforms rather than at handles that do not exist.
 *
 * The page keeps its designed pending states as the fallback path — empty a
 * list here and that section returns to its awaiting card. Replace this file
 * with the branch's supplied records, or empty it, before the site ships.
 */
import { InstagramLogo, LinkedinLogo } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { type Member } from "@/components/sections/landing/data";
import type { SocietyId } from "@/lib/units";
import type { ExComTerm } from "./excom";
import type { MemberGroup } from "./people";

/**
 * Committee shorthand, mirroring the homepage's `member()` helper: the branch
 * addresses members at `<surname>@ieeeuwu.org`, so the email derives from the
 * name and the card's social buttons have a real mailto to hand.
 */
const demoMember = (name: string, role: string): Member => ({
  name,
  role,
  email: `${name
    .replace(/^(?:Dr|Prof|Mr|Ms|Mrs)\.\s*/i, "")
    .split(/\s+/)
    .pop()!
    .replace(/\./g, "")
    .toLowerCase()}@ieeeuwu.org`,
});

/**
 * The shared event fields, so one card renders the calendar's published rows
 * and this file's demo entries alike. `cover` wears the branch's CC0 stock
 * from `/photos` — decorative, claiming nothing documentary.
 */
export type DemoEvent = {
  day: string;
  month: string;
  title: string;
  description: string;
  tag: string;
  cover: string;
};

/** Faculty guidance, two per unit, rendered as an unlabelled committee row. */
export const DEMO_ADVISORS: Record<SocietyId, readonly Member[]> = {
  sb: [],
  cs: [
    demoMember("Dr. N. Wickramasinghe", "Faculty Advisor"),
    demoMember("Prof. S. Fernando", "Co-Advisor"),
  ],
  ias: [
    demoMember("Dr. P. Jayasena", "Faculty Advisor"),
    demoMember("Prof. T. Sirisena", "Co-Advisor"),
  ],
  ras: [
    demoMember("Dr. A. Gunawardena", "Faculty Advisor"),
    demoMember("Prof. R. Weerasinghe", "Co-Advisor"),
  ],
  wie: [
    demoMember("Dr. H. M. Fernando", "Faculty Advisor"),
    demoMember("Prof. L. Chandrasiri", "Co-Advisor"),
  ],
};

/**
 * The 15-seat committee skeleton — group labels, roles, and row grouping —
 * replicated by every chapter and affinity group: leadership one card per
 * row, four executive officers across, three team heads, and six team
 * members capped at 760px so they wrap three-by-three. It is the homepage's
 * `COMMITTEE_GROUPS` structure verbatim; only the names differ per unit,
 * and they are demo placeholders like everything else in this file.
 */
const EXCOM_SKELETON: readonly {
  label: string;
  narrow?: boolean;
  rows: readonly (readonly string[])[];
}[] = [
  { label: "LEADERSHIP", rows: [["Chairperson"], ["Vice Chairperson"]] },
  {
    label: "EXECUTIVE OFFICERS",
    rows: [["Secretary", "Assistant Secretary", "Treasurer", "Webmaster"]],
  },
  {
    label: "TEAM HEADS",
    rows: [["Media & Design Head", "Publicity Head", "Editorial Head"]],
  },
  {
    label: "TEAM MEMBERS",
    narrow: true,
    rows: [
      [
        "Media & Design Team",
        "Media & Design Team",
        "Publicity Team",
        "Publicity Team",
        "Editorial Team",
        "Editorial Team",
      ],
    ],
  },
];

/**
 * Walk the skeleton's roles in order, consuming exactly fifteen names — the
 * seat count every unit's committee carries.
 */
const buildExcom = (names: readonly string[]): readonly MemberGroup[] => {
  let seat = 0;
  return EXCOM_SKELETON.map((group) => ({
    label: group.label,
    narrow: group.narrow,
    rows: group.rows.map((row) =>
      row.map((role) => demoMember(names[seat++], role)),
    ),
  }));
};

export const DEMO_EXCOM: Record<SocietyId, readonly MemberGroup[]> = {
  sb: [],
  cs: buildExcom([
    "D. Amarasinghe",
    "H. Wickrama",
    "N. Gunasekara",
    "S. Rathnayake",
    "P. Herath",
    "S. Weerathunga",
    "M. Silva",
    "T. Bandara",
    "R. Abeysekara",
    "A. Gunathilaka",
    "N. Perera",
    "K. Kasthuri",
    "W. Fernando",
    "G. Gunawardena",
    "L. Jayasuriya",
  ]),
  ias: buildExcom([
    "A. Rajapaksa",
    "P. Senanayake",
    "K. Dissanayake",
    "M. Bandara",
    "W. Ranasinghe",
    "H. Gunawardena",
    "I. Perera",
    "J. Kumara",
    "B. Wijeratne",
    "D. Herath",
    "T. Silva",
    "R. Fernando",
    "C. Gunasekara",
    "S. Amarasinghe",
    "E. Wickramasinghe",
  ]),
  ras: buildExcom([
    "V. Jayasuriya",
    "A. Weerathunga",
    "C. Bandaranayake",
    "N. Kumara",
    "E. Mendis",
    "L. Wijeratne",
    "G. Senanayake",
    "F. Liyanage",
    "K. Ekanayake",
    "P. Dissanayake",
    "H. Silva",
    "M. Herath",
    "J. Gunawardena",
    "R. Perera",
    "D. Bandara",
  ]),
  wie: buildExcom([
    "A. Wijesinghe",
    "T. Mudalige",
    "S. Kulatunga",
    "K. Weerasinghe",
    "Y. Eheliyagoda",
    "B. Rathnayake",
    "P. Seneviratne",
    "O. Dahanayake",
    "N. Fernando",
    "L. Gunadasa",
    "S. Perera",
    "A. Silva",
    "D. Pathirana",
    "H. Kulatunge",
    "R. Mendis",
  ]),
};

/**
 * A demo session schedule only for units the shared calendar does not cover:
 * CS, RAS and WIE already have their published rows in `EVENTS`, and nothing
 * here is ever allowed to compete with them. The cover is the branch's CC0
 * stock, decorative.
 */
export const DEMO_UPCOMING: Partial<Record<SocietyId, readonly DemoEvent[]>> = {
  ias: [
    {
      day: "14",
      month: "NOV",
      title: "Industrial Automation Hands-On",
      description:
        "A practical session on PLCs and control loops with the Industry Applications Society.",
      tag: "Industry Applications Society",
      cover: "/photos/events/plc-panel.jpg",
    },
  ],
};

/**
 * Sample archive entries so the past-events tab can be reviewed filled.
 * Covers wear the branch's CC0 stock (see `lib/photos.ts`) — decorative
 * imagery, claiming nothing documentary about invented events.
 */
export const DEMO_PAST_EVENTS: Record<
  SocietyId,
  readonly DemoEvent[]
> = {
  sb: [],
  cs: [
    {
      day: "12",
      month: "SEP",
      title: "Hello World Night",
      description:
        "An evening of beginner programming drills and pairing for new members.",
      tag: "Computer Society",
      cover: "/photos/events/hack-night.jpg",
    },
    {
      day: "18",
      month: "APR",
      title: "Capture the Flag",
      description:
        "A beginner-friendly security CTF: web, crypto and forensics challenges.",
      tag: "Computer Society",
      cover: "/photos/events/vision-code.jpg",
    },
    {
      day: "28",
      month: "FEB",
      title: "Open Source Day",
      description:
        "First contributions to open source projects, mentored by chapter members.",
      tag: "Computer Society",
      cover: "/photos/events/cv-clinic.jpg",
    },
  ],
  ias: [
    {
      day: "05",
      month: "SEP",
      title: "Industrial Visit",
      description:
        "A guided visit to a regional plant, tracing process control from intake to dispatch.",
      tag: "Industry Applications Society",
      cover: "/photos/control-panel.jpg",
    },
    {
      day: "20",
      month: "MAR",
      title: "Power Systems Seminar",
      description:
        "A technical seminar on distribution networks and load flow, led with faculty.",
      tag: "Industry Applications Society",
      cover: "/photos/liquid-crystal.jpg",
    },
    {
      day: "14",
      month: "FEB",
      title: "Process Engineering Workshop",
      description:
        "Hands-on instrumentation and control-loop tuning for final-year projects.",
      tag: "Industry Applications Society",
      cover: "/photos/robotics-arm.jpg",
    },
  ],
  ras: [
    {
      day: "19",
      month: "SEP",
      title: "Line Follower Workshop",
      description:
        "Build and tune a line-following robot from chassis to PID in one afternoon.",
      tag: "RAS",
      cover: "/photos/events/ros-robot.jpg",
    },
    {
      day: "10",
      month: "JAN",
      title: "Autonomous Bootcamp",
      description:
        "A weekend bootcamp on sensors, perception and navigation for mobile robots.",
      tag: "RAS",
      cover: "/photos/robotics-arm.jpg",
    },
    {
      day: "06",
      month: "DEC",
      title: "RoboRace Finale",
      description:
        "The season's closing race: head-to-head elimination on the chapter's track.",
      tag: "RAS",
      cover: "/photos/control-panel.jpg",
    },
  ],
  wie: [
    {
      day: "27",
      month: "SEP",
      title: "STEM Outreach Day",
      description:
        "Hands-on science sessions for school students, run by the affinity group.",
      tag: "WIE",
      cover: "/photos/events/cv-clinic.jpg",
    },
    {
      day: "15",
      month: "MAR",
      title: "CV & Interview Clinic",
      description:
        "Resume reviews and mock interviews with engineers from industry.",
      tag: "WIE",
      cover: "/photos/events/vision-code.jpg",
    },
    {
      day: "08",
      month: "MAR",
      title: "She Leads Summit",
      description:
        "A day of talks and mentoring celebrating women in engineering.",
      tag: "WIE",
      cover: "/photos/events/hack-night.jpg",
    },
  ],
};

/** The session now in office: the ExCom selector's default option. */
export const DEMO_CURRENT_TERM = "2026 / 2027";

/**
 * Two archived terms behind the ExCom selector. Each carries the same
 * 15-seat skeleton as the current committee — one committee per year, only
 * the people change — and, like every demo block here, the names are shared
 * across units.
 */
export const DEMO_TERMS: readonly ExComTerm[] = [
  {
    id: "2025-26",
    label: "2025 / 2026",
    groups: buildExcom([
      "R. Wickramasinghe",
      "S. Bandara",
      "N. Fernando",
      "T. Gunasekara",
      "P. Mendis",
      "A. Jayasuriya",
      "L. Silva",
      "D. Perera",
      "H. Kumara",
      "M. Ranasinghe",
      "C. Wijesinghe",
      "G. Dissanayake",
      "E. Herath",
      "V. Senanayake",
      "B. Liyanage",
    ]),
  },
  {
    id: "2024-25",
    label: "2024 / 2025",
    groups: buildExcom([
      "J. Weerathunga",
      "F. Gunawardena",
      "O. Seneviratne",
      "R. Ekanayake",
      "W. Dahanayake",
      "K. Rathnayake",
      "Y. Mudalige",
      "S. Kulatunge",
      "A. Gunadasa",
      "P. Abeysekara",
      "N. Kasthuri",
      "T. Amarasinghe",
      "D. Wijewardene",
      "I. Weerasinghe",
      "C. Jayawardena",
    ]),
  },
];

/**
 * What the About card lists as published while the demo data is in place,
 * so the status card agrees with the rosters shown below it. When empty the
 * card falls back to the real `pending` record in `lib/units.ts`.
 */
export const DEMO_PUBLICATION: readonly string[] = [
  "Officer roster",
  "Advisor roster",
  "Session schedule",
  "Event archive",
];

/** Unit inbox follows the branch's `<unit>@ieeeuwu.org` address pattern. */
export const DEMO_EMAILS: Record<SocietyId, string> = {
  sb: "branch@ieeeuwu.org",
  cs: "cs@ieeeuwu.org",
  ias: "ias@ieeeuwu.org",
  ras: "ras@ieeeuwu.org",
  wie: "wie@ieeeuwu.org",
};

/**
 * Platform links, never fabricated handles — the same convention the
 * homepage's member cards use for their social buttons.
 */
export const DEMO_SOCIALS: {
  name: string;
  icon: Icon;
  href: string;
  label: (unit: string) => string;
}[] = [
  {
    name: "Instagram",
    icon: InstagramLogo,
    href: "https://www.instagram.com/",
    label: (unit) => `${unit} on Instagram`,
  },
  {
    name: "LinkedIn",
    icon: LinkedinLogo,
    href: "https://www.linkedin.com/",
    label: (unit) => `${unit} on LinkedIn`,
  },
];
