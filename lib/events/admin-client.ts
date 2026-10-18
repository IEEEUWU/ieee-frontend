import { protectedFetch } from "@/lib/auth/client";
import { parseAdminEventPage, type CreateEvent } from "./admin-shared";
import { eventMultipart, type EventImageSelection } from "./cover";

export class AdminEventRequestError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) { super(message); }
}
export async function adminEventRequest(query = "", body?: CreateEvent | Record<string, unknown> | FormData, signal?: AbortSignal, method?: string) {
  const multipart = body instanceof FormData;
  let response: Response;
  try { response = await protectedFetch(`/api/events${query}`, { method: method ?? (body ? "POST" : "GET"), signal, ...(body ? multipart ? { body } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) }); }
  catch (error) { if (signal?.aborted) throw error; throw new AdminEventRequestError(method === "DELETE" ? "Deletion could not be confirmed. Refresh the event list before trying again." : body ? "The save could not be confirmed. Check the event list before trying again; your changes are still here." : "Unable to reach the event service."); }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const fields: Record<string, string> = {};
    if (result?.errors && typeof result.errors === "object") for (const [key, value] of Object.entries(result.errors)) {
      if (Array.isArray(value) && typeof value[0] === "string") fields[key] = value[0];
    }
    throw new AdminEventRequestError(response.status === 413 ? "The upload is too large for the server. Choose an image of 5 MiB or smaller." : result?.error || result?.message || "Unable to complete the event request.", fields);
  }
  return result;
}
export function deleteAdminEvent(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new AdminEventRequestError("Invalid event ID.");
  return adminEventRequest(`/${id}`, undefined, undefined, "DELETE");
}
export function saveAdminEvent(fields: Record<string, unknown>, image: EventImageSelection, id?: number) {
  if (image.file) return adminEventRequest(id ? `/${id}` : "", eventMultipart(fields, image, Boolean(id)), undefined, "POST");
  const allowed = ["title", "chapter", "description", "start_date", "end_date", "mode", "venue", "contact_email", "contact_phone", "max_participants", "is_registration_open", "is_oc_open", ...(id ? [] : ["status"])];
  const body = Object.fromEntries(Object.entries(fields).filter(([key]) => allowed.includes(key)));
  if (image.remove) body.remove_cover_image = true;
  return adminEventRequest(id ? `/${id}` : "", body, undefined, id ? "PUT" : "POST");
}
export async function loadAdminEvents(query: string, page: number, signal?: AbortSignal) {
  return parseAdminEventPage(await adminEventRequest(query, undefined, signal), page);
}
