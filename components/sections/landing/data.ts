/**
 * Landing page content.
 *
 * Every string, link and count here is transcribed from the source design:
 * this file exists so the section components stay layout-only and the copy
 * stays auditable in one place.
 */
import {
  Envelope,
  GithubLogo,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

/**
 * Primary navigation. Hrefs are root-absolute so the shared nav works from
 * any route: on the homepage a same-document `/#anchor` still jumps without
 * a reload, and from `/events` it returns to the homepage section.
 */
export const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#chapters", label: "Chapters" },
  { href: "/#events", label: "Events" },
  { href: "/#committee", label: "Committee" },
] as const;

export const STATS = [
  { value: "3", label: "Technical society chapters" },
  { value: "1", label: "Affinity group" },
  { value: "400k+", label: "IEEE members worldwide" },
  { value: "160+", label: "Countries in the network" },
] as const;

export const CHAPTERS = [
  {
    tag: "CHAPTER 01",
    logo: { src: "/brand/chapters/uwu-cs.png", width: 936, height: 432 },
    title: "Computer Society",
    description:
      "Software, AI, cybersecurity and cloud: hackathons, coding nights and talks with industry engineers.",
    dark: false,
  },
  {
    tag: "CHAPTER 02",
    logo: { src: "/brand/chapters/uwu-ias.png", width: 2100, height: 618 },
    title: "Industry Applications Society",
    description:
      "Bridging classroom theory and industry practice through industrial visits, power systems and process engineering projects.",
    dark: false,
  },
  {
    tag: "CHAPTER 03",
    logo: { src: "/brand/chapters/uwu-ras.png", width: 1920, height: 492 },
    title: "Robotics and Automation Society",
    description:
      "Designing, building and programming intelligent machines: from line followers to autonomous systems.",
    dark: false,
  },
  {
    tag: "AFFINITY GROUP",
    logo: { src: "/brand/chapters/uwu-wie.png", width: 920, height: 136 },
    title: "Women in Engineering",
    description:
      "Inspiring and empowering women in STEM through mentorship, leadership programs and outreach.",
    dark: true,
  },
] as const;

/**
 * Where an event happens.
 *
 * The branch publishes all three shapes: `in-person` and `hybrid` events give
 * the room, `online` events say how to join. Nothing about the venue is
 * inferred — an event without one never reaches this file.
 */
export type EventVenue = {
  readonly mode: "online" | "in-person" | "hybrid";
  readonly place: string;
};

/**
 * The organisation running the event beside the host chapter: another
 * chartered chapter inside the hierarchy, or a body outside IEEE. The chapter
 * case resolves to its portal where one exists, so the credit links home.
 */
export type EventCollaboration = {
  readonly name: string;
  readonly kind: "chapter" | "external";
  readonly description: string;
};

/**
 * The session's presenter. The photograph is the branch's people placeholder
 * until a portrait is supplied — never a stranger's face standing in.
 */
export type EventSpeaker = {
  readonly name: string;
  readonly title: string;
  readonly photo: string;
  readonly bio: string;
};

/** One attendee's words, attributed the way the site attributes people. */
export type EventFeedback = {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
};

/**
 * The published programme: one entry per event that has a preview page at
 * `/events/[slug]`, addressed by `slug`.
 *
 * Each row carries the full record that page renders — identity (title,
 * description, tag, cover), the facts (date, time, venue), the partners
 * (collaboration and sponsors), and the content bands (gallery, feedbacks,
 * speaker). Cards elsewhere in the site read the shared subset through
 * `EventRecord`, so a richer row never changes their layout.
 */
export const EVENTS = [
  {
    slug: "uwu-hackathon-2026",
    day: "24",
    month: "OCT",
    title: "UWU Hackathon 2026",
    description:
      "A 24-hour build sprint hosted by the Computer Society: form a team, ship a prototype, pitch to judges.",
    tag: "Computer Society",
    cover: "/photos/events/vision-code.jpg",
    time: "09:00 · 24 HOURS",
    venue: {
      mode: "in-person",
      place: "Faculty of Applied Sciences",
    },
    collaboration: {
      name: "SLASSCOM",
      kind: "external",
      description:
        "Sri Lanka's ICT industry association, connecting student builders with mentors, showcase opportunities and the wider technology sector.",
    },
    sponsors: [
      "IEEE Sri Lanka Section",
      "Faculty of Applied Sciences, UWU",
      "SLASSCOM",
    ],
    gallery: [
      "/photos/events/hack-night.jpg",
      "/photos/events/vision-code.jpg",
      "/photos/control-panel.jpg",
    ],
    speaker: {
      name: "Eng. Kasun Perera",
      title: "Software architect and IEEE volunteer",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Kasun has spent a decade shipping distributed systems and mentoring student teams through their first hackathons. He opens the sprint with a walk-through of scoping a build a team can actually finish in twenty-four hours.",
    },
    feedbacks: [
      {
        quote:
          "We arrived with an idea on paper and left with a prototype the judges actually used. The format is intense, but the mentors kept us honest about scope.",
        name: "Nimasha Perera",
        role: "Third year, Faculty of Applied Sciences",
      },
      {
        quote:
          "Forming a team on the spot turned out to be the best part — we shipped with people we had never met before.",
        name: "Tharindu Bandara",
        role: "Second year, Faculty of Science and Technology",
      },
    ],
  },
  {
    slug: "roborace-challenge",
    day: "08",
    month: "NOV",
    title: "RoboRace Challenge",
    description:
      "Design and race autonomous line-following robots in the Robotics and Automation Society's annual competition.",
    tag: "RAS",
    cover: "/photos/events/ros-robot.jpg",
    time: "13:00 – 17:00",
    venue: {
      mode: "in-person",
      place: "Robotics Laboratory, Badulla",
    },
    collaboration: {
      name: "IEEE Computer Society Student Branch",
      kind: "chapter",
      description:
        "The branch's Computer Society chapter co-runs the vision track: teams get its course-detection pipeline, and its members judge the final runs alongside RAS.",
    },
    sponsors: [
      "IEEE Sri Lanka Section",
      "Faculty of Science and Technology, UWU",
    ],
    gallery: [
      "/photos/events/ros-robot.jpg",
      "/photos/events/plc-panel.jpg",
      "/photos/robotics-arm.jpg",
    ],
    speaker: {
      name: "Dr. Anura Mendis",
      title: "Embedded systems lecturer and robotics mentor",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Anura has coached student robotics teams for eight years, from first line-followers to national finals. He walks the field through tuning a PID loop the pragmatic way before the gates open.",
    },
    feedbacks: [
      {
        quote:
          "The practice lane was the difference — by the time our run counted, the robot had already failed every corner at least once.",
        name: "Dilshan Fernando",
        role: "Fourth year, Faculty of Science and Technology",
      },
      {
        quote:
          "Watching the vision track run live made the Computer Society session finally click. We are joining that chapter next.",
        name: "Ayesha Rahman",
        role: "Third year, Faculty of Management Studies",
      },
    ],
  },
  {
    slug: "she-leads-in-tech",
    day: "22",
    month: "NOV",
    title: "She Leads in Tech",
    description:
      "An evening of talks and mentoring with women engineers from Sri Lanka's leading tech companies.",
    tag: "WIE",
    cover: "/photos/events/cv-clinic.jpg",
    time: "16:00 – 19:00",
    venue: {
      mode: "hybrid",
      place: "Main Auditorium · livestream",
    },
    collaboration: {
      name: "UWU Career Services Unit",
      kind: "external",
      description:
        "The university's career services unit brings placement advisers and alumni into the room, so the evening ends with concrete next steps rather than stories alone.",
    },
    sponsors: ["IEEE Sri Lanka Section", "IEEE WIE Affinity Group, Sri Lanka"],
    gallery: [
      "/photos/events/cv-clinic.jpg",
      "/photos/liquid-crystal.jpg",
      "/photos/events/hack-night.jpg",
    ],
    speaker: {
      name: "Eng. Sanduni Fernando",
      title: "Software engineer and IEEE volunteer",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Sanduni works on payments infrastructure and has mentored first-generation students through their first internships. She closes the evening with a candid hour on interviewing, pay conversations and staying in tech.",
    },
    feedbacks: [
      {
        quote:
          "Three of us asked about internships on the way out and actually got answers we could use in applications the same night.",
        name: "Ishara Wickramasinghe",
        role: "Second year, Faculty of Management Studies",
      },
      {
        quote:
          "Hearing how people from the same faculties got into the industry made it feel possible rather than aspirational.",
        name: "Maleesha Gunawardena",
        role: "Third year, Faculty of Applied Sciences",
      },
    ],
  },
  {
    slug: "industrial-automation-symposium-2026",
    day: "05",
    month: "DEC",
    title: "Industrial Automation Symposium 2026",
    description:
      "Full-day technical symposium featuring PLC architecture, smart grid integration, and factory automation visits.",
    tag: "Industry Applications Society",
    cover: "/photos/events/plc-panel.jpg",
    time: "09:00 – 16:30",
    venue: {
      mode: "in-person",
      place: "Auditorium Complex, Faculty of Technological Studies",
    },
    collaboration: {
      name: "IEEE IAS Sri Lanka Chapter",
      kind: "chapter",
      description:
        "Joint technical lecture series and factory control architecture demonstrations.",
    },
    sponsors: ["IEEE Sri Lanka Section", "IEEE IAS Sri Lanka Chapter"],
    gallery: [
      "/photos/events/plc-panel.jpg",
      "/photos/control-panel.jpg",
      "/photos/liquid-crystal.jpg",
    ],
    speaker: {
      name: "Dr. P. Jayasena",
      title: "Senior Lecturer in Mechatronics",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Dr. Jayasena conducts active research in industrial control loops and cyber-physical security.",
    },
    feedbacks: [
      {
        quote:
          "The PLC live simulator clinic was invaluable for our course projects.",
        name: "Gayan Bandara",
        role: "Fourth year, Faculty of Technological Studies",
      },
    ],
  },
  {
    slug: "ieee-uwu-congress-2026",
    day: "19",
    month: "DEC",
    title: "IEEE UWU Congress 2026",
    description:
      "The flagship annual congregation of IEEE volunteers at Uva Wellassa University: chapter showcases, keynote addresses, and leadership awards.",
    tag: "IEEE Student Branch",
    cover: "/photos/events/hack-night.jpg",
    time: "08:30 – 18:00",
    venue: {
      mode: "in-person",
      place: "Main University Gymnasium & Convention Hall",
    },
    collaboration: {
      name: "UWU Vice Chancellor's Office",
      kind: "external",
      description:
        "University patron and student volunteer leadership coordination.",
    },
    sponsors: ["IEEE Sri Lanka Section", "UWU Vice Chancellor's Office"],
    gallery: [
      "/photos/events/hack-night.jpg",
      "/photos/events/vision-code.jpg",
      "/photos/robotics-arm.jpg",
    ],
    speaker: {
      name: "Kavindu Dimal",
      title: "Student Branch Chair 2025/2026",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Opening keynote on university chapter growth and student technical impact across the Uva Province.",
    },
    feedbacks: [
      {
        quote:
          "The Congress unites all four chapters under one roof — the best networking day of the year.",
        name: "Tharindu Wickrama",
        role: "Third year volunteer",
      },
    ],
  },
] as const;

/**
 * The branch's archive: days that have already run.
 *
 * Card-shaped only — no `slug`, because there is no preview page for an event
 * that is over, so these cards read but never link (the shared card keeps a
 * slugless record a plain article by construction). The events page shows
 * them behind its Past tab; a chapter's own demo archive stays in
 * `unit/demo-data.ts`.
 */
export const PAST_EVENTS = [
  {
    day: "06",
    month: "OCT",
    title: "IEEE Day Celebration",
    description:
      "Chapter stands, live demos and a quiz night marking IEEE Day on campus.",
    tag: "WIE",
    cover: "/photos/events/hack-night.jpg",
  },
  {
    day: "19",
    month: "SEP",
    title: "Vision for Line Followers",
    description:
      "A hands-on clinic on camera and sensor choices for competition robots.",
    tag: "RAS",
    cover: "/photos/events/vision-code.jpg",
  },
  {
    day: "28",
    month: "AUG",
    title: "Résumé & Interview Clinic",
    description:
      "Résumé reviews and mock interviews with alumni working in software teams.",
    tag: "Computer Society",
    cover: "/photos/events/cv-clinic.jpg",
  },
] as const;

/**
 * One published calendar row, slug included.
 *
 * Every section that renders an event takes this shape: the cards on the
 * homepage's neighbours (`/events`, the preview route's closing grid), the
 * dated rows on the homepage, the tabbed cards on a chapter page, and the
 * preview route at `/events/[slug]`, addressed by `slug`. The demo entries in
 * `unit/demo-data.ts` carry the same fields without one, so a placeholder
 * event can never be linked to a page that does not exist.
 *
 * `registration` is the form URL and stays optional: until the branch
 * publishes one, the preview page's registration row renders its designed
 * opens-soon state instead of pointing at a form that does not exist.
 */
export type CalendarEvent = (typeof EVENTS)[number] & {
  readonly registration?: string;
};

export type Member = {
  name: string;
  role: string;
  email: string;
};

/**
 * Committee member shorthand. The branch addresses every member at
 * `<first-name>@ieeeuwu.org`, so the email derives from the name.
 */
const member = (name: string, role: string): Member => ({
  name,
  role,
  email: `${name.split(" ")[0].toLowerCase()}@ieeeuwu.org`,
});

/**
 * The committee renders as labelled groups. Leadership holds one card per
 * row (chair, then vice chair); the last group is capped at 760px so six
 * cards wrap three-by-three instead of running the full content width.
 */
export const COMMITTEE_GROUPS: {
  label: string;
  narrow: boolean;
  rows: Member[][];
}[] = [
  {
    label: "LEADERSHIP",
    narrow: false,
    rows: [
      [member("Kavindu Dimal", "Chairperson")],
      [member("Kavindu Dimal", "Vice Chairperson")],
    ],
  },
  {
    label: "EXECUTIVE OFFICERS",
    narrow: false,
    rows: [
      [
        member("Kavindu Dimal", "Secretary"),
        member("Kavindu Dimal", "Assistant Secretary"),
        member("Kavindu Dimal", "Treasurer"),
        member("Kavindu Dimal", "Webmaster"),
      ],
    ],
  },
  {
    label: "TEAM HEADS",
    narrow: false,
    rows: [
      [
        member("Kavindu Dimal", "Media & Design Head"),
        member("Kavindu Dimal", "Publicity Head"),
        member("Kavindu Dimal", "Editorial Head"),
      ],
    ],
  },
  {
    label: "TEAM MEMBERS",
    narrow: true,
    rows: [
      [
        member("Kavindu Dimal", "Media & Design Team"),
        member("Kavindu Dimal", "Media & Design Team"),
        member("Kavindu Dimal", "Publicity Team"),
        member("Kavindu Dimal", "Publicity Team"),
        member("Kavindu Dimal", "Editorial Team"),
        member("Kavindu Dimal", "Editorial Team"),
      ],
    ],
  },
];

/** The four buttons every member card carries, in source order. */
export const MEMBER_SOCIALS: {
  name: string;
  icon: Icon;
  href: (m: Member) => string;
  label: (m: Member) => string;
}[] = [
  {
    name: "LinkedIn",
    icon: LinkedinLogo,
    href: () => "https://www.linkedin.com/",
    label: (m) => `${m.name} on LinkedIn`,
  },
  {
    name: "GitHub",
    icon: GithubLogo,
    href: () => "https://github.com/",
    label: (m) => `${m.name} on GitHub`,
  },
  {
    name: "Email",
    icon: Envelope,
    href: (m) => `mailto:${m.email}`,
    label: (m) => `Email ${m.name}`,
  },
  {
    name: "X",
    icon: XLogo,
    href: () => "https://x.com/",
    label: (m) => `${m.name} on X`,
  },
];

export const COMMITTEE_PHOTO = "/photos/committee-placeholder.jpg";
