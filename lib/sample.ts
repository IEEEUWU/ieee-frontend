/**
 * Sample-data switch.
 *
 * The events register and the committee roster are both seeded with plausible
 * records so the page can be reviewed and demonstrated in a full state. None of
 * it has been supplied by the branch.
 *
 * This file is the whole mechanism. When real records replace the samples:
 *
 *   1. replace the arrays in `lib/events.ts` and `lib/team.ts`
 *   2. set `SAMPLE_DATA` to `false`
 *
 * Step two is the one that matters, and it is why the flag exists rather than a
 * comment nobody re-reads. While it is `true`, every section holding sample
 * records renders a visible notice, so a page that still carries placeholder
 * content cannot be mistaken for a published one. Flipping it to `false` removes
 * those notices and leaves the data untouched.
 *
 * Nothing else in the codebase reads this file, which is the point: the decision
 * is made in one place and cannot drift between sections.
 */
export const SAMPLE_DATA = true;

/** Notice shown by any section currently rendering sample records. */
export const sampleNotice = {
  label: "Sample data",
  body: "These records are placeholders for review, not branch records. They are replaced before anything is published.",
} as const;