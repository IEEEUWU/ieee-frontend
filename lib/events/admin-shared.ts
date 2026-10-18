import { CHAPTERS, parseEventPage, parsePublicEvent } from "./shared";

export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED", "ARCHIVED"] as const;
export const EVENT_MODES = ["PHYSICAL", "ONLINE", "HYBRID"] as const;
export type AdminEvent = Omit<ReturnType<typeof parsePublicEvent>, "status"> & { status: typeof EVENT_STATUSES[number] };
export type CreateEvent = {
  title: string; chapter: string; description: string | null; cover_image?: string | null;
  start_date: string; end_date: string; mode: typeof EVENT_MODES[number]; venue: string | null;
  contact_email: string | null; contact_phone: string | null; status: "DRAFT" | "PUBLISHED";
  max_participants: number | null; is_registration_open: boolean; is_oc_open: boolean;
};
export class EventValidationError extends Error {
  constructor(public fields: Record<string, string>) { super(Object.values(fields)[0] ?? "Check the event details."); }
}
export function validateCreateEvent(input: unknown): CreateEvent {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new EventValidationError({ title: "Enter the event details." });
  const value = input as Record<string, unknown>;
  const fields: Record<string, string> = {};
  const text = (key: string, maximum: number, required = false) => {
    const item = value[key];
    if (item == null && !required) return null;
    if (typeof item !== "string") { fields[key] = "Enter a valid text value."; return null; }
    const trimmed = item.trim();
    if ((required && !trimmed) || trimmed.length > maximum) fields[key] = required ? `Enter ${key === "title" ? "a title" : key} (up to ${maximum} characters).` : `Use ${maximum} characters or fewer.`;
    return trimmed || null;
  };
  const title = text("title", 255, true);
  const description = text("description", 20000);
  const cover_image = text("cover_image", 255);
  const venue = text("venue", 255);
  const contact_email = text("contact_email", 255);
  const contact_phone = text("contact_phone", 50);
  if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) fields.contact_email = "Enter a valid email address.";
  if (cover_image) {
    try {
      if (cover_image.startsWith("//") || cover_image.includes("\\") || /^(?:\/?storage\/)?\/?events\/covers\//i.test(cover_image)) throw new Error();
      if (!cover_image.startsWith("/")) {
        const url = new URL(cover_image);
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error();
      }
    } catch { fields.cover_image = "Enter an HTTP(S) image URL or a path starting with /."; }
  }
  if (!CHAPTERS.includes(value.chapter as typeof CHAPTERS[number])) fields.chapter = "Choose a chapter.";
  if (!EVENT_MODES.includes(value.mode as typeof EVENT_MODES[number])) fields.mode = "Choose an event mode.";
  const status = value.status ?? "DRAFT";
  if (status !== "DRAFT" && status !== "PUBLISHED") fields.status = "Choose Draft or Published.";
  const dates: Record<string, string> = {};
  for (const key of ["start_date", "end_date"]) {
    const item = value[key];
    if (typeof item !== "string" || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(item) || !Number.isFinite(Date.parse(item)) || !Number.isFinite(Date.parse(`${item.slice(0, 10)}T00:00:00Z`)) || new Date(`${item.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== item.slice(0, 10)) fields[key] = "Enter a valid date and time with a timezone.";
    else dates[key] = new Date(item).toISOString();
  }
  if (dates.start_date && dates.end_date && dates.end_date < dates.start_date) fields.end_date = "End date must be on or after the start date.";
  const max_participants = value.max_participants ?? null;
  if (max_participants !== null && (typeof max_participants !== "number" || !Number.isSafeInteger(max_participants) || max_participants < 1)) fields.max_participants = "Enter a whole number of at least 1, or leave blank.";
  for (const key of ["is_registration_open", "is_oc_open"]) if (value[key] !== undefined && typeof value[key] !== "boolean") fields[key] = "Choose an open or closed state.";
  if (Object.keys(fields).length) throw new EventValidationError(fields);
  return { title: title!, chapter: value.chapter as string, description, ...(Object.hasOwn(value, "cover_image") ? { cover_image } : {}), start_date: dates.start_date, end_date: dates.end_date, mode: value.mode as CreateEvent["mode"], venue, contact_email, contact_phone, status: status as CreateEvent["status"], max_participants: max_participants as number | null, is_registration_open: value.is_registration_open === true, is_oc_open: value.is_oc_open === true };
}
export function validateUpdateEvent(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new EventValidationError({ title: "Enter valid event details." });
  const value = input as Record<string, unknown>;
  if (Object.hasOwn(value, "status")) throw new EventValidationError({ status: "Change publication status separately from event details." });
  if (Object.hasOwn(value, "start_date") !== Object.hasOwn(value, "end_date")) throw new EventValidationError({ end_date: "Send both start and end dates together." });
  const checked = validateCreateEvent({ title: "Event", chapter: "SB", start_date: "2000-01-01T00:00:00Z", end_date: "2000-01-01T00:00:00Z", mode: "PHYSICAL", ...value });
  return Object.fromEntries(Object.entries(checked).filter(([key]) => key !== "status" && Object.hasOwn(value, key)));
}
export function colomboDateInput(value: string) { return new Date(Date.parse(value) + 330 * 60000).toISOString().slice(0, 16); }
export function colomboInputToUTC(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return "";
  const timestamp = Date.parse(`${value}:00+05:30`);
  if (!Number.isFinite(timestamp)) return "";
  // Reject normalized impossible calendar dates, such as February 31.
  if (new Date(timestamp + 330 * 60000).toISOString().slice(0, 16) !== value) return "";
  return new Date(timestamp).toISOString();
}
export function parseAdminEvent(input: unknown): AdminEvent {
  if (!input || typeof input !== "object") throw new Error("Invalid event response.");
  const value = input as Record<string, unknown>;
  if (!EVENT_STATUSES.includes(value.status as AdminEvent["status"])) throw new Error("Invalid event status.");
  return { ...parsePublicEvent({ ...value, status: "PUBLISHED" }), status: value.status as AdminEvent["status"] };
}
export function parseAdminEventPage(input: unknown, page: number) {
  if (!input || typeof input !== "object" || !("data" in input) || !Array.isArray(input.data)) throw new Error("Invalid event catalogue.");
  const metadata = parseEventPage({ ...input, data: [] }, page);
  return { ...metadata, data: input.data.map(parseAdminEvent) };
}
