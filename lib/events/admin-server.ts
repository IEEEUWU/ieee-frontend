import { currentUserResponse } from "@/lib/auth/profile";
import { json, protectedBackendRequest, sameOrigin } from "@/lib/auth/server";
import { hasPermission } from "@/lib/permissions/shared";
import { CHAPTERS } from "./shared";
import { EVENT_STATUSES, EventValidationError, validateCreateEvent, validateUpdateEvent } from "./admin-shared";
import { eventMultipart, validateCoverFile } from "./cover";

export async function handleAdminEvents(request: Request, id?: string) {
  if (id !== undefined && (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)))) return json({ error: "Invalid event ID." }, 422);
  if (!["GET", "POST", ...(id ? ["PUT", "DELETE"] : [])].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  if (request.method !== "GET" && !sameOrigin(request)) return json({ error: "Request origin is not allowed." }, 403);
  const profile = await currentUserResponse();
  if (!profile.ok) return profile;
  const user = await profile.json();
  const action = request.method === "DELETE" ? "DELETE_EVENT" : id ? "UPDATE_EVENT" : "CREATE_EVENT";
  if (request.method !== "GET" && !hasPermission(user, action)) return json({ error: `You do not have ${action} permission.` }, 403);
  try {
    let data;
    let method = request.method;
    const params: Record<string, string> = {};
    if (request.method !== "GET" && request.method !== "DELETE") {
      const multipart = request.headers.get("content-type")?.startsWith("multipart/form-data");
      let input: Record<string, unknown>;
      let file: File | null = null;
      if (multipart) {
        let form: FormData;
        try { form = await request.formData(); } catch { return json({ error: "The upload could not be read. Please select the image again." }, 422); }
        if (id && form.get("_method") !== "PUT") return json({ error: "Multipart updates require _method=PUT." }, 422);
        input = {};
        for (const [key, value] of form.entries()) {
          if (key === "cover_image_file" && typeof value !== "string") { file = value; continue; }
          if (typeof value !== "string" || key === "_method") continue;
          if (["is_registration_open", "is_oc_open", "remove_cover_image"].includes(key)) {
            if (value !== "1" && value !== "0") throw new EventValidationError({ [key]: "Choose an open or closed state." });
            input[key] = value === "1";
          } else if (key === "max_participants") input[key] = value === "" ? null : /^\d+$/.test(value) ? Number(value) : value;
          else input[key] = value === "" ? null : value;
        }
      } else input = await request.json().catch(() => null);
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new EventValidationError({ title: "Enter valid event details." });
      if (Object.hasOwn(input, "cover_image_file")) throw new EventValidationError({ cover_image_file: "Choose an image file and send it as multipart form data." });
      if (input.remove_cover_image !== undefined && typeof input.remove_cover_image !== "boolean") throw new EventValidationError({ remove_cover_image: "Choose whether to remove the cover." });
      if ((file && input.remove_cover_image) || ((file || input.remove_cover_image) && input.cover_image)) throw new EventValidationError({ cover_image_file: "Choose either an upload, a legacy image, or removal." });
      if (file) {
        try { validateCoverFile(file); } catch (error) { throw new EventValidationError({ cover_image_file: error instanceof Error ? error.message : "Invalid image." }); }
      }
      const fields = id ? validateUpdateEvent(input) : validateCreateEvent(input);
      if (multipart) { data = eventMultipart(fields, { file, remove: input.remove_cover_image === true }, Boolean(id)); method = "POST"; }
      else { data = { ...fields, ...(input.remove_cover_image === undefined ? {} : { remove_cover_image: input.remove_cover_image }) }; method = id ? "PUT" : "POST"; }
      // The backend checks actual group identity and chapter scope.
      // Forward its authorization result; never infer WebMaster from a group ID.
    } else if (!id) {
      const query = new URL(request.url).searchParams;
      for (const key of ["page", "per_page"]) {
        const value = query.get(key) ?? (key === "page" ? "1" : "15");
        if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || (key === "per_page" && Number(value) > 48)) return json({ error: "Choose a valid page and page size." }, 422);
        params[key] = value;
      }
      const chapter = query.get("chapter") ?? "";
      const status = query.get("status") ?? "";
      const search = (query.get("search") ?? "").trim();
      if (chapter && !CHAPTERS.includes(chapter as typeof CHAPTERS[number])) return json({ error: "Choose a valid chapter." }, 422);
      if (status && !EVENT_STATUSES.includes(status as typeof EVENT_STATUSES[number])) return json({ error: "Choose a valid event status." }, 422);
      if (search.length > 255) return json({ error: "Search must be 255 characters or fewer." }, 422);
      if (chapter) params.chapter = chapter;
      if (status) params.status = status;
      if (search) params.search = search;
    }
    const response = await protectedBackendRequest(id ? `/events/${id}` : "/events", { method, ...(data ? { data } : id ? {} : { params }) });
    if (response.ok || response.status === 401) return response;
    const failure = await response.json().catch(() => null);
    const errors = failure?.errors && typeof failure.errors === "object" ? failure.errors : undefined;
    const message = errors && Object.values(errors).flat().find((value) => typeof value === "string");
    return json({ error: request.method === "DELETE" && response.status >= 500 ? "Deletion could not be confirmed. Refresh the event list before trying again." : response.status === 413 ? "The upload exceeds the server limit. Choose an image of 5 MiB or smaller." : response.status === 503 ? "The image could not be stored. Keep your selection and try again." : response.status >= 500 ? "The save could not be confirmed. Check the event list before trying again." : message || failure?.message || failure?.error || "Unable to complete the event request.", ...(errors && response.status === 422 ? { errors } : {}) }, response.status);
  } catch (error) {
    if (error instanceof EventValidationError) return json({ error: error.message, errors: Object.fromEntries(Object.entries(error.fields).map(([key, value]) => [key, [value]])) }, 422);
    return json({ error: request.method === "DELETE" ? "Deletion could not be confirmed. Refresh the event list before trying again." : "Unable to reach the event service. Please try again." }, 502);
  }
}
