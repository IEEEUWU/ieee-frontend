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

export type QrCredential = {
  id: string;
  submissionId: string;
  referenceCode: string;
  eventId: string;
  tokenHash: string;
  status: "active" | "revoked" | "replaced";
  issuedAt: string;
};

export type AttendanceCorrection = {
  id: string;
  actorUserId: string;
  actorName: string;
  reason: string;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  registrationId: string;
  referenceCode: string;
  eventId: string;
  attendeeName: string;
  scannedByUserId: string;
  scannedByUserName: string;
  scannedAt: string;
  method: "qr" | "manual";
  status: "attended" | "voided";
  corrections: AttendanceCorrection[];
};

export type AdminRole =
  | "sb_webmaster"
  | "unit_webmaster"
  | "sb_secretary"
  | "project_chair"
  | "attendance_operator";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: AdminRole;
  assignedUnitId?: SocietyId;
  assignedEventId?: string;
  status: "active" | "suspended";
  createdAt: string;
};

export type FeatureKey =
  | "unit.details.manage"
  | "unit.bod.manage"
  | "event.manage"
  | "event.publish"
  | "form.manage"
  | "registration.view"
  | "registration.export"
  | "oc.view"
  | "oc.export"
  | "oc.decide"
  | "attendance.scan"
  | "attendance.correct"
  | "account.manage"
  | "permission.manage"
  | "audit.view";

export type AccessGrant = {
  grantId: string;
  userId: string;
  userName: string;
  featureKey: FeatureKey;
  scopeType: "GLOBAL" | "UNIT" | "EVENT";
  scopeId: string;
  grantedBy: string;
  grantedAt: string;
  validUntil?: string;
  status: "active" | "revoked";
  revocationReason?: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorName: string;
  action: string;
  resourceType: "UNIT" | "EVENT" | "FORM" | "REGISTRATION" | "ATTENDANCE" | "GRANT";
  resourceId: string;
  details: string;
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

export const INITIAL_QR_CREDENTIALS: QrCredential[] = [
  {
    id: "qr-cred-1",
    submissionId: "sub-hack-0101",
    referenceCode: "REG-HACK-0101",
    eventId: "evt-cs-hackathon",
    tokenHash: "QR-HACK-9821-SEC-A1",
    status: "active",
    issuedAt: "2026-10-05T14:22:10+05:30",
  },
  {
    id: "qr-cred-2",
    submissionId: "sub-hack-0102",
    referenceCode: "REG-HACK-0102",
    eventId: "evt-cs-hackathon",
    tokenHash: "QR-HACK-8812-SEC-B2",
    status: "active",
    issuedAt: "2026-10-06T10:15:32+05:30",
  },
  {
    id: "qr-cred-3",
    submissionId: "sub-hack-0103",
    referenceCode: "REG-HACK-0103",
    eventId: "evt-cs-hackathon",
    tokenHash: "QR-HACK-7743-SEC-C3",
    status: "active",
    issuedAt: "2026-10-06T11:42:01+05:30",
  },
  {
    id: "qr-cred-4",
    submissionId: "sub-hack-0104",
    referenceCode: "REG-HACK-0104",
    eventId: "evt-cs-hackathon",
    tokenHash: "QR-HACK-6625-SEC-D4",
    status: "active",
    issuedAt: "2026-10-07T09:12:44+05:30",
  },
  {
    id: "qr-cred-5",
    submissionId: "sub-hack-0105",
    referenceCode: "REG-HACK-0105",
    eventId: "evt-cs-hackathon",
    tokenHash: "QR-HACK-5519-SEC-E5",
    status: "active",
    issuedAt: "2026-10-07T16:55:18+05:30",
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-rec-1",
    registrationId: "sub-hack-0101",
    referenceCode: "REG-HACK-0101",
    eventId: "evt-cs-hackathon",
    attendeeName: "Sanduni Wijerathna",
    scannedByUserId: "user-attendance-op",
    scannedByUserName: "P. Herath (Check-in Desk)",
    scannedAt: "2026-10-24T09:12:15+05:30",
    method: "qr",
    status: "attended",
    corrections: [],
  },
  {
    id: "att-rec-2",
    registrationId: "sub-hack-0104",
    referenceCode: "REG-HACK-0104",
    eventId: "evt-cs-hackathon",
    attendeeName: "Ayesha Nuwanthika",
    scannedByUserId: "user-attendance-op",
    scannedByUserName: "P. Herath (Check-in Desk)",
    scannedAt: "2026-10-24T09:35:40+05:30",
    method: "qr",
    status: "attended",
    corrections: [],
  },
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-sb-webmaster",
    name: "Kavindu Dimal",
    email: "webmaster@ieeeuwu.org",
    username: "sb_webmaster",
    role: "sb_webmaster",
    status: "active",
    createdAt: "2025-03-01T00:00:00+05:30",
  },
  {
    id: "user-cs-webmaster",
    name: "D. Amarasinghe",
    email: "cs.webmaster@ieeeuwu.org",
    username: "cs_webmaster",
    role: "unit_webmaster",
    assignedUnitId: "cs",
    status: "active",
    createdAt: "2025-03-01T00:00:00+05:30",
  },
  {
    id: "user-sb-secretary",
    name: "N. Gunasekara",
    email: "secretary@ieeeuwu.org",
    username: "sb_secretary",
    role: "sb_secretary",
    assignedUnitId: "sb",
    status: "active",
    createdAt: "2025-03-01T00:00:00+05:30",
  },
  {
    id: "user-project-chair",
    name: "S. Rathnayake",
    email: "hackathon.chair@ieeeuwu.org",
    username: "project_chair",
    role: "project_chair",
    assignedUnitId: "cs",
    assignedEventId: "evt-cs-hackathon",
    status: "active",
    createdAt: "2026-08-15T00:00:00+05:30",
  },
  {
    id: "user-attendance-op",
    name: "P. Herath",
    email: "checkin@ieeeuwu.org",
    username: "attendance_op",
    role: "attendance_operator",
    assignedUnitId: "cs",
    assignedEventId: "evt-cs-hackathon",
    status: "active",
    createdAt: "2026-10-20T00:00:00+05:30",
  },
];

export const INITIAL_ACCESS_GRANTS: AccessGrant[] = [
  {
    grantId: "grant-001",
    userId: "user-project-chair",
    userName: "S. Rathnayake",
    featureKey: "registration.view",
    scopeType: "EVENT",
    scopeId: "evt-cs-hackathon",
    grantedBy: "Kavindu Dimal (SB Webmaster)",
    grantedAt: "2026-09-01T10:00:00+05:30",
    status: "active",
  },
  {
    grantId: "grant-002",
    userId: "user-project-chair",
    userName: "S. Rathnayake",
    featureKey: "oc.view",
    scopeType: "EVENT",
    scopeId: "evt-cs-hackathon",
    grantedBy: "Kavindu Dimal (SB Webmaster)",
    grantedAt: "2026-09-01T10:00:00+05:30",
    status: "active",
  },
  {
    grantId: "grant-003",
    userId: "user-attendance-op",
    userName: "P. Herath",
    featureKey: "attendance.scan",
    scopeType: "EVENT",
    scopeId: "evt-cs-hackathon",
    grantedBy: "Kavindu Dimal (SB Webmaster)",
    grantedAt: "2026-10-20T11:30:00+05:30",
    status: "active",
  },
  {
    grantId: "grant-004",
    userId: "user-attendance-op",
    userName: "P. Herath",
    featureKey: "attendance.correct",
    scopeType: "EVENT",
    scopeId: "evt-cs-hackathon",
    grantedBy: "Kavindu Dimal (SB Webmaster)",
    grantedAt: "2026-10-20T11:30:00+05:30",
    status: "active",
  },
  {
    grantId: "grant-005",
    userId: "user-cs-webmaster",
    userName: "D. Amarasinghe",
    featureKey: "registration.view",
    scopeType: "UNIT",
    scopeId: "cs",
    grantedBy: "Kavindu Dimal (SB Webmaster)",
    grantedAt: "2025-03-01T00:00:00+05:30",
    status: "active",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-10-01T00:00:00+05:30",
    actorUserId: "user-sb-webmaster",
    actorName: "Kavindu Dimal",
    action: "EVENT_PUBLISHED",
    resourceType: "EVENT",
    resourceId: "evt-cs-hackathon",
    details: "Published UWU Hackathon 2026 and opened participant registration window.",
  },
  {
    id: "aud-002",
    timestamp: "2026-10-20T11:30:00+05:30",
    actorUserId: "user-sb-webmaster",
    actorName: "Kavindu Dimal",
    action: "GRANT_ISSUED",
    resourceType: "GRANT",
    resourceId: "grant-003",
    details: "Granted attendance.scan rights on evt-cs-hackathon to P. Herath (user-attendance-op).",
  },
  {
    id: "aud-003",
    timestamp: "2026-10-24T09:12:15+05:30",
    actorUserId: "user-attendance-op",
    actorName: "P. Herath",
    action: "ATTENDANCE_CHECKIN",
    resourceType: "ATTENDANCE",
    resourceId: "att-rec-1",
    details: "Successful QR scan check-in for attendee Sanduni Wijerathna (REG-HACK-0101).",
  },
];

// =============================================================================
// CLIENT-SIDE LOCAL STORAGE STORE & HELPER FUNCTIONS
// =============================================================================

const STORAGE_KEYS = {
  SUBMISSIONS: "ieee_srs_submissions_v1",
  ATTENDANCE: "ieee_srs_attendance_v1",
  EVENTS: "ieee_srs_events_v1",
  UNITS: "ieee_srs_units_v1",
  TERMS: "ieee_srs_terms_v1",
  USERS: "ieee_srs_users_v1",
  GRANTS: "ieee_srs_grants_v1",
  AUDIT: "ieee_srs_audit_v1",
  ACTIVE_USER_ID: "ieee_srs_active_user_id_v1",
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

  // Add audit log
  addAuditLog({
    actorUserId: "public-student",
    actorName: "Anonymous Student",
    action: sub.purpose === "participant" ? "PARTICIPANT_REGISTERED" : "OC_APPLICATION_SUBMITTED",
    resourceType: "REGISTRATION",
    resourceId: sub.referenceCode,
    details: `${sub.purpose.toUpperCase()} form submitted by ${sub.attendeeName} (${sub.referenceCode}).`,
  });
}

/** Get all attendance records */
export function getStoredAttendance(): AttendanceRecord[] {
  return safeGetStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
}

/** Check in attendee (FR-QR-04 to FR-QR-10) */
export function recordAttendanceCheckIn(
  eventId: string,
  tokenOrRef: string,
  operator: AdminUser,
  method: "qr" | "manual" = "qr",
): {
  success: boolean;
  code:
    | "VALID"
    | "ALREADY_CHECKED_IN"
    | "INVALID_PASS"
    | "WRONG_EVENT"
    | "UNAUTHORIZED"
    | "EVENT_CANCELLED"
    | "INVALIDATED";
  message: string;
  record?: AttendanceRecord;
  priorRecord?: AttendanceRecord;
} {
  // Permission gate (FR-QR-04, AT-15)
  if (
    operator.role !== "sb_webmaster" &&
    !hasPermission(operator, "attendance.scan", "EVENT", eventId)
  ) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Operator lacks attendance.scan permission for this event.",
    };
  }

  // Event validation: cancellations disable scanning (FR-EVT-08, FR-QR-05, AT-12)
  const event = getStoredEvents().find((e) => e.id === eventId);
  if (event && event.state === "cancelled") {
    return {
      success: false,
      code: "EVENT_CANCELLED",
      message: "This event has been cancelled. Attendance check-in is disabled (FR-EVT-08).",
    };
  }

  const submissions = getStoredSubmissions();
  // Match by QR token or Registration Reference
  const sub = submissions.find(
    (s) =>
      s.purpose === "participant" &&
      (s.qrToken === tokenOrRef || s.referenceCode === tokenOrRef.toUpperCase().trim()),
  );

  if (!sub) {
    return {
      success: false,
      code: "INVALID_PASS",
      message: "No registered participant pass found for this barcode / reference.",
    };
  }

  // Invalidation / Revocation Check (FR-QR-05, FR-RESP-06, AT-15, AT-16)
  if (sub.status === "invalidated") {
    return {
      success: false,
      code: "INVALIDATED",
      message: "This registration pass has been revoked or invalidated by administration (FR-RESP-06).",
    };
  }

  // Event match check (FR-QR-05, AT-13)
  if (sub.eventId !== eventId) {
    return {
      success: false,
      code: "WRONG_EVENT",
      message: "This pass was issued for a different event and is invalid here.",
    };
  }

  const attendanceList = getStoredAttendance();
  const existing = attendanceList.find(
    (a) => a.registrationId === sub.id && a.eventId === eventId && a.status === "attended",
  );

  // Duplicate scan check (FR-QR-07, AT-14, BR-18)
  if (existing) {
    return {
      success: false,
      code: "ALREADY_CHECKED_IN",
      message: `Already checked in at ${new Date(existing.scannedAt).toLocaleTimeString()} by ${existing.scannedByUserName}.`,
      priorRecord: existing,
    };
  }

  const newRecord: AttendanceRecord = {
    id: `att-rec-${Date.now()}`,
    registrationId: sub.id,
    referenceCode: sub.referenceCode,
    eventId: eventId,
    attendeeName: sub.attendeeName,
    scannedByUserId: operator.id,
    scannedByUserName: operator.name,
    scannedAt: new Date().toISOString(),
    method: method,
    status: "attended",
    corrections: [],
  };

  const updated = [newRecord, ...attendanceList];
  safeSetStorage(STORAGE_KEYS.ATTENDANCE, updated);

  addAuditLog({
    actorUserId: operator.id,
    actorName: operator.name,
    action: "ATTENDANCE_CHECKIN",
    resourceType: "ATTENDANCE",
    resourceId: newRecord.id,
    details: `${method.toUpperCase()} check-in for ${sub.attendeeName} (${sub.referenceCode}).`,
  });

  return {
    success: true,
    code: "VALID",
    message: `Check-in recorded successfully for ${sub.attendeeName}.`,
    record: newRecord,
  };
}

/** Revoke old QR token and reissue new token while preserving attendance status (FR-QR-11, AT-16) */
export function reissueQrToken(
  submissionId: string,
  actor: AdminUser,
): { success: boolean; newQrToken?: string; message: string } {
  if (actor.role !== "sb_webmaster") {
    return {
      success: false,
      message: "Only SB Webmaster can revoke and reissue QR credentials (FR-QR-11).",
    };
  }

  const submissions = getStoredSubmissions();
  const subIdx = submissions.findIndex((s) => s.id === submissionId);
  if (subIdx === -1) {
    return { success: false, message: "Submission not found." };
  }

  const sub = submissions[subIdx];
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newQrToken = `QR-${sub.referenceCode.replace("REG-", "")}-REISSUE-${randomSuffix}-SEC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  submissions[subIdx] = {
    ...sub,
    qrToken: newQrToken,
  };
  safeSetStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

  addAuditLog({
    actorUserId: actor.id,
    actorName: actor.name,
    action: "QR_TOKEN_REISSUED",
    resourceType: "REGISTRATION",
    resourceId: sub.referenceCode,
    details: `Reissued QR token for ${sub.attendeeName} (${sub.referenceCode}). New token: ${newQrToken}.`,
  });

  return { success: true, newQrToken, message: "QR token reissued successfully." };
}

/** Invalidate or restore registration pass with audit logging (FR-RESP-06, AT-15) */
export function setSubmissionStatus(
  submissionId: string,
  status: "valid" | "invalidated",
  actor: AdminUser,
  reason?: string,
): void {
  const submissions = getStoredSubmissions();
  const subIdx = submissions.findIndex((s) => s.id === submissionId);
  if (subIdx === -1) return;

  const sub = submissions[subIdx];
  submissions[subIdx] = { ...sub, status };
  safeSetStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

  addAuditLog({
    actorUserId: actor.id,
    actorName: actor.name,
    action: status === "invalidated" ? "REGISTRATION_REVOKED" : "REGISTRATION_RESTORED",
    resourceType: "REGISTRATION",
    resourceId: sub.referenceCode,
    details: `${status.toUpperCase()} status set for ${sub.attendeeName} (${sub.referenceCode}). Reason: ${reason || "Administrative review"}`,
  });
}

/** Correct attendance record (FR-QR-12, AT-18) */
export function correctAttendanceRecord(
  attendanceId: string,
  newStatus: "attended" | "voided",
  reason: string,
  actor: AdminUser,
): boolean {
  if (!reason.trim()) return false;
  const list = getStoredAttendance();
  const idx = list.findIndex((a) => a.id === attendanceId);
  if (idx === -1) return false;

  const current = list[idx];
  const oldStatus = current.status;
  const correction: AttendanceCorrection = {
    id: `corr-${Date.now()}`,
    actorUserId: actor.id,
    actorName: actor.name,
    reason,
    oldStatus,
    newStatus,
    createdAt: new Date().toISOString(),
  };

  list[idx] = {
    ...current,
    status: newStatus,
    corrections: [correction, ...current.corrections],
  };

  safeSetStorage(STORAGE_KEYS.ATTENDANCE, list);

  addAuditLog({
    actorUserId: actor.id,
    actorName: actor.name,
    action: "ATTENDANCE_CORRECTED",
    resourceType: "ATTENDANCE",
    resourceId: attendanceId,
    details: `Status altered from ${oldStatus} to ${newStatus}. Reason: ${reason}`,
  });

  return true;
}

/** Get all events */
export function getStoredEvents(): SrsEvent[] {
  return safeGetStorage<SrsEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
}

/** Update event state or form schedule (FR-EVT-01, FR-FORM-03) */
export function updateEvent(updatedEvent: SrsEvent, actor: AdminUser): void {
  const events = getStoredEvents();
  const idx = events.findIndex((e) => e.id === updatedEvent.id);
  if (idx !== -1) {
    events[idx] = updatedEvent;
  } else {
    events.push(updatedEvent);
  }
  safeSetStorage(STORAGE_KEYS.EVENTS, events);

  addAuditLog({
    actorUserId: actor.id,
    actorName: actor.name,
    action: "EVENT_UPDATED",
    resourceType: "EVENT",
    resourceId: updatedEvent.id,
    details: `Updated event: ${updatedEvent.title} (Status: ${updatedEvent.state}).`,
  });
}

/** Get all units */
export function getStoredUnits(): OrganisationalUnit[] {
  return safeGetStorage<OrganisationalUnit[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS);
}

/** Update unit details (FR-UNIT-01) */
export function updateUnit(updatedUnit: OrganisationalUnit, actor: AdminUser): void {
  const units = getStoredUnits();
  const idx = units.findIndex((u) => u.id === updatedUnit.id);
  if (idx !== -1) {
    units[idx] = updatedUnit;
    safeSetStorage(STORAGE_KEYS.UNITS, units);

    addAuditLog({
      actorUserId: actor.id,
      actorName: actor.name,
      action: "UNIT_UPDATED",
      resourceType: "UNIT",
      resourceId: updatedUnit.id,
      details: `Updated unit profile: ${updatedUnit.name}`,
    });
  }
}

/** Get BOD terms */
export function getStoredBodTerms(): BodTerm[] {
  return safeGetStorage<BodTerm[]>(STORAGE_KEYS.TERMS, INITIAL_BOD_TERMS);
}

/** Save BOD term handover or edit (FR-BOD-05, AT-19) */
export function saveBodTerm(term: BodTerm, actor: AdminUser): void {
  const terms = getStoredBodTerms();
  const idx = terms.findIndex((t) => t.id === term.id);
  if (idx !== -1) {
    terms[idx] = term;
  } else {
    terms.push(term);
  }
  safeSetStorage(STORAGE_KEYS.TERMS, terms);

  addAuditLog({
    actorUserId: actor.id,
    actorName: actor.name,
    action: "BOD_TERM_SAVED",
    resourceType: "UNIT",
    resourceId: term.unitId,
    details: `Updated term ${term.termLabel} for ${term.unitId}. Status: ${term.state}.`,
  });
}

/** Get Access Grants */
export function getStoredGrants(): AccessGrant[] {
  return safeGetStorage<AccessGrant[]>(STORAGE_KEYS.GRANTS, INITIAL_ACCESS_GRANTS);
}

/** Add Access Grant (FR-AUTH-04, FR-AUTH-05) */
export function addAccessGrant(grant: Omit<AccessGrant, "grantId" | "grantedAt" | "status">, actor: AdminUser): void {
  const grants = getStoredGrants();
  const newGrant: AccessGrant = {
    ...grant,
    grantId: `grant-${Date.now()}`,
    grantedAt: new Date().toISOString(),
    status: "active",
  };
  const updated = [newGrant, ...grants];
  safeSetStorage(STORAGE_KEYS.GRANTS, updated);

  addAuditLog({
    actorUserId: actor.id,
    actorName: actor.name,
    action: "GRANT_CREATED",
    resourceType: "GRANT",
    resourceId: newGrant.grantId,
    details: `Granted ${grant.featureKey} on ${grant.scopeType}:${grant.scopeId} to ${grant.userName}.`,
  });
}

/** Revoke Access Grant (FR-AUTH-09) */
export function revokeAccessGrant(grantId: string, reason: string, actor: AdminUser): void {
  const grants = getStoredGrants();
  const idx = grants.findIndex((g) => g.grantId === grantId);
  if (idx !== -1) {
    grants[idx] = {
      ...grants[idx],
      status: "revoked",
      revocationReason: reason,
    };
    safeSetStorage(STORAGE_KEYS.GRANTS, grants);

    addAuditLog({
      actorUserId: actor.id,
      actorName: actor.name,
      action: "GRANT_REVOKED",
      resourceType: "GRANT",
      resourceId: grantId,
      details: `Revoked grant ${grantId}. Reason: ${reason}`,
    });
  }
}

/** Get Audit Logs */
export function getStoredAuditLogs(): AuditLogEntry[] {
  return safeGetStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
}

export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const logs = getStoredAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  safeSetStorage(STORAGE_KEYS.AUDIT, [newEntry, ...logs]);
}

/** Active User / Role Switcher (FR-ACC-01, FR-ADM-01) */
export function getActiveUser(): AdminUser {
  const users = safeGetStorage<AdminUser[]>(STORAGE_KEYS.USERS, INITIAL_ADMIN_USERS);
  const activeId = safeGetStorage<string>(STORAGE_KEYS.ACTIVE_USER_ID, "user-sb-webmaster");
  return users.find((u) => u.id === activeId) ?? users[0];
}

export const USER_CHANGE_EVENT = "ieee-admin-user-change";

export function setActiveUser(userId: string): void {
  safeSetStorage(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(USER_CHANGE_EVENT, { detail: userId }));
  }
}

/** Check if user has permission for a specific feature and resource scope */
export function hasPermission(
  user: AdminUser,
  feature: FeatureKey,
  scopeType: "GLOBAL" | "UNIT" | "EVENT",
  scopeId: string,
): boolean {
  // SB Webmaster has global administrative rights (FR-AUTH-01, Baseline Matrix)
  if (user.role === "sb_webmaster") return true;

  // SB Secretary has global read rights on registrations and OC (FR-AUTH-03, Baseline Matrix)
  if (user.role === "sb_secretary") {
    if (feature === "registration.view" || feature === "oc.view") return true;
    if (feature === "audit.view") return true;
  }

  // Unit Webmaster default permissions scoped to assigned unit (FR-AUTH-02)
  if (user.role === "unit_webmaster") {
    const isTargetUnit =
      (scopeType === "UNIT" && scopeId === user.assignedUnitId) ||
      (scopeType === "EVENT" && getStoredEvents().find((e) => e.id === scopeId)?.unitId === user.assignedUnitId);

    if (isTargetUnit) {
      if (
        feature === "unit.details.manage" ||
        feature === "unit.bod.manage" ||
        feature === "event.manage" ||
        feature === "event.publish" ||
        feature === "form.manage"
      ) {
        return true;
      }
    }
  }

  // Explicit grants check from Access Grants table (FR-AUTH-04, FR-AUTH-05)
  const grants = getStoredGrants().filter((g) => g.userId === user.id && g.status === "active");
  for (const g of grants) {
    if (g.featureKey === feature) {
      if (g.scopeType === "GLOBAL") return true;
      if (g.scopeType === scopeType && g.scopeId === scopeId) return true;
      if (g.scopeType === "UNIT" && scopeType === "EVENT") {
        const evt = getStoredEvents().find((e) => e.id === scopeId);
        if (evt && evt.unitId === g.scopeId) return true;
      }
    }
  }

  return false;
}

/**
 * Formula Injection CSV Sanitizer (FR-RESP-04, NFR-SEC-04)
 * Escapes characters that Excel or Google Sheets could interpret as dynamic formulas:
 * '=', '+', '-', '@'
 */
export function sanitizeForCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  // If string starts with formula trigger characters, prepend apostrophe
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  // Escape double quotes and enclose in quotes if comma or newline is present
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
