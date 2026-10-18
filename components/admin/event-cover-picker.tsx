"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { EventImage } from "@/components/sections/event-image";
import { validateCover, type EventImageSelection } from "@/lib/events/cover";

export function EventCoverPicker({ existingUrl, value, onChange, disabled, error, onValidating }: {
  existingUrl: string | null; value: EventImageSelection; onChange: (value: EventImageSelection) => void;
  disabled: boolean; error?: string; onValidating: (value: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [failure, setFailure] = useState("");
  const [checking, setChecking] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { generation.current += 1; }, []);
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const version = ++generation.current;
    setChecking(true); onValidating(true); setFailure("");
    try {
      await validateCover(file);
      if (version !== generation.current) return;
      setPreview(URL.createObjectURL(file)); onChange({ file, remove: false });
    } catch (error) {
      if (version !== generation.current) return;
      setFailure(error instanceof Error ? error.message : "Unable to read the image.");
      if (input.current) input.current.value = "";
    } finally { if (version === generation.current) { setChecking(false); onValidating(false); } }
  }
  function clear(remove: boolean) {
    generation.current += 1;
    setPreview(null); setFailure(""); onChange({ file: null, remove });
    if (input.current) input.current.value = "";
  }
  const image = value.remove ? null : preview ?? existingUrl;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label htmlFor="event-cover" className="block text-sm font-medium">Cover image</label>
      <button type="button" disabled={disabled || checking} onClick={() => input.current?.click()} aria-controls="event-cover" className="rounded-full bg-[#00629B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#005282] disabled:opacity-50">{image ? "Replace image" : "Choose image"}</button>
    </div>
    <input ref={input} id="event-cover" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || checking} onChange={select} tabIndex={-1} aria-describedby="event-cover-help event-cover-error" className="sr-only" />
    <p className="break-words text-sm text-[#4A5B6B]">{value.file?.name ?? (image ? "Current event cover" : "No image selected")}</p>
    <p id="event-cover-help" className="text-xs text-[#4A5B6B]">Optional JPEG, PNG or WebP. Up to 5 MiB and 6000 × 6000 pixels.</p>
    {image && <EventImage src={image} alt="Event cover preview" width={640} height={400} className="aspect-16/10 max-h-60 w-full rounded-2xl border border-[#0B1B2B26] object-cover" />}
    {checking && <p role="status" className="text-sm text-[#00629B]">Checking image…</p>}
    {(failure || error) && <p id="event-cover-error" role="alert" className="text-sm text-[#A6192E]">{failure || error}</p>}
    <div className="flex flex-wrap gap-4 text-sm text-[#00629B]">
      {value.file && <button type="button" disabled={disabled || checking} onClick={() => clear(false)} className="underline">Cancel replacement</button>}
      {(existingUrl || value.file) && !value.remove && <button type="button" disabled={disabled || checking} onClick={() => clear(true)} className="underline">Remove cover</button>}
      {value.remove && <><span className="text-[#4A5B6B]">Cover will be removed when saved.</span><button type="button" disabled={disabled} onClick={() => clear(false)} className="underline">Undo removal</button></>}
    </div>
  </div>;
}
