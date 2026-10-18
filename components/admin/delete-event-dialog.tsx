"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteAdminEvent } from "@/lib/events/admin-client";

export function DeleteEventDialog({ event, onClose, onDeleted }: {
  event: { id: number; title: string }; onClose: () => void; onDeleted: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const deleting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element?.showModal(); cancel.current?.focus(); return () => element?.close(); }, []);
  async function remove() {
    if (deleting.current) return;
    deleting.current = true; setPending(true); setError("");
    try { await deleteAdminEvent(event.id); toast.success("Event deleted."); onDeleted(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to delete this event."); }
    finally { deleting.current = false; setPending(false); }
  }
  return <dialog ref={dialog} aria-labelledby="delete-event-title" aria-describedby="delete-event-description" onCancel={(action) => { action.preventDefault(); if (!pending) onClose(); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-[#0B1B2B14] bg-white p-6 font-plex text-[#0B1B2B] backdrop:bg-[#0B1B2B66] sm:p-8">
    <h2 id="delete-event-title" className="text-xl font-semibold">Delete event</h2>
    <p id="delete-event-description" className="mt-4 text-sm leading-relaxed text-[#4A5B6B]">Delete <strong className="break-words text-[#0B1B2B]">{event.title}</strong>? This removes the event from admin and public event listings.</p>
    {error && <p role="alert" className="mt-4 rounded-xl bg-[#A6192E0D] p-4 text-sm text-[#A6192E]">{error}</p>}
    <div className="mt-6 flex justify-end gap-3 border-t border-[#0B1B2B14] pt-5">
      <button ref={cancel} type="button" disabled={pending} onClick={onClose} className="rounded-full border border-[#0B1B2B26] px-4 py-2.5 text-sm font-medium hover:bg-[#F7F9FB] disabled:opacity-50">Cancel</button>
      <button type="button" disabled={pending} onClick={() => void remove()} className="rounded-full bg-[#A6192E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#861426] disabled:opacity-50">{pending ? "Deleting…" : "Delete event"}</button>
    </div>
  </dialog>;
}
