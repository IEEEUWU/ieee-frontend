export const CHAPTERS = ["SB", "CS", "IAS", "RAS", "WIE"] as const;
export const TIMEFRAMES = ["upcoming", "ongoing", "past", "all"] as const;
export type EventFilters = { chapter: string; timeframe: string; search: string; page: number; per_page: number };
export type PublicEvent = {
  id: number; slug: string; title: string; description: string | null; chapter: string;
  cover_image: string | null; cover_image_url?: string | null; start_date: string; end_date: string;
  mode: "PHYSICAL" | "ONLINE" | "HYBRID"; venue: string | null;
  contact_email: string | null; contact_phone: string | null;
  status: "PUBLISHED"; is_registration_open: boolean; is_oc_open: boolean; max_participants: number | null;
};
export type EventPage = { data: PublicEvent[]; current_page: number; last_page: number; total: number; per_page: number; from: number | null; to: number | null };
export function eventFilters(input: Record<string, string | string[] | undefined>): EventFilters {
  const single = (key: string, fallback = "") => {
    const value = input[key];
    if (Array.isArray(value)) throw new Error("Use one value per event filter.");
    return value?.trim() || fallback;
  };
  const integer = (key: string, fallback: number, maximum: number) => {
    const value = single(key, String(fallback));
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > maximum) throw new Error("Choose a valid page and page size.");
    return Number(value);
  };
  const chapter = single("chapter").toUpperCase();
  const timeframe = single("timeframe", "upcoming");
  const search = single("search");
  if (chapter && !CHAPTERS.some((value) => value === chapter)) throw new Error("Choose a valid chapter.");
  if (!TIMEFRAMES.some((value) => value === timeframe)) throw new Error("Choose a valid event timeframe.");
  if (search.length > 255) throw new Error("Search must be 255 characters or fewer.");
  return { chapter, timeframe, search, page: integer("page", 1, Number.MAX_SAFE_INTEGER), per_page: integer("per_page", 12, 48) };
}
export function eventQuery(filters: EventFilters): string {
  const query = new URLSearchParams({ timeframe: filters.timeframe, page: String(filters.page), per_page: String(filters.per_page) });
  if (filters.chapter) query.set("chapter", filters.chapter);
  if (filters.search) query.set("search", filters.search);
  return query.toString();
}
export function parsePublicEvent(input: unknown): PublicEvent {
  if (!input || typeof input !== "object") throw new Error("Invalid event response.");
  const value = input as Record<string, unknown>;
  if (value.cover_image_url !== undefined && value.cover_image_url !== null && typeof value.cover_image_url !== "string") throw new Error("Invalid cover image URL.");
  const nullableStrings = ["description", "cover_image", "venue", "contact_email", "contact_phone"];
  const date = (item: unknown): item is string => typeof item === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(item) && Number.isFinite(Date.parse(item));
  if (!Number.isSafeInteger(value.id) || Number(value.id) < 1 || typeof value.slug !== "string" || !value.slug.trim() || /[/?#\\]/.test(value.slug) || typeof value.title !== "string" || !value.title.trim() || !CHAPTERS.includes(value.chapter as typeof CHAPTERS[number]) || value.status !== "PUBLISHED" || !["PHYSICAL", "ONLINE", "HYBRID"].includes(String(value.mode)) || !date(value.start_date) || !date(value.end_date) || Date.parse(value.end_date) < Date.parse(value.start_date) || nullableStrings.some((key) => value[key] !== null && typeof value[key] !== "string") || typeof value.is_registration_open !== "boolean" || typeof value.is_oc_open !== "boolean" || !(value.max_participants === null || (Number.isSafeInteger(value.max_participants) && Number(value.max_participants) > 0))) throw new Error("Invalid event response.");
  return value as PublicEvent;
}
export function parseEventPage(input: unknown, requestedPage: number): EventPage {
  if (!input || typeof input !== "object") throw new Error("Invalid event catalogue.");
  const value = input as Record<string, unknown>;
  const integer = (item: unknown, minimum: number) => typeof item === "number" && Number.isSafeInteger(item) && item >= minimum;
  if (!Array.isArray(value.data) || value.current_page !== requestedPage || !integer(value.last_page, 1) || !integer(value.total, 0) || !integer(value.per_page, 1) || !(value.from === null || integer(value.from, 1)) || !(value.to === null || integer(value.to, 1))) throw new Error("Invalid event catalogue.");
  return { ...value, data: value.data.map(parsePublicEvent) } as EventPage;
}
export function eventCover(value: string | null, apiBase: string): string {
  if (!value?.trim()) return "/photos/robotics-arm.jpg";
  try {
    if (value.startsWith("//") || value.includes("\\")) throw new Error();
    const url = new URL(value, new URL(apiBase).origin + "/");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.toString();
  } catch { return "/photos/robotics-arm.jpg"; }
}
export function eventCard(event: PublicEvent, cover: string) {
  const date = new Date(event.start_date);
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "Asia/Colombo" }).format(date);
  return { slug: event.slug, title: event.title, description: event.description ?? "", tag: event.chapter, cover, day: format({ day: "2-digit" }), month: format({ month: "short", year: "numeric" }), unoptimized: true };
}
export function eventDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
