"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EventCoverPicker } from "@/components/admin/event-cover-picker";
import { DeleteEventDialog } from "@/components/admin/delete-event-dialog";
import { EventImage } from "@/components/sections/event-image";
import type { EventImageSelection } from "@/lib/events/cover";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAppSelector } from "@/lib/auth/store";
import { hasPermission } from "@/lib/permissions/shared";
import { CHAPTERS, eventDate } from "@/lib/events/shared";
import { EVENT_MODES, EVENT_STATUSES, EventValidationError, colomboInputToUTC, colomboDateInput, validateCreateEvent, validateUpdateEvent, parseAdminEvent, type AdminEvent, type CreateEvent } from "@/lib/events/admin-shared";
import { AdminEventRequestError, adminEventRequest, saveAdminEvent, loadAdminEvents } from "@/lib/events/admin-client";

const field = "w-full rounded-xl border border-[#0B1B2B26] bg-[#F7F9FB] px-4 py-3 text-sm focus:border-[#00629B] disabled:opacity-60";
const button = "rounded-full border border-[#0B1B2B26] px-4 py-2.5 text-sm font-medium hover:bg-[#F7F9FB] disabled:opacity-50";
const primary = "rounded-full bg-[#00629B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#005282] disabled:opacity-50";

type Catalogue = Awaited<ReturnType<typeof loadAdminEvents>>;
function EventDialog({ chapter, canChooseChapter, existing, onClose, onCreated }: { chapter: string; canChooseChapter: boolean; existing?: AdminEvent; onClose: () => void; onCreated: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const [image, setImage] = useState<EventImageSelection>({ file: null, remove: false });
  const [checkingImage, setCheckingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current || checkingImage) return;
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    let body: CreateEvent | Record<string, unknown>;
    try {
      const fields = { title: value("title"), chapter: canChooseChapter ? value("chapter") : chapter,
        description: value("description") || null,
        start_date: colomboInputToUTC(value("start_date")), end_date: colomboInputToUTC(value("end_date")),
        mode: value("mode"), venue: value("venue") || null, contact_email: value("contact_email") || null,
        contact_phone: value("contact_phone") || null, status: value("status"),
        max_participants: value("max_participants") ? Number(value("max_participants")) : null,
        is_registration_open: form.has("is_registration_open"), is_oc_open: form.has("is_oc_open"),
      };
      if (existing) { const { status: _status, ...metadata } = fields; void _status; body = validateUpdateEvent(metadata); }
      else body = validateCreateEvent(fields);
    } catch (failure) {
      if (failure instanceof EventValidationError) { setErrors(failure.fields); setError("Please check the highlighted fields."); }
      return;
    }
    saving.current = true; setPending(true); setError(""); setErrors({});
    try {
      await saveAdminEvent(body, image, existing?.id);
      toast.success(existing ? "Event updated." : body.status === "PUBLISHED" ? "Event published. Find it on the public Events page." : "Draft created. Drafts are visible only in admin Events.");
      onCreated();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save the event.");
      if (failure instanceof AdminEventRequestError) setErrors(failure.fields);
    } finally { saving.current = false; setPending(false); }
  }
  function input(name: string, label: string, type = "text", required = false, maxLength?: number) {
    return <label className="flex flex-col gap-2 text-sm font-medium" htmlFor={`event-${name}`}>{label}{required ? " *" : ""}<input id={`event-${name}`} name={name} type={type} required={required} maxLength={maxLength} min={type === "number" ? 1 : undefined} step={type === "number" ? 1 : undefined} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} defaultValue={existing ? name === "start_date" || name === "end_date" ? colomboDateInput(existing[name]) : String(existing[name as keyof AdminEvent] ?? "") : undefined} className={field} />{errors[name] && <span id={`error-${name}`} className="text-xs text-[#A6192E]">{errors[name]}</span>}</label>;
  }
  const message = (name: string) => errors[name] && <span className="text-xs text-[#A6192E]">{errors[name]}</span>;
  return <dialog ref={dialog} aria-labelledby="create-event-title" onCancel={(event) => { event.preventDefault(); if (!pending && !checkingImage) onClose(); }} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl border border-[#0B1B2B14] bg-white p-6 font-plex text-[#0B1B2B] backdrop:bg-[#0B1B2B66] sm:p-8">
    <div className="flex items-center justify-between gap-4"><h2 id="create-event-title" className="text-xl font-semibold">{existing ? "Edit event" : "Create event"}</h2><button type="button" disabled={pending || checkingImage} onClick={onClose} aria-label="Close" className={button}>Close</button></div>
    <p className="mt-3 text-sm leading-relaxed text-[#4A5B6B]">Enter dates and times in Sri Lanka time (UTC+05:30).</p>
    <form onSubmit={submit} className="mt-6 space-y-5">
      {error && <p role="alert" className="rounded-xl bg-[#A6192E0D] p-4 text-sm text-[#A6192E]">{error}</p>}
      <fieldset disabled={pending} className="space-y-5">
        {input("title", "Event title", "text", true, 255)}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">Chapter *<select name="chapter" defaultValue={existing?.chapter ?? chapter} disabled={!canChooseChapter || pending} className={field}>{(canChooseChapter ? CHAPTERS : [chapter]).map((item) => <option key={item}>{item}</option>)}</select>{message("chapter")}</label>
          {!existing && <label className="flex flex-col gap-2 text-sm font-medium">Status *<select name="status" defaultValue="DRAFT" className={field}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select>{message("status")}</label>}
        </div>
        {!existing && <p className="text-xs leading-relaxed text-[#4A5B6B]">Drafts stay in admin Events. Published events appear publicly under the matching Upcoming, Ongoing or Past filter.</p>}
        <label className="flex flex-col gap-2 text-sm font-medium">Description<textarea name="description" defaultValue={existing?.description ?? ""} rows={4} maxLength={20000} className={field} />{message("description")}</label>
        <div className="grid gap-5 sm:grid-cols-2">{input("start_date", "Start date and time", "datetime-local", true)}{input("end_date", "End date and time", "datetime-local", true)}</div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-medium">Mode *<select name="mode" defaultValue={existing?.mode ?? "PHYSICAL"} className={field}>{EVENT_MODES.map((mode) => <option key={mode} value={mode}>{{ PHYSICAL: "In person", ONLINE: "Online", HYBRID: "Hybrid" }[mode]}</option>)}</select>{message("mode")}</label>{input("venue", "Venue or meeting details", "text", false, 255)}</div>
        <EventCoverPicker existingUrl={existing?.cover_image_url ?? null} value={image} onChange={setImage} disabled={pending} onValidating={setCheckingImage} error={errors.cover_image_file || errors.cover_image || errors.remove_cover_image} />
        <div className="grid gap-5 sm:grid-cols-2">{input("contact_email", "Contact email", "email", false, 255)}{input("contact_phone", "Contact phone", "tel", false, 50)}</div>
        {input("max_participants", "Maximum participants (blank for no limit)", "number")}
        <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" name="is_registration_open" defaultChecked={existing?.is_registration_open ?? false} className="accent-[#00629B]" />Open participant registration</label><label className="flex items-center gap-2"><input type="checkbox" name="is_oc_open" defaultChecked={existing?.is_oc_open ?? false} className="accent-[#00629B]" />Open OC applications</label></div>
        <p className="text-xs leading-relaxed text-[#4A5B6B]">Registration also needs an enabled registration form. Creating an event does not create its forms.</p>
      </fieldset>
      <div className="flex justify-end gap-3 border-t border-[#0B1B2B14] pt-5"><button type="button" disabled={pending || checkingImage} onClick={onClose} className={button}>Cancel</button><button type="submit" disabled={pending || checkingImage} className={primary}>{pending ? "Saving…" : existing ? "Save changes" : "Create event"}</button></div>
    </form>
  </dialog>;
}

export default function AdminEventsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [filters, setFilters] = useState({ page: 1, status: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [deleting, setDeleting] = useState<AdminEvent | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [reload, setReload] = useState(0);
  const filterForm = useRef<HTMLFormElement>(null);
  const canUpdate = hasPermission(user, "UPDATE_EVENT");
  const canDelete = hasPermission(user, "DELETE_EVENT");
  async function edit(id: number) {
    if (loadingEdit) return;
    setLoadingEdit(true);
    try { setEditing(parseAdminEvent(await adminEventRequest(`/${id}`))); }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : "Unable to load event."); }
    finally { setLoadingEdit(false); }
  }
  const canCreate = hasPermission(user, "CREATE_EVENT");
  const canChooseChapter = user?.chapter === "SB" && user.user_group_name?.trim().toLowerCase() === "webmaster";
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const query = new URLSearchParams({ page: String(filters.page), status: filters.status, search: filters.search });
        const result = await loadAdminEvents(`?${query}`, filters.page, controller.signal);
        if (!controller.signal.aborted) { setCatalogue(result); setError(""); }
      } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load events."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [filters, reload]);
  function refresh() { setLoading(true); setReload((current) => current + 1); }
  return <AdminShell><div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">Events</h1><p className="mt-2 text-sm text-[#4A5B6B]">Manage your chapter’s events. Drafts and published events are listed here.</p></div>{canCreate && <button onClick={() => setCreating(true)} className={primary}>Create event</button>}</header>
    <section className="overflow-hidden rounded-3xl border border-[#0B1B2B14] bg-white">
      <form ref={filterForm} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setLoading(true); setFilters({ page: 1, status: String(data.get("status") ?? ""), search: String(data.get("search") ?? "").trim() }); }} className="flex flex-wrap items-end gap-4 border-b border-[#0B1B2B14] p-6">
        <label className="flex flex-1 flex-col gap-2 text-sm">Search events<input name="search" maxLength={255} className={field} placeholder="Search by title or description" /></label>
        <label className="flex flex-col gap-2 text-sm">Status<select name="status" className={field}><option value="">All statuses</option>{EVENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
        <button type="submit" className={button}>Search</button><button type="button" onClick={refresh} disabled={loading} className={button}>Refresh</button>
      </form>
      {loading ? <p role="status" className="p-8 text-sm text-[#4A5B6B]">Loading events…</p> : error ? <div role="alert" className="p-8 text-sm text-[#A6192E]">{error}<button onClick={refresh} className="ml-3 underline">Try again</button></div> : !catalogue?.data.length ? <p className="p-8 text-sm text-[#4A5B6B]">No events match these filters.</p> : <div className="divide-y divide-[#0B1B2B14]">{catalogue.data.map((event) => <article key={event.id} className="flex flex-wrap items-center justify-between gap-5 p-6"><div className="flex min-w-0 items-start gap-5"><EventImage src={event.cover_image_url || "/photos/robotics-arm.jpg"} alt="" width={160} height={100} className="h-24 w-36 rounded-xl object-cover" /><div className="min-w-0"><div className="mb-3 flex items-center gap-3 text-xs"><span className="rounded-full bg-[#00629B0D] px-3 py-1 text-[#00629B]">{event.chapter}</span><span className="font-medium text-[#4A5B6B]">{event.status}</span></div><h2 className="break-words text-lg font-semibold">{event.title}</h2><p className="mt-2 text-sm text-[#4A5B6B]">{eventDate(event.start_date)} (Sri Lanka)</p><p className="mt-1 text-xs text-[#4A5B6B]">{event.mode}{event.venue ? ` · ${event.venue}` : ""}</p></div></div><div className="flex flex-wrap items-center gap-3">{canUpdate && <button type="button" disabled={loadingEdit} onClick={() => void edit(event.id)} className={button}>Edit event</button>}{canDelete && <button type="button" disabled={loadingEdit} onClick={() => setDeleting(event)} className="rounded-full border border-[#A6192E33] px-4 py-2.5 text-sm font-medium text-[#A6192E] hover:bg-[#A6192E0D] disabled:opacity-50">Delete event</button>}{event.status === "PUBLISHED" ? <Link href={`/events/${encodeURIComponent(event.slug)}`} className={button}>View public event</Link> : <span className="text-xs text-[#4A5B6B]">Not publicly listed</span>}</div></article>)}</div>}
      {catalogue && !loading && !error && <nav aria-label="Event pages" className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0B1B2B14] p-6 text-sm text-[#4A5B6B]"><p>{catalogue.total} events · Page {catalogue.current_page} of {catalogue.last_page}</p><div className="flex gap-3"><button className={button} disabled={filters.page <= 1} onClick={() => { setLoading(true); setFilters({ ...filters, page: filters.page - 1 }); }}>Previous</button><button className={button} disabled={filters.page >= catalogue.last_page} onClick={() => { setLoading(true); setFilters({ ...filters, page: filters.page + 1 }); }}>Next</button></div></nav>}
    </section>
    <Link href="/events?timeframe=all" className="inline-block text-sm font-medium text-[#00629B] hover:underline">Browse all published events →</Link>
    {deleting && <DeleteEventDialog event={deleting} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); setLoading(true); if (catalogue?.data.length === 1 && filters.page > 1) setFilters({ ...filters, page: filters.page - 1 }); else setReload((current) => current + 1); }} />}
    {(creating || editing) && user && <EventDialog key={editing?.id ?? "create"} existing={editing ?? undefined} chapter={user.chapter} canChooseChapter={canChooseChapter} onClose={() => { setCreating(false); setEditing(null); }} onCreated={() => { setCreating(false); setEditing(null); filterForm.current?.reset(); setLoading(true); setFilters({ page: 1, status: "", search: "" }); }} />}
  </div></AdminShell>;
}
