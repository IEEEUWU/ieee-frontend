export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export function safeCoverSource(value: string) {
  if ((value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) || value.startsWith("blob:")) return value;
  try { const url = new URL(value); if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.toString(); } catch { /* Use the local placeholder. */ }
  return "/photos/robotics-arm.jpg";
}
export type EventImageSelection = { file: File | null; remove: boolean };
export function validateCoverFile(file: Pick<File, "type" | "size">) {
  if (!COVER_TYPES.includes(file.type)) throw new Error("Choose a JPEG, PNG or WebP image.");
  if (file.size < 1 || file.size > MAX_COVER_BYTES) throw new Error("Choose a nonempty image of 5 MiB or smaller.");
}
export async function validateCover(file: File) {
  validateCoverFile(file);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try { await image.decode(); } catch { throw new Error("This image could not be read. Choose another JPEG, PNG or WebP image."); }
    if (image.naturalWidth > 6000 || image.naturalHeight > 6000) throw new Error("The image must be no larger than 6000 × 6000 pixels.");
  } finally { URL.revokeObjectURL(url); }
}
export function eventMultipart(fields: Record<string, unknown>, image: EventImageSelection, update = false) {
  if (image.file && image.remove) throw new Error("Choose either a replacement image or removal.");
  const body = new FormData();
  if (update) body.set("_method", "PUT");
  const allowed = ["title", "chapter", "description", "start_date", "end_date", "mode", "venue", "contact_email", "contact_phone", "max_participants", "is_registration_open", "is_oc_open", ...(update ? [] : ["status"])];
  for (const key of allowed) {
    const value = fields[key];
    if (value === undefined) continue;
    body.set(key, value === null ? "" : typeof value === "boolean" ? value ? "1" : "0" : String(value));
  }
  if (image.file) { validateCoverFile(image.file); body.set("cover_image_file", image.file); }
  if (image.remove) body.set("remove_cover_image", "1");
  return body;
}
