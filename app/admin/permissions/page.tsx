"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { protectedFetch } from "@/lib/auth/client";
import { profileReceived, useAppDispatch, useAppSelector } from "@/lib/auth/store";
import { canManagePermissions, hasPermission, type PermissionRecord } from "@/lib/permissions/shared";
import { permissionsReceived } from "@/lib/permissions/store";
import { loadPermissionCatalogue, parsePermission, permissionRequest, type PermissionCatalogue } from "@/lib/permissions/client";

type Mode = "create" | "view" | "edit" | "delete";
type Selection = { mode: Mode; record?: PermissionRecord };
const fieldClass = "w-full rounded-xl border border-[#0B1B2B26] bg-[#F7F9FB] px-4 py-3 text-sm focus:border-[#00629B] disabled:opacity-70";

function PermissionDialog({ selection, pending, onClose, onSubmit }: { selection: Selection; pending: boolean; onClose: () => void; onSubmit: (body: { permission_code: string; description: string }) => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { mode, record } = selection;
  const readonly = mode === "view" || mode === "delete";
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void onSubmit({ permission_code: String(data.get("permission_code") || "").trim(), description: String(data.get("description") || "").trim() });
  }
  return <dialog ref={dialog} onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }} aria-labelledby="permission-dialog-title" className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-[#0B1B2B14] bg-white p-6 font-plex text-[#0B1B2B] backdrop:bg-[#0B1B2B66] sm:p-8">
    <div className="flex items-center justify-between gap-4"><h2 id="permission-dialog-title" className="text-xl font-semibold">{mode === "create" ? "Create permission" : mode === "edit" ? "Edit permission" : mode === "delete" ? "Delete permission" : "Permission details"}</h2><button type="button" onClick={onClose} disabled={pending} aria-label="Close dialog" className="rounded-lg px-3 py-2 text-lg hover:bg-[#F7F9FB] disabled:opacity-50">×</button></div>
    <form onSubmit={submit} className="mt-6 space-y-5">
      {record && <p className="text-xs text-[#4A5B6B]">Permission ID: {record.id}</p>}
      {mode === "delete" ? <p className="text-sm leading-relaxed text-[#4A5B6B]">Delete <strong className="text-[#0B1B2B]">{record?.permission_code || `permission #${record?.id}`}</strong>? This may remove access from users assigned this permission.</p> : <>
        <div><label htmlFor="permission-code" className="mb-2 block text-sm font-medium">Permission code</label><input id="permission-code" name="permission_code" defaultValue={record?.permission_code || ""} required maxLength={255} autoFocus={!readonly} readOnly={readonly} disabled={pending} placeholder="CREATE_PERMISSION" className={`${fieldClass} font-mono`} /></div>
        <div><label htmlFor="permission-description" className="mb-2 block text-sm font-medium">Description</label><textarea id="permission-description" name="description" defaultValue={record?.description || ""} readOnly={readonly} disabled={pending} rows={4} placeholder="Describe what this permission allows" className={fieldClass} /></div>
      </>}
      <div className="flex justify-end gap-3 border-t border-[#0B1B2B14] pt-5"><button type="button" onClick={onClose} disabled={pending} className="rounded-full border border-[#0B1B2B26] px-5 py-2.5 text-sm font-medium disabled:opacity-50">{mode === "view" ? "Close" : "Cancel"}</button>{mode !== "view" && <button type="submit" disabled={pending} className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50 ${mode === "delete" ? "bg-[#A6192E] hover:bg-[#851426]" : "bg-[#00629B] hover:bg-[#005282]"}`}>{pending ? "Saving…" : mode === "delete" ? "Delete permission" : "Save permission"}</button>}</div>
    </form>
  </dialog>;
}

export default function PermissionManagementPage() {
  const user = useAppSelector((state) => state.auth.user);
  const items = useAppSelector((state) => state.permissions.items);
  const dispatch = useAppDispatch();
  const canView = hasPermission(user, "VIEW_PERMISSIONS");
  const canCreate = hasPermission(user, "CREATE_PERMISSION");
  const canUpdate = hasPermission(user, "UPDATE_PERMISSION");
  const canDelete = hasPermission(user, "DELETE_PERMISSION");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pending, setPending] = useState(false);
  const [manualId, setManualId] = useState("");
  const [opening, setOpening] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [catalogue, setCatalogue] = useState<PermissionCatalogue | null>(null);
  const catalogueRequest = useRef<AbortController | null>(null);

  const loadCatalogue = useCallback(async () => {
    if (!canView) return;
    catalogueRequest.current?.abort();
    const controller = new AbortController();
    catalogueRequest.current = controller;
    const signal = controller.signal;
    try {
      const data = await loadPermissionCatalogue(page, signal);
      if (signal.aborted) return;
      if (page > data.last_page) {
        const lastPage = await loadPermissionCatalogue(data.last_page, signal);
        if (signal.aborted) return;
        dispatch(permissionsReceived(lastPage.data));
        setCatalogue(lastPage);
        setPage(data.last_page);
        return;
      }
      dispatch(permissionsReceived(data.data));
      setCatalogue(data);
    } catch (failure) {
      if (!signal?.aborted) { const message = failure instanceof Error ? failure.message : "Unable to load permissions."; setError(message); toast.error(message); }
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [canView, dispatch, page]);
  useEffect(() => {
    let disposed = false;
    void Promise.resolve().then(() => { if (!disposed) return loadCatalogue(); });
    return () => { disposed = true; catalogueRequest.current?.abort(); };
  }, [loadCatalogue]);
  function refreshCatalogue() { setLoading(true); setError(""); void loadCatalogue(); }

  async function openRecord(mode: Mode, record: PermissionRecord) {
    if (!canView) { setSelection({ mode, record }); return; }
    setOpening(record.id);
    try { setSelection({ mode, record: parsePermission(await permissionRequest(`/${record.id}`)) }); }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : "Unable to load permission details."); }
    finally { setOpening(null); }
  }
  async function save(body: { permission_code: string; description: string }) {
    if (!selection || pending) return;
    const { mode, record } = selection;
    const allowed = mode === "create" ? canCreate : mode === "edit" ? canUpdate : mode === "delete" ? canDelete : false;
    if (!allowed) { toast.error("You do not have permission to perform this action."); return; }
    setPending(true);
    try {
      const result = await permissionRequest(mode === "create" ? "" : `/${record!.id}`, mode === "create" ? "POST" : mode === "edit" ? "PUT" : "DELETE", mode === "delete" ? undefined : body);
      toast.success(result?.message || "Permission saved successfully.");
      setSelection(null);
      // Permissions may have changed, including this user's own permissions.
      const response = await protectedFetch("/api/auth/me");
      const profile = await response.json();
      if (!response.ok) throw new Error(profile.error || "Unable to refresh account permissions.");
      dispatch(profileReceived(profile));
      if (hasPermission(profile, "VIEW_PERMISSIONS")) { setLoading(true); setError(""); await loadCatalogue(); }
      else dispatch(permissionsReceived([]));
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : "Unable to save permission."); }
    finally { setPending(false); }
  }
  const filtered = items.filter((record) => `${record.permission_code} ${record.description || ""}`.toLowerCase().includes(search.toLowerCase()));
  return <AdminShell>{!canManagePermissions(user) ? <section className="rounded-3xl border border-[#0B1B2B14] bg-white p-8"><h1 className="text-2xl font-semibold">Permission management is unavailable</h1><p className="mt-3 text-sm text-[#4A5B6B]">Your account does not have permission to access this workspace.</p></section> : <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-medium tracking-[1.5px] text-[#00629B] uppercase">Administration</p><h1 className="mt-3 text-3xl font-semibold tracking-[-1px]">Permission management</h1><p className="mt-3 text-sm text-[#4A5B6B]">Manage the permission codes that control access across the system.</p></div>{canCreate && <button onClick={() => setSelection({ mode: "create" })} disabled={pending} className="rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#005282] disabled:opacity-50">Create permission</button>}</header>
    {canView ? <section className="overflow-hidden rounded-3xl border border-[#0B1B2B14] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B1B2B14] p-6"><div><h2 className="text-lg font-semibold">Permission catalogue</h2><p className="mt-1 text-xs text-[#4A5B6B]">{catalogue?.total ?? 0} permissions</p></div><div className="flex items-center gap-3"><label className="sr-only" htmlFor="search-permissions">Search this page</label><input id="search-permissions" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page" className={`${fieldClass} max-w-xs`} /><button onClick={refreshCatalogue} disabled={loading || pending} className="rounded-full border border-[#0B1B2B26] px-4 py-2 text-sm disabled:opacity-50">Refresh</button></div></div>
      {loading ? <p role="status" className="p-8 text-sm text-[#4A5B6B]">Loading permissions…</p> : error ? <div role="alert" className="p-8 text-sm text-[#A6192E]">{error}<button onClick={refreshCatalogue} className="ml-3 underline">Try again</button></div> : filtered.length === 0 ? <p className="p-8 text-sm text-[#4A5B6B]">{search ? "No permissions on this page match your search." : "No permissions have been created yet."}</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#F7F9FB] text-xs text-[#4A5B6B]"><tr><th scope="col" className="px-6 py-4 font-medium">Code</th><th scope="col" className="px-6 py-4 font-medium">Description</th><th scope="col" className="px-6 py-4 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-[#0B1B2B14]">{filtered.map((record) => <tr key={record.id}><td className="px-6 py-5 font-mono text-xs font-medium text-[#00629B]">{record.permission_code}</td><td className="min-w-[240px] px-6 py-5 text-[#4A5B6B]">{record.description || "No description"}</td><td className="px-6 py-5"><div className="flex justify-end gap-3">{(["view", ...(canUpdate ? ["edit"] : []), ...(canDelete ? ["delete"] : [])] as Mode[]).map((mode) => <button key={mode} disabled={opening !== null || pending} onClick={() => void openRecord(mode, record)} aria-label={`${mode} ${record.permission_code}`} className={`rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50 ${mode === "delete" ? "text-[#A6192E] hover:bg-[#A6192E0D]" : "text-[#00629B] hover:bg-[#00629B0D]"}`}>{opening === record.id ? "Loading…" : mode === "view" ? "View" : mode === "edit" ? "Edit" : "Delete"}</button>)}</div></td></tr>)}</tbody></table></div>}
      {catalogue && <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0B1B2B14] px-6 py-4">
        <p className="text-xs text-[#4A5B6B]">Showing {catalogue.from ?? 0}–{catalogue.to ?? 0} of {catalogue.total} permissions</p>
        <nav aria-label="Permission catalogue pages" className="flex items-center gap-3">
          <button type="button" disabled={loading || pending || page <= 1} onClick={() => { setLoading(true); setError(""); setSearch(""); setPage(page - 1); }} className="rounded-full border border-[#0B1B2B26] px-4 py-2 text-sm disabled:opacity-50">Previous</button>
          <span className="text-xs text-[#4A5B6B]">Page {page} of {catalogue.last_page}</span>
          <button type="button" disabled={loading || pending || page >= catalogue.last_page} onClick={() => { setLoading(true); setError(""); setSearch(""); setPage(page + 1); }} className="rounded-full border border-[#0B1B2B26] px-4 py-2 text-sm disabled:opacity-50">Next</button>
        </nav>
      </div>}
    </section> : <section className="rounded-3xl border border-[#0B1B2B14] bg-white p-6"><h2 className="text-lg font-semibold">Catalogue access is restricted</h2><p className="mt-3 text-sm text-[#4A5B6B]">You need VIEW_PERMISSIONS to browse the catalogue. You can still use the actions assigned to your account.</p>{(canUpdate || canDelete) && <div className="mt-5 flex flex-wrap items-end gap-3"><div><label htmlFor="manual-permission-id" className="mb-2 block text-sm font-medium">Permission ID</label><input id="manual-permission-id" type="number" min="1" step="1" value={manualId} onChange={(event) => setManualId(event.target.value)} className={fieldClass} /></div>{canUpdate && <button disabled={!/^[1-9]\d*$/.test(manualId)} onClick={() => setSelection({ mode: "edit", record: { id: Number(manualId), permission_code: "", description: "" } })} className="rounded-full border border-[#0B1B2B26] px-5 py-3 text-sm disabled:opacity-50">Edit by ID</button>}{canDelete && <button disabled={!/^[1-9]\d*$/.test(manualId)} onClick={() => setSelection({ mode: "delete", record: { id: Number(manualId), permission_code: "", description: "" } })} className="rounded-full border border-[#A6192E33] px-5 py-3 text-sm text-[#A6192E] disabled:opacity-50">Delete by ID</button>}</div>}</section>}
    {selection && <PermissionDialog selection={selection} pending={pending} onClose={() => { if (!pending) setSelection(null); }} onSubmit={save} />}
  </div>}</AdminShell>;
}
