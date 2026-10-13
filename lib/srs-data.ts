/**
 * IEEE UWU Student Branch — Centralized SRS v1.1 Data Layer & State Store
 *
 * Fully typed, hardcoded pre-seeded database embodying the complete
 * Software Requirements Specification (v1.1) for all 5 units:
 * SB, IAS, CS, RAS, and WIE.
 */

export type SocietyId = "sb" | "ias" | "cs" | "ras" | "wie";

export type UnitType = "branch" | "chapter" | "affinity_group";

export type Advisor = {
  id: string;
  name: string;
  designation: string;
  unitId: SocietyId;
  termLabel: string;
  imageUrl: string;
  isPublic: boolean;
};

export type BodTier = "senior" | "junior";

export type BodMember = {
  id: string;
  name: string;
  position: string;
  tier: BodTier;
  displayOrder: number;
  imageUrl: string;
  email: string;
  bio?: string;
};

export type BodTerm = {
  id: string;
  unitId: SocietyId;
  termLabel: string;
  startDate: string;
  endDate: string;
  state: "current" | "past";
  isPublished: boolean;
  members: BodMember[];
};

export type OrganisationalUnit = {
  id: SocietyId;
  name: string;
  abbreviation: string;
  type: UnitType;
  parentId: SocietyId | null;
  description: string;
  areas: string[];
  publicationState: "published" | "draft" | "archived";
  portalUrl: string;
  colour: {
    brand: string;
    ink: string;
  };
  logo: { src: string; width: number; height: number } | null;
  advisors: Advisor[];
};

export type EventMode = "physical" | "virtual" | "hybrid";
export type EventState = "draft" | "published" | "cancelled" | "archived";

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "date"
  | "heading";

export type FormField = {
  id: string;
  key: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  isRequired: boolean;
  options?: string[];
  coreMapping?: "attendee_name" | "attendee_email" | "student_id" | "phone";
};

export type FormDefinition = {
  id: string;
  eventId: string;
  purpose: "participant" | "oc";
  title: string;
  isEnabled: boolean;
  openAt: string;
  closeAt: string;
  fields: FormField[];
};

export type SrsEvent = {
  id: string;
  slug: string;
  unitId: SocietyId;
  title: string;
  description: string;
  cover: string;
  day: string;
  month: string;
  year: string;
  time: string;
  startTime: string;
  endTime: string;
  mode: EventMode;
  venue: string;
  state: EventState;
  capacityLimit: number;
  participantForm: FormDefinition;
  ocForm: FormDefinition;
  sponsors: string[];
  speaker?: {
    name: string;
    title: string;
    bio: string;
    photo: string;
  };
};

export type EventItem = SrsEvent;
export type DynamicForm = FormDefinition;

export type Submission = {
  id: string;
  eventId: string;
  formId: string;
  purpose: "participant" | "oc";
  referenceCode: string;
  status: "valid" | "invalidated";
  submittedAt: string;
  answers: Record<string, string | string[]>;
  attendeeName: string;
  attendeeEmail: string;
  studentRegNo?: string;
  phone?: string;
  qrToken?: string;
};

// =============================================================================
// PRE-SEEDED HARDCODED DATA STORE
// =============================================================================

export const INITIAL_UNITS: OrganisationalUnit[] = [
  {
    id: "sb",
    abbreviation: "SB",
    name: "IEEE UWU Student Branch",
    type: "branch",
    parentId: null,
    portalUrl: "/",
    description:
      "The apex governing student branch at Uva Wellassa University of Sri Lanka, overseeing governance, joint events, and overarching chapter operations.",
    areas: ["Branch governance", "Public events & congresses", "Inter-chapter initiatives"],
    publicationState: "published",
    colour: { brand: "#00629B", ink: "#00629B" },
    logo: null,
    advisors: [
      {
        id: "adv-sb-1",
        name: "Prof. K. W. S. K. Wickrama",
        designation: "Branch Counselor",
        unitId: "sb",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
      {
        id: "adv-sb-2",
        name: "Dr. D. M. C. Dassanayake",
        designation: "Branch Mentor",
        unitId: "sb",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
    ],
  },
  {
    id: "cs",
    abbreviation: "CS",
    name: "IEEE Computer Society Student Branch Chapter",
    type: "chapter",
    parentId: "sb",
    portalUrl: "/cs",
    description:
      "Computing practice end-to-end: systems, machine learning, cloud networks, cybersecurity, and coding competitions.",
    areas: ["Software engineering & AI", "Systems and networks", "Competitive coding"],
    publicationState: "published",
    colour: { brand: "#E8730C", ink: "#B4530A" },
    logo: { src: "/brand/chapters/uwu-cs.png", width: 936, height: 432 },
    advisors: [
      {
        id: "adv-cs-1",
        name: "Dr. N. Wickramasinghe",
        designation: "Faculty Advisor",
        unitId: "cs",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
      {
        id: "adv-cs-2",
        name: "Prof. S. Fernando",
        designation: "Chapter Co-Advisor",
        unitId: "cs",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
    ],
  },
  {
    id: "ias",
    abbreviation: "IAS",
    name: "IEEE Industry Applications Society Student Branch Chapter",
    type: "chapter",
    parentId: "sb",
    portalUrl: "/ias",
    description:
      "Bridging academia with heavy industry: process control, PLC automation, plant logic, instrumentation, and power distribution.",
    areas: ["Process automation", "PLC & industrial control", "Energy & power systems"],
    publicationState: "published",
    colour: { brand: "#00843D", ink: "#00622E" },
    logo: { src: "/brand/chapters/uwu-ias.png", width: 2100, height: 618 },
    advisors: [
      {
        id: "adv-ias-1",
        name: "Dr. P. Jayasena",
        designation: "Faculty Advisor",
        unitId: "ias",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
      {
        id: "adv-ias-2",
        name: "Prof. T. Sirisena",
        designation: "Chapter Co-Advisor",
        unitId: "ias",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
    ],
  },
  {
    id: "ras",
    abbreviation: "RAS",
    name: "IEEE Robotics and Automation Society Student Branch Chapter",
    type: "chapter",
    parentId: "sb",
    portalUrl: "/ras",
    description:
      "Mechatronics, robot perception, and control systems: intelligent autonomous mobile robots, computer vision, and embedded controllers.",
    areas: ["Embedded systems", "Robot design & PID control", "Autonomous navigation"],
    publicationState: "published",
    colour: { brand: "#A6192E", ink: "#8C1526" },
    logo: { src: "/brand/chapters/uwu-ras.png", width: 1920, height: 492 },
    advisors: [
      {
        id: "adv-ras-1",
        name: "Dr. A. Gunawardena",
        designation: "Faculty Advisor",
        unitId: "ras",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
      {
        id: "adv-ras-2",
        name: "Prof. R. Weerasinghe",
        designation: "Chapter Co-Advisor",
        unitId: "ras",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
    ],
  },
  {
    id: "wie",
    abbreviation: "WIE",
    name: "IEEE Women in Engineering Student Branch Affinity Group",
    type: "affinity_group",
    parentId: "sb",
    portalUrl: "/wie",
    description:
      "Fostering female leadership in STEM disciplines, career mentorship pipelines, technical workshops, and school outreach programs.",
    areas: ["Women in tech leadership", "STEM outreach & mentorship", "Professional development"],
    publicationState: "published",
    colour: { brand: "#702F8A", ink: "#5C2771" },
    logo: { src: "/brand/chapters/uwu-wie.png", width: 920, height: 136 },
    advisors: [
      {
        id: "adv-wie-1",
        name: "Dr. H. M. Fernando",
        designation: "Affinity Group Advisor",
        unitId: "wie",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
      {
        id: "adv-wie-2",
        name: "Prof. L. Chandrasiri",
        designation: "Affinity Group Co-Advisor",
        unitId: "wie",
        termLabel: "2025/2026",
        imageUrl: "/photos/committee-placeholder.jpg",
        isPublic: true,
      },
    ],
  },
];

// Helper to create BOD members
function makeMember(
  id: string,
  name: string,
  position: string,
  tier: BodTier,
  order: number,
  unitPrefix?: string,
): BodMember {
  const surname = name.split(" ").pop()?.toLowerCase() ?? "member";
  const domain = unitPrefix ? `${unitPrefix}.ieeeuwu.org` : "ieeeuwu.org";
  return {
    id,
    name,
    position,
    tier,
    displayOrder: order,
    imageUrl: "/photos/committee-placeholder.jpg",
    email: `${surname}@${domain}`,
  };
}

export const INITIAL_BOD_TERMS: BodTerm[] = [
  // Computer Society (CS) Terms
  {
    id: "term-cs-2025-2026",
    unitId: "cs",
    termLabel: "2025/2026",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    state: "current",
    isPublished: true,
    members: [
      // Senior Tier
      makeMember("cs-curr-s1", "D. Amarasinghe", "Chairperson", "senior", 1, "cs"),
      makeMember("cs-curr-s2", "H. Wickrama", "Vice Chairperson", "senior", 2, "cs"),
      makeMember("cs-curr-s3", "N. Gunasekara", "Secretary", "senior", 3, "cs"),
      makeMember("cs-curr-s4", "S. Rathnayake", "Assistant Secretary", "senior", 4, "cs"),
      makeMember("cs-curr-s5", "P. Herath", "Treasurer", "senior", 5, "cs"),
      makeMember("cs-curr-s6", "S. Weerathunga", "Webmaster", "senior", 6, "cs"),
      makeMember("cs-curr-s7", "M. Silva", "Media & Design Head", "senior", 7, "cs"),
      makeMember("cs-curr-s8", "T. Bandara", "Publicity Head", "senior", 8, "cs"),
      makeMember("cs-curr-s9", "R. Abeysekara", "Editorial Head", "senior", 9, "cs"),
      // Junior Tier
      makeMember("cs-curr-j1", "A. Gunathilaka", "Junior Coordinator", "junior", 10, "cs"),
      makeMember("cs-curr-j2", "N. Perera", "Assistant Webmaster", "junior", 11, "cs"),
      makeMember("cs-curr-j3", "K. Kasthuri", "Media Team Associate", "junior", 12, "cs"),
      makeMember("cs-curr-j4", "W. Fernando", "Publicity Associate", "junior", 13, "cs"),
      makeMember("cs-curr-j5", "G. Gunawardena", "Logistics Associate", "junior", 14, "cs"),
      makeMember("cs-curr-j6", "L. Jayasuriya", "Tech Associate", "junior", 15, "cs"),
    ],
  },
  {
    id: "term-cs-2024-2025",
    unitId: "cs",
    termLabel: "2024/2025",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    state: "past",
    isPublished: true,
    members: [
      makeMember("cs-past-s1", "Chathura Priyashantha", "Immediate Past Chair", "senior", 1, "cs"),
      makeMember("cs-past-s2", "Dilani Senanayake", "Vice Chairperson", "senior", 2, "cs"),
      makeMember("cs-past-s3", "Ruwan Ranasinghe", "Secretary", "senior", 3, "cs"),
      makeMember("cs-past-s4", "Ishara Madushanka", "Treasurer", "senior", 4, "cs"),
      makeMember("cs-past-j1", "H. Wickrama", "Junior Officer", "junior", 5, "cs"),
      makeMember("cs-past-j2", "D. Amarasinghe", "Junior Tech Lead", "junior", 6, "cs"),
    ],
  },
  {
    id: "term-cs-2023-2024",
    unitId: "cs",
    termLabel: "2023/2024",
    startDate: "2023-03-01",
    endDate: "2024-02-28",
    state: "past",
    isPublished: true,
    members: [
      makeMember("cs-p23-s1", "Janaka Senarath", "Chairperson", "senior", 1, "cs"),
      makeMember("cs-p23-s2", "Kasunika Perera", "Secretary", "senior", 2, "cs"),
      makeMember("cs-p23-j1", "Chathura Priyashantha", "Junior Associate", "junior", 3, "cs"),
    ],
  },

  // Main SB Terms
  {
    id: "term-sb-2025-2026",
    unitId: "sb",
    termLabel: "2025/2026",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    state: "current",
    isPublished: true,
    members: [
      makeMember("sb-curr-s1", "Kavindu Dimal", "Chairperson", "senior", 1, "sb"),
      makeMember("sb-curr-s2", "Sachintha Dilshan", "Vice Chairperson", "senior", 2, "sb"),
      makeMember("sb-curr-s3", "Nadeesha Gunasekara", "Secretary", "senior", 3, "sb"),
      makeMember("sb-curr-s4", "Dulanjalee Herath", "Assistant Secretary", "senior", 4, "sb"),
      makeMember("sb-curr-s5", "Tharaka Bandara", "Treasurer", "senior", 5, "sb"),
      makeMember("sb-curr-s6", "Praveen Jayasinghe", "Webmaster", "senior", 6, "sb"),
      makeMember("sb-curr-j1", "Amasha Wijesuriya", "Junior Branch Rep", "junior", 7, "sb"),
      makeMember("sb-curr-j2", "Binura Fernando", "Assistant Webmaster", "junior", 8, "sb"),
      makeMember("sb-curr-j3", "Chamath De Silva", "Junior Logistics Officer", "junior", 9, "sb"),
    ],
  },
  {
    id: "term-sb-2024-2025",
    unitId: "sb",
    termLabel: "2024/2025",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    state: "past",
    isPublished: true,
    members: [
      makeMember("sb-past-s1", "Ravindu Lakshitha", "Chairperson", "senior", 1, "sb"),
      makeMember("sb-past-s2", "Harshani Jayakody", "Secretary", "senior", 2, "sb"),
      makeMember("sb-past-j1", "Kavindu Dimal", "Junior Treasurer", "junior", 3, "sb"),
    ],
  },

  // IAS Terms
  {
    id: "term-ias-2025-2026",
    unitId: "ias",
    termLabel: "2025/2026",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    state: "current",
    isPublished: true,
    members: [
      makeMember("ias-curr-s1", "A. Rajapaksa", "Chairperson", "senior", 1, "ias"),
      makeMember("ias-curr-s2", "P. Senanayake", "Vice Chairperson", "senior", 2, "ias"),
      makeMember("ias-curr-s3", "K. Dissanayake", "Secretary", "senior", 3, "ias"),
      makeMember("ias-curr-s4", "M. Bandara", "Treasurer", "senior", 4, "ias"),
      makeMember("ias-curr-j1", "W. Ranasinghe", "Junior Technical Lead", "junior", 5, "ias"),
      makeMember("ias-curr-j2", "H. Gunawardena", "Junior Industry Liaison", "junior", 6, "ias"),
    ],
  },

  // RAS Terms
  {
    id: "term-ras-2025-2026",
    unitId: "ras",
    termLabel: "2025/2026",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    state: "current",
    isPublished: true,
    members: [
      makeMember("ras-curr-s1", "V. Jayasuriya", "Chairperson", "senior", 1, "ras"),
      makeMember("ras-curr-s2", "A. Weerathunga", "Vice Chairperson", "senior", 2, "ras"),
      makeMember("ras-curr-s3", "C. Bandaranayake", "Secretary", "senior", 3, "ras"),
      makeMember("ras-curr-s4", "N. Kumara", "Treasurer", "senior", 4, "ras"),
      makeMember("ras-curr-j1", "E. Mendis", "Junior Robotics Lead", "junior", 5, "ras"),
      makeMember("ras-curr-j2", "L. Wijeratne", "Junior Embedded Officer", "junior", 6, "ras"),
    ],
  },

  // WIE Terms
  {
    id: "term-wie-2025-2026",
    unitId: "wie",
    termLabel: "2025/2026",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    state: "current",
    isPublished: true,
    members: [
      makeMember("wie-curr-s1", "A. Wijesinghe", "Chairperson", "senior", 1, "wie"),
      makeMember("wie-curr-s2", "T. Mudalige", "Vice Chairperson", "senior", 2, "wie"),
      makeMember("wie-curr-s3", "S. Kulatunga", "Secretary", "senior", 3, "wie"),
      makeMember("wie-curr-s4", "K. Weerasinghe", "Treasurer", "senior", 4, "wie"),
      makeMember("wie-curr-j1", "Y. Eheliyagoda", "Junior Outreach Coordinator", "junior", 5, "wie"),
      makeMember("wie-curr-j2", "B. Rathnayake", "Junior Associate", "junior", 6, "wie"),
    ],
  },
];

// Helper to create standard form fields
function createParticipantFields(eventSlug: string): FormField[] {
  return [
    {
      id: `${eventSlug}-f1`,
      key: "fullName",
      type: "text",
      label: "Full Name (as to appear on certificate)",
      placeholder: "e.g. Kasun Chamara Perera",
      isRequired: true,
      coreMapping: "attendee_name",
    },
    {
      id: `${eventSlug}-f2`,
      key: "studentRegNo",
      type: "text",
      label: "University Registration Number",
      placeholder: "e.g. UWU/CST/22/045",
      helperText: "Unique identifier for deduplication check",
      isRequired: true,
      coreMapping: "student_id",
    },
    {
      id: `${eventSlug}-f3`,
      key: "email",
      type: "email",
      label: "Email Address",
      placeholder: "e.g. kasun.p@std.uwu.ac.lk",
      isRequired: true,
      coreMapping: "attendee_email",
    },
    {
      id: `${eventSlug}-f4`,
      key: "phone",
      type: "phone",
      label: "Contact Mobile / WhatsApp Number",
      placeholder: "e.g. 0771234567",
      isRequired: true,
      coreMapping: "phone",
    },
    {
      id: `${eventSlug}-f5`,
      key: "faculty",
      type: "dropdown",
      label: "Faculty",
      isRequired: true,
      options: [
        "Faculty of Applied Sciences",
        "Faculty of Science & Technology",
        "Faculty of Technological Studies",
        "Faculty of Management Studies",
      ],
    },
    {
      id: `${eventSlug}-f6`,
      key: "trackPreference",
      type: "single_choice",
      label: "Track / Stream Preference",
      isRequired: true,
      options: ["Software / AI Stream", "Hardware & Embedded Systems", "Open Innovation"],
    },
    {
      id: `${eventSlug}-f7`,
      key: "tshirtSize",
      type: "single_choice",
      label: "T-Shirt Size",
      isRequired: false,
      options: ["S", "M", "L", "XL", "2XL"],
    },
    {
      id: `${eventSlug}-f8`,
      key: "dietaryNotes",
      type: "text",
      label: "Dietary Restrictions / Emergency Notes",
      placeholder: "e.g. Vegetarian, None",
      isRequired: false,
    },
  ];
}

function createOcFields(eventSlug: string): FormField[] {
  return [
    {
      id: `${eventSlug}-oc-f1`,
      key: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "e.g. Sahan Mihiranga",
      isRequired: true,
      coreMapping: "attendee_name",
    },
    {
      id: `${eventSlug}-oc-f2`,
      key: "studentRegNo",
      type: "text",
      label: "University Registration Number",
      placeholder: "e.g. UWU/SCT/23/012",
      isRequired: true,
      coreMapping: "student_id",
    },
    {
      id: `${eventSlug}-oc-f3`,
      key: "email",
      type: "email",
      label: "Email Address",
      placeholder: "e.g. sahan.m@std.uwu.ac.lk",
      isRequired: true,
      coreMapping: "attendee_email",
    },
    {
      id: `${eventSlug}-oc-f4`,
      key: "phone",
      type: "phone",
      label: "Contact Mobile Number",
      placeholder: "e.g. 0719876543",
      isRequired: true,
      coreMapping: "phone",
    },
    {
      id: `${eventSlug}-oc-f5`,
      key: "academicYear",
      type: "dropdown",
      label: "Academic Year / Batch",
      isRequired: true,
      options: ["1st Year (Junior Volunteer)", "2nd Year", "3rd Year", "4th Year"],
    },
    {
      id: `${eventSlug}-oc-f6`,
      key: "subTeams",
      type: "dropdown",
      label: "Primary Sub-Team Preference",
      isRequired: true,
      options: [
        "Media & Graphic Design",
        "Logistics & Venue Operations",
        "Program, Agenda & Flow",
        "Publicity & Campus Outreach",
        "Webmaster & Systems Desk",
        "Finance & Sponsor Liaison",
      ],
    },
    {
      id: `${eventSlug}-oc-f7`,
      key: "priorExperience",
      type: "textarea",
      label: "Past Volunteer / Organizing Experience",
      placeholder: "Describe prior IEEE, university, or school committee work...",
      isRequired: false,
    },
    {
      id: `${eventSlug}-oc-f8`,
      key: "statement",
      type: "textarea",
      label: "Statement of Intent (Why join this event OC?)",
      placeholder: "What skills do you bring and what do you hope to accomplish?",
      isRequired: true,
    },
    {
      id: `${eventSlug}-oc-f9`,
      key: "availability",
      type: "single_choice",
      label: "Commitment Availability",
      isRequired: true,
      options: [
        "Full commitment (Preparations + Event Day)",
        "Partial commitment (Event Day only)",
        "Flexible / On-call volunteer",
      ],
    },
  ];
}

export const INITIAL_EVENTS: SrsEvent[] = [
  {
    id: "evt-cs-hackathon",
    slug: "uwu-hackathon-2026",
    unitId: "cs",
    title: "UWU Hackathon 2026",
    description:
      "A 24-hour build sprint hosted by the Computer Society: form a team, ship a prototype, pitch to judges.",
    cover: "/photos/events/vision-code.jpg",
    day: "24",
    month: "OCT",
    year: "2026",
    time: "09:00 · 24 HOURS",
    startTime: "2026-10-24T09:00:00+05:30",
    endTime: "2026-10-25T09:00:00+05:30",
    mode: "physical",
    venue: "Faculty of Applied Sciences, UWU",
    state: "published",
    capacityLimit: 120,
    sponsors: ["IEEE Sri Lanka Section", "Faculty of Applied Sciences, UWU", "SLASSCOM"],
    speaker: {
      name: "Eng. Kasun Perera",
      title: "Software architect and IEEE volunteer",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Kasun has spent a decade shipping distributed systems and mentoring student teams through their first hackathons.",
    },
    participantForm: {
      id: "form-part-hackathon",
      eventId: "evt-cs-hackathon",
      purpose: "participant",
      title: "UWU Hackathon 2026 Participant Registration",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-10-23T23:59:59+05:30",
      fields: createParticipantFields("uwu-hackathon-2026"),
    },
    ocForm: {
      id: "form-oc-hackathon",
      eventId: "evt-cs-hackathon",
      purpose: "oc",
      title: "UWU Hackathon 2026 Organizing Committee Recruitment",
      isEnabled: true,
      openAt: "2026-09-15T00:00:00+05:30",
      closeAt: "2026-10-20T23:59:59+05:30",
      fields: createOcFields("uwu-hackathon-2026"),
    },
  },
  {
    id: "evt-ras-roborace",
    slug: "roborace-challenge",
    unitId: "ras",
    title: "RoboRace Challenge",
    description:
      "Design and race autonomous line-following robots in the Robotics and Automation Society's annual competition.",
    cover: "/photos/events/ros-robot.jpg",
    day: "08",
    month: "NOV",
    year: "2026",
    time: "13:00 – 17:00",
    startTime: "2026-11-08T13:00:00+05:30",
    endTime: "2026-11-08T17:00:00+05:30",
    mode: "physical",
    venue: "Robotics Laboratory, Badulla",
    state: "published",
    capacityLimit: 80,
    sponsors: ["IEEE Sri Lanka Section", "Faculty of Science and Technology, UWU"],
    speaker: {
      name: "Dr. Anura Mendis",
      title: "Embedded systems lecturer and robotics mentor",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Anura has coached student robotics teams for eight years, from first line-followers to national finals.",
    },
    participantForm: {
      id: "form-part-roborace",
      eventId: "evt-ras-roborace",
      purpose: "participant",
      title: "RoboRace Challenge Competitor Registration",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-11-07T23:59:59+05:30",
      fields: createParticipantFields("roborace-challenge"),
    },
    ocForm: {
      id: "form-oc-roborace",
      eventId: "evt-ras-roborace",
      purpose: "oc",
      title: "RoboRace 2026 Organizing Committee Recruitment",
      isEnabled: true,
      openAt: "2026-09-20T00:00:00+05:30",
      closeAt: "2026-11-01T23:59:59+05:30",
      fields: createOcFields("roborace-challenge"),
    },
  },
  {
    id: "evt-wie-she-leads",
    slug: "she-leads-in-tech",
    unitId: "wie",
    title: "She Leads in Tech",
    description:
      "An evening of talks and mentoring with women engineers from Sri Lanka's leading tech companies.",
    cover: "/photos/events/cv-clinic.jpg",
    day: "22",
    month: "NOV",
    year: "2026",
    time: "16:00 – 19:00",
    startTime: "2026-11-22T16:00:00+05:30",
    endTime: "2026-11-22T19:00:00+05:30",
    mode: "hybrid",
    venue: "Main Auditorium · Zoom Livestream",
    state: "published",
    capacityLimit: 200,
    sponsors: ["IEEE Sri Lanka Section", "IEEE WIE Affinity Group, Sri Lanka"],
    speaker: {
      name: "Eng. Sanduni Fernando",
      title: "Software engineer and IEEE volunteer",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Sanduni works on payments infrastructure and has mentored first-generation students through their first internships.",
    },
    participantForm: {
      id: "form-part-sheleads",
      eventId: "evt-wie-she-leads",
      purpose: "participant",
      title: "She Leads in Tech Delegate Registration",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-11-21T23:59:59+05:30",
      fields: createParticipantFields("she-leads-in-tech"),
    },
    ocForm: {
      id: "form-oc-sheleads",
      eventId: "evt-wie-she-leads",
      purpose: "oc",
      title: "She Leads Organizing Committee Recruitment",
      isEnabled: false, // Closed window test
      openAt: "2026-09-01T00:00:00+05:30",
      closeAt: "2026-10-01T23:59:59+05:30",
      fields: createOcFields("she-leads-in-tech"),
    },
  },
  {
    id: "evt-ias-symposium",
    slug: "industrial-automation-symposium-2026",
    unitId: "ias",
    title: "Industrial Automation Symposium 2026",
    description:
      "Full-day technical symposium featuring PLC architecture, smart grid integration, and factory automation visits.",
    cover: "/photos/events/plc-panel.jpg",
    day: "05",
    month: "DEC",
    year: "2026",
    time: "09:00 – 16:30",
    startTime: "2026-12-05T09:00:00+05:30",
    endTime: "2026-12-05T16:30:00+05:30",
    mode: "physical",
    venue: "Auditorium Complex, Faculty of Technological Studies",
    state: "published",
    capacityLimit: 150,
    sponsors: ["IEEE Sri Lanka Section", "IEEE IAS Sri Lanka Chapter"],
    speaker: {
      name: "Dr. P. Jayasena",
      title: "Senior Lecturer in Mechatronics",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Dr. Jayasena conducts active research in industrial control loops and cyber-physical security.",
    },
    participantForm: {
      id: "form-part-ias",
      eventId: "evt-ias-symposium",
      purpose: "participant",
      title: "IAS Symposium 2026 Participant Registration",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-12-04T23:59:59+05:30",
      fields: createParticipantFields("industrial-automation-symposium-2026"),
    },
    ocForm: {
      id: "form-oc-ias",
      eventId: "evt-ias-symposium",
      purpose: "oc",
      title: "IAS Symposium OC Recruitment",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-11-25T23:59:59+05:30",
      fields: createOcFields("industrial-automation-symposium-2026"),
    },
  },
  {
    id: "evt-sb-congress",
    slug: "ieee-uwu-congress-2026",
    unitId: "sb",
    title: "IEEE UWU Congress 2026",
    description:
      "The flagship annual congregation of IEEE volunteers at Uva Wellassa University: chapter showcases, keynote addresses, and leadership awards.",
    cover: "/photos/events/hack-night.jpg",
    day: "19",
    month: "DEC",
    year: "2026",
    time: "08:30 – 18:00",
    startTime: "2026-12-19T08:30:00+05:30",
    endTime: "2026-12-19T18:00:00+05:30",
    mode: "physical",
    venue: "Main University Gymnasium & Convention Hall",
    state: "published",
    capacityLimit: 300,
    sponsors: ["IEEE Sri Lanka Section", "UWU Vice Chancellor's Office"],
    speaker: {
      name: "Kavindu Dimal",
      title: "Student Branch Chair 2025/2026",
      photo: "/photos/committee-placeholder.jpg",
      bio: "Opening keynote on university chapter growth and student technical impact across the Uva Province.",
    },
    participantForm: {
      id: "form-part-congress",
      eventId: "evt-sb-congress",
      purpose: "participant",
      title: "IEEE UWU Congress 2026 Delegate Registration",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-12-18T23:59:59+05:30",
      fields: createParticipantFields("ieee-uwu-congress-2026"),
    },
    ocForm: {
      id: "form-oc-congress",
      eventId: "evt-sb-congress",
      purpose: "oc",
      title: "IEEE UWU Congress 2026 Organizing Committee Recruitment",
      isEnabled: true,
      openAt: "2026-10-01T00:00:00+05:30",
      closeAt: "2026-12-01T23:59:59+05:30",
      fields: createOcFields("ieee-uwu-congress-2026"),
    },
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "sub-hack-0101",
    eventId: "evt-cs-hackathon",
    formId: "form-part-hackathon",
    purpose: "participant",
    referenceCode: "REG-HACK-0101",
    status: "valid",
    submittedAt: "2026-10-05T14:22:10+05:30",
    attendeeName: "Sanduni Wijerathna",
    attendeeEmail: "sanduni.w@std.uwu.ac.lk",
    studentRegNo: "UWU/CST/22/012",
    phone: "0771234567",
    qrToken: "QR-HACK-9821-SEC-A1",
    answers: {
      fullName: "Sanduni Wijerathna",
      studentRegNo: "UWU/CST/22/012",
      email: "sanduni.w@std.uwu.ac.lk",
      phone: "0771234567",
      faculty: "Faculty of Applied Sciences",
      trackPreference: "Software / AI Stream",
      tshirtSize: "M",
    },
  },
  {
    id: "sub-hack-0102",
    eventId: "evt-cs-hackathon",
    formId: "form-part-hackathon",
    purpose: "participant",
    referenceCode: "REG-HACK-0102",
    status: "valid",
    submittedAt: "2026-10-06T10:15:32+05:30",
    attendeeName: "Kavindu Lakshitha",
    attendeeEmail: "kavindu.l@std.uwu.ac.lk",
    studentRegNo: "UWU/CST/22/045",
    phone: "0714567890",
    qrToken: "QR-HACK-8812-SEC-B2",
    answers: {
      fullName: "Kavindu Lakshitha",
      studentRegNo: "UWU/CST/22/045",
      email: "kavindu.l@std.uwu.ac.lk",
      phone: "0714567890",
      faculty: "Faculty of Applied Sciences",
      trackPreference: "Software / AI Stream",
      tshirtSize: "L",
    },
  },
  {
    id: "sub-hack-0103",
    eventId: "evt-cs-hackathon",
    formId: "form-part-hackathon",
    purpose: "participant",
    referenceCode: "REG-HACK-0103",
    status: "valid",
    submittedAt: "2026-10-06T11:42:01+05:30",
    attendeeName: "Dilshan Wickramasinghe",
    attendeeEmail: "dilshan.w@std.uwu.ac.lk",
    studentRegNo: "UWU/SCT/23/078",
    phone: "0783456789",
    qrToken: "QR-HACK-7743-SEC-C3",
    answers: {
      fullName: "Dilshan Wickramasinghe",
      studentRegNo: "UWU/SCT/23/078",
      email: "dilshan.w@std.uwu.ac.lk",
      phone: "0783456789",
      faculty: "Faculty of Science & Technology",
      trackPreference: "Hardware & Embedded Systems",
      tshirtSize: "XL",
    },
  },
  {
    id: "sub-hack-0104",
    eventId: "evt-cs-hackathon",
    formId: "form-part-hackathon",
    purpose: "participant",
    referenceCode: "REG-HACK-0104",
    status: "valid",
    submittedAt: "2026-10-07T09:12:44+05:30",
    attendeeName: "Ayesha Nuwanthika",
    attendeeEmail: "ayesha.n@std.uwu.ac.lk",
    studentRegNo: "UWU/ENG/23/004",
    phone: "0702345678",
    qrToken: "QR-HACK-6625-SEC-D4",
    answers: {
      fullName: "Ayesha Nuwanthika",
      studentRegNo: "UWU/ENG/23/004",
      email: "ayesha.n@std.uwu.ac.lk",
      phone: "0702345678",
      faculty: "Faculty of Technological Studies",
      trackPreference: "Open Innovation",
      tshirtSize: "S",
    },
  },
  {
    id: "sub-hack-0105",
    eventId: "evt-cs-hackathon",
    formId: "form-part-hackathon",
    purpose: "participant",
    referenceCode: "REG-HACK-0105",
    status: "valid",
    submittedAt: "2026-10-07T16:55:18+05:30",
    attendeeName: "Malith Janaka",
    attendeeEmail: "malith.j@std.uwu.ac.lk",
    studentRegNo: "UWU/CST/21/089",
    phone: "0768901234",
    qrToken: "QR-HACK-5519-SEC-E5",
    answers: {
      fullName: "Malith Janaka",
      studentRegNo: "UWU/CST/21/089",
      email: "malith.j@std.uwu.ac.lk",
      phone: "0768901234",
      faculty: "Faculty of Applied Sciences",
      trackPreference: "Software / AI Stream",
      tshirtSize: "M",
    },
  },
  {
    id: "sub-hack-revoked-01",
    eventId: "evt-cs-hackathon",
    formId: "form-part-hackathon",
    purpose: "participant",
    referenceCode: "REG-HACK-REVOKED-99",
    status: "invalidated",
    submittedAt: "2026-10-07T18:00:00+05:30",
    attendeeName: "Praveen Jayawardena (Revoked Pass)",
    attendeeEmail: "praveen.j@std.uwu.ac.lk",
    studentRegNo: "UWU/CST/22/099",
    phone: "0770000000",
    qrToken: "QR-HACK-REVOKED-TEST-99",
    answers: {
      fullName: "Praveen Jayawardena",
      studentRegNo: "UWU/CST/22/099",
      email: "praveen.j@std.uwu.ac.lk",
      phone: "0770000000",
    },
  },
  // OC Submissions (Isolated from participant records, FR-OC-02)
  {
    id: "sub-oc-501",
    eventId: "evt-cs-hackathon",
    formId: "form-oc-hackathon",
    purpose: "oc",
    referenceCode: "OC-HACK-501",
    status: "valid",
    submittedAt: "2026-09-25T11:20:00+05:30",
    attendeeName: "Nuwan Bandara",
    attendeeEmail: "nuwan.b@std.uwu.ac.lk",
    studentRegNo: "UWU/CST/23/099",
    phone: "0775551122",
    answers: {
      fullName: "Nuwan Bandara",
      studentRegNo: "UWU/CST/23/099",
      email: "nuwan.b@std.uwu.ac.lk",
      phone: "0775551122",
      academicYear: "2nd Year",
      subTeams: "Media & Graphic Design",
      statement: "I have 2 years of Photoshop and Figma branding experience with campus clubs.",
      availability: "Full commitment (Preparations + Event Day)",
    },
  },
  {
    id: "sub-oc-502",
    eventId: "evt-cs-hackathon",
    formId: "form-oc-hackathon",
    purpose: "oc",
    referenceCode: "OC-HACK-502",
    status: "valid",
    submittedAt: "2026-09-26T15:40:12+05:30",
    attendeeName: "Hiruni Perera",
    attendeeEmail: "hiruni.p@std.uwu.ac.lk",
    studentRegNo: "UWU/SCT/22/015",
    phone: "0713334455",
    answers: {
      fullName: "Hiruni Perera",
      studentRegNo: "UWU/SCT/22/015",
      email: "hiruni.p@std.uwu.ac.lk",
      phone: "0713334455",
      academicYear: "3rd Year",
      subTeams: "Logistics & Venue Operations",
      statement: "Managed venue arrangements and hardware tables at RoboRace 2025.",
      availability: "Full commitment (Preparations + Event Day)",
    },
  },
];

// =============================================================================
// CLIENT-SIDE LOCAL STORAGE STORE & HELPER FUNCTIONS
// =============================================================================

const STORAGE_KEYS = {
  SUBMISSIONS: "ieee_srs_submissions_v1",
  EVENTS: "ieee_srs_events_v1",
  UNITS: "ieee_srs_units_v1",
  TERMS: "ieee_srs_terms_v1",
};

function safeGetStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

/** Get all submissions (merging hardcoded defaults with client storage) */
export function getStoredSubmissions(): Submission[] {
  return safeGetStorage<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
}

/** Save a new submission (e.g. from /events/[slug]/register or /apply-oc) */
export function saveSubmission(sub: Submission): void {
  const current = getStoredSubmissions();
  // Idempotency: prevent double submissions with same reference code (FR-REG-03, BR-08)
  if (current.some((s) => s.referenceCode === sub.referenceCode)) {
    return;
  }
  const updated = [sub, ...current];
  safeSetStorage(STORAGE_KEYS.SUBMISSIONS, updated);
}

/** Get all events */
export function getStoredEvents(): SrsEvent[] {
  return safeGetStorage<SrsEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
}

/** Get all units */
export function getStoredUnits(): OrganisationalUnit[] {
  return safeGetStorage<OrganisationalUnit[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS);
}

/** Get BOD terms */
export function getStoredBodTerms(): BodTerm[] {
  return safeGetStorage<BodTerm[]>(STORAGE_KEYS.TERMS, INITIAL_BOD_TERMS);
}

