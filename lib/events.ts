import { photos, type Photo } from "@/lib/photos";
import type { SocietyId } from "@/lib/units";

/**
 * The events record.
 *
 * Two separate things live here, and keeping them apart is the point.
 *
 * `publishedEvents` is dated, verifiable, public. `programmes` is structural and
 * needs no verification: society sessions, committee meetings and Section
 * programmes are how a student branch is constituted, not claims about a
 * particular afternoon. So the programmes publish truthfully with no date
 * attached, and only the dated register depends on the branch confirming
 * something.
 *
 * The dated register below is currently seeded with sample records. See
 * `lib/sample.ts` for how to swap them out and for why the notice is rendered
 * from a single flag rather than a comment.
 */

export type PublicEvent = {
  id: string;
  title: string;
  /** ISO 8601 calendar date, rendered with tabular figures. */
  date: string;
  societyId: SocietyId;
  location: string;
  /** One line on what attending involves. Optional: omit rather than pad. */
  note?: string;
  /**
   * The gallery plate.
   *
   * Required rather than optional. A gallery that silently drops a frame when a
   * record has no image is worse than a text list, because the gap is invisible
   * in the data and only shows up as a hole in the page. Making it required
   * means a new record cannot be added half-wired.
   *
   * A `Photo` rather than a path, so alt text lives in the photography manifest
   * with the rest of it and cannot drift out of step with the licence record.
   */
  photo: Photo;
};

/**
 * Public events repository.
 *
 * Add a verified record and the register renders it, the headline rewrites
 * itself, and the empty state retires with no other change.
 */
export const publishedEvents: readonly PublicEvent[] = [
  {
    id: "sample-plc",
    title: "Intro to PLC Programming",
    date: "2026-11-14",
    societyId: "ias",
    location: "Engineering Faculty, control systems lab",
    note: "A first session for members who have never written a ladder diagram. Laptops provided, no prior programming assumed.",
    photo: photos.eventPlc,
  },
  {
    id: "sample-vision",
    title: "Computer Vision Build Night",
    date: "2026-12-05",
    societyId: "cs",
    location: "Faculty of Computing, project room",
    note: "Pairs form up and work through a small detection problem end to end, from dataset to a running model.",
    photo: photos.eventVision,
  },
  {
    id: "sample-cv-clinic",
    title: "CV and Interview Clinic",
    date: "2027-01-24",
    societyId: "wie",
    location: "IEEE Room, Engineering Faculty",
    note: "Open to any undergraduate on campus. Bring a CV on a device; leave with one that has been read by someone who has marked them.",
    photo: photos.eventClinic,
  },
  {
    id: "sample-ros",
    title: "ROS 2 Navigation Workshop",
    date: "2027-02-21",
    societyId: "ras",
    location: "Robotics and Automation Lab",
    note: "A full day on building and debugging a navigation stack. Bring a laptop with Ubuntu installed.",
    photo: photos.eventRobot,
  },
  {
    id: "sample-hack-night",
    title: "Branch Hack Night",
    date: "2027-03-13",
    societyId: "sb",
    location: "Faculty of Computing, project room",
    note: "All five societies in one room. Open to guests, and no society membership is needed to take part.",
    photo: photos.eventCircuit,
  },
];

/** Recurring, non-dated activity. Constitution, not calendar. */
export const programmes = [
  {
    id: "sessions",
    title: "Society sessions",
    body: "Each chartered society runs its own technical sessions. They are member sessions first and open to guests where the society allows it.",
    /** Who owns the programme. */
    ownedBy: "Society officers",
  },
  {
    id: "committee",
    title: "Committee meetings",
    body: "The five societies report into one committee. That calendar is what keeps the branch operating as a single organisation.",
    ownedBy: "Branch committee",
  },
  {
    id: "section",
    title: "Section programmes",
    body: "Activities run under the IEEE Sri Lanka Section charter, in Region 10, alongside every other branch in the Section.",
    ownedBy: "IEEE Sri Lanka Section",
  },
] as const;

/**
 * Events by ISO date, newest first.
 *
 * Sorted once at module scope rather than in the component. The register is
 * read-only, so recomputing the order on every render would be work for no
 * reason, and doing the sort here means the section never has to know that the
 * underlying array is unordered.
 */
export const eventsByDateDesc = [...publishedEvents].sort((a, b) =>
  b.date.localeCompare(a.date),
);