import { getBackendApiBaseUrl } from "@/lib/auth/server";
import { eventCover, eventFilters, eventQuery, parseEventPage, parsePublicEvent, type EventFilters } from "./shared";

export class PublicEventError extends Error {
  constructor(public status: number) { super("Unable to load events. Please try again."); }
}
async function publicRequest(path: string) {
  try {
    const response = await fetch(`${getBackendApiBaseUrl()}/public/events${path}`, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new PublicEventError(response.status);
    return await response.json() as unknown;
  } catch (error) {
    if (error instanceof PublicEventError) throw error;
    throw new PublicEventError(502);
  }
}
export async function loadPublicEvents(filters: EventFilters) {
  const validated = eventFilters(Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])));
  return parseEventPage(await publicRequest(`?${eventQuery(validated)}`), validated.page);
}
export async function loadPublicEvent(identifier: string) {
  if (!identifier.trim() || identifier.length > 255 || /[/?#\\\x00-\x1f]/.test(identifier) || identifier === "." || identifier === "..") throw new PublicEventError(404);
  return parsePublicEvent(await publicRequest(`/${encodeURIComponent(identifier)}`));
}
export function publicEventCover(value: string | null) { return eventCover(value, getBackendApiBaseUrl()); }
