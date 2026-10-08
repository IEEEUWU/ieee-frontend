/**
 * Landing page content.
 *
 * Every string, link and count here is transcribed from the source design:
 * this file exists so the section components stay layout-only and the copy
 * stays auditable in one place.
 */
import {
  Cpu,
  Envelope,
  Factory,
  GithubLogo,
  LinkedinLogo,
  Robot,
  Users,
  XLogo,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#chapters", label: "Chapters" },
  { href: "#events", label: "Events" },
  { href: "#committee", label: "Committee" },
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
    icon: Cpu,
    title: "Computer Society",
    description:
      "Software, AI, cybersecurity and cloud: hackathons, coding nights and talks with industry engineers.",
    dark: false,
  },
  {
    tag: "CHAPTER 02",
    icon: Factory,
    title: "Industry Applications Society",
    description:
      "Bridging classroom theory and industry practice through industrial visits, power systems and process engineering projects.",
    dark: false,
  },
  {
    tag: "CHAPTER 03",
    icon: Robot,
    title: "Robotics and Automation Society",
    description:
      "Designing, building and programming intelligent machines: from line followers to autonomous systems.",
    dark: false,
  },
  {
    tag: "AFFINITY GROUP",
    icon: Users,
    title: "Women in Engineering",
    description:
      "Inspiring and empowering women in STEM through mentorship, leadership programs and outreach.",
    dark: true,
  },
] as const;

export const EVENTS = [
  {
    day: "24",
    month: "OCT",
    title: "UWU Hackathon 2026",
    description:
      "A 24-hour build sprint hosted by the Computer Society: form a team, ship a prototype, pitch to judges.",
    tag: "Computer Society",
  },
  {
    day: "08",
    month: "NOV",
    title: "RoboRace Challenge",
    description:
      "Design and race autonomous line-following robots in the Robotics and Automation Society's annual competition.",
    tag: "RAS",
  },
  {
    day: "22",
    month: "NOV",
    title: "She Leads in Tech",
    description:
      "An evening of talks and mentoring with women engineers from Sri Lanka's leading tech companies.",
    tag: "WIE",
  },
] as const;

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
