"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { protectedFetch } from "@/lib/auth/client";
import { profileReceived, useAppDispatch, useAppSelector } from "@/lib/auth/store";
import { hasPermission, type PermissionRecord } from "@/lib/permissions/shared";
import { canManageUserGroups, type UserGroup } from "@/lib/usergroups/shared";
import { loadSelectablePermissions, loadUserGroups, permissionValues, userGroupRequest, type UserGroupCatalogue } from "@/lib/usergroups/client";

type Mode = "create" | "edit" | "assign" | "delete";
type Selection = { mode: Mode; group?: UserGroup };
type GroupForm = { group_name: string; group_description: string; permissions: number[] };
const fieldClass = "w-full rounded-xl border border-[#0B1B2B26] bg-[#F7F9FB] px-4 py-3 text-sm focus:border-[#00629B] disabled:opacity-70";
const buttonClass = "rounded-full border border-[#0B1B2B26] px-4 py-2 text-sm font-medium hover:bg-[#F7F9FB] disabled:opacity-50";

function UserGroupDialog({ selection, pending, canViewPermissions, onClose, onSubmit }: {
  selection: Selection; pending: boolean; canViewPermissions: boolean; onClose: () => void; onSubmit: (body: GroupForm) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { mode, group } = selection;
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(mode !== "delete");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [replace, setReplace] = useState(false);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => {
    if (mode === "delete" || !canViewPermissions) return;
    const controller = new AbortController();
    loadSelectablePermissions(controller.signal).then((records) => {
      if (controller.signal.aborted) return;
      setPermissions(records);
      const assigned = group?.permissions ?? [];
      const matches = records.filter((record) => assigned.includes(record.id) || assigned.includes(record.permission_code));
      setSelected(matches.map((record) => record.id));
      setUnavailable(mode !== "create" && (group?.permissions === null || assigned.some((value) => !records.some((record) => record.id === value || record.permission_code === value))));
      setLoading(false);
    }).catch((failure) => {
      if (controller.signal.aborted) return;
      setError(failure instanceof Error ? failure.message : "Unable to load permissions.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [mode, group, canViewPermissions, reload]);
  const filtered = permissions.filter((record) => `${record.permission_code} ${record.description ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const blocked = mode !== "delete" && (!canViewPermissions || loading || Boolean(error) || (unavailable && !replace));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || blocked) return;
    const data = new FormData(event.currentTarget);
    void onSubmit({ group_name: String(data.get("group_name") ?? "").trim(), group_description: String(data.get("group_description") ?? "").trim(), permissions: permissionValues(selected) });
  }
  return <dialog ref={dialog} aria-labelledby="usergroup-dialog-title" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-[#0B1B2B14] bg-white p-6 font-plex text-[#0B1B2B] backdrop:bg-[#0B1B2B66] sm:p-8">
    <div className="flex items-center justify-between gap-4"><h2 id="usergroup-dialog-title" className="text-xl font-semibold">{mode === "create" ? "Create user group" : mode === "edit" ? "Edit user group" : mode === "assign" ? "Assign permissions" : "Delete user group"}</h2><button type="button" disabled={pending} onClick={onClose} aria-label="Close dialog" className={buttonClass}>×</button></div>
    <form onSubmit={submit} className="mt-6 space-y-5">
      {group && <p className="text-sm text-[#4A5B6B]">{group.group_name || "User group"} · ID {group.id}</p>}
      {mode === "delete" ? <p className="text-sm leading-relaxed text-[#4A5B6B]">Delete <strong>{group?.group_name || `user group #${group?.id}`}</strong>? This can affect access for users assigned to this group.</p> : <>
        {mode !== "assign" && <>
          <div><label htmlFor="group-name" className="mb-2 block text-sm font-medium">Group name</label><input id="group-name" name="group_name" defaultValue={group?.group_name ?? ""} required maxLength={255} disabled={pending} autoFocus placeholder="Treasurer" className={fieldClass} /></div>
          <div><label htmlFor="group-description" className="mb-2 block text-sm font-medium">Description</label><textarea id="group-description" name="group_description" defaultValue={group?.group_description ?? ""} rows={3} disabled={pending} placeholder="Describe this group’s responsibilities" className={fieldClass} /></div>
        </>}
        <fieldset disabled={pending} className="space-y-3">
          <legend className="text-sm font-medium">Permissions <span className="text-[#4A5B6B]">({selected.length} selected)</span></legend>
          <p className="text-xs leading-relaxed text-[#4A5B6B]">Select the access this group should have. Saving an empty selection removes all group permissions.</p>
          {!canViewPermissions ? <p role="alert" className="text-sm text-[#A6192E]">You need VIEW_PERMISSIONS to select permissions.</p> : loading ? <p role="status" className="py-4 text-sm text-[#4A5B6B]">Loading permissions…</p> : error ? <div role="alert" className="text-sm text-[#A6192E]">{error}<button type="button" onClick={() => { setLoading(true); setError(""); setReload(reload + 1); }} className="ml-3 underline">Try again</button></div> : <>
            {unavailable && <label className="flex items-start gap-3 rounded-xl border border-[#A6192E33] bg-[#A6192E0D] p-4 text-sm"><input type="checkbox" checked={replace} onChange={(event) => setReplace(event.target.checked)} className="mt-1 accent-[#00629B]" /><span>Some existing permissions could not be loaded. Replace this group’s permissions with the selection below.</span></label>}
            <label htmlFor="permission-filter" className="sr-only">Search available permissions</label><input id="permission-filter" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search available permissions" className={fieldClass} />
            <div className="grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {filtered.map((record) => <label key={record.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selected.includes(record.id) ? "border-[#00629B] bg-[#00629B0D]" : "border-[#0B1B2B26] bg-[#F7F9FB]"}`}>
                <input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, record.id] : current.filter((id) => id !== record.id))} className="mt-1 h-4 w-4 shrink-0 accent-[#00629B]" />
                <span className="min-w-0"><span className="block break-all font-mono text-xs font-medium text-[#00629B]">{record.permission_code}</span><span className="mt-1 block text-xs leading-relaxed text-[#4A5B6B]">{record.description || "No description"}</span></span>
              </label>)}
            </div>
            {filtered.length === 0 && <p className="text-sm text-[#4A5B6B]">{search ? "No permissions match your search." : "No permissions are available."}</p>}
          </>}
        </fieldset>
      </>}
      <div className="flex justify-end gap-3 border-t border-[#0B1B2B14] pt-5"><button type="button" disabled={pending} onClick={onClose} className={buttonClass}>Cancel</button><button type="submit" disabled={pending || blocked} className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${mode === "delete" ? "bg-[#A6192E]" : "bg-[#00629B] hover:bg-[#005282]"}`}>{pending ? "Saving…" : mode === "delete" ? "Delete group" : mode === "assign" ? "Save permissions" : "Save group"}</button></div>
    </form>
  </dialog>;
}

export default function UserGroupsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const canView = hasPermission(user, "VIEW_USERGROUPS");
  const canCreate = hasPermission(user, "CREATE_USERGROUP");
  const canUpdate = hasPermission(user, "UPDATE_USERGROUP");
  const canDelete = hasPermission(user, "DELETE_USERGROUP");
  const canAssign = hasPermission(user, "ASSIGN_USERGROUP_PERMISSIONS");
  const canViewPermissions = hasPermission(user, "VIEW_PERMISSIONS");
  const [catalogue, setCatalogue] = useState<UserGroupCatalogue | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pending, setPending] = useState(false);
  const [manualId, setManualId] = useState("");
  const request = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    if (!canView) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      let result = await loadUserGroups(page, controller.signal);
      if (controller.signal.aborted) return;
      if (page > result.last_page) {
        result = await loadUserGroups(result.last_page, controller.signal);
        if (controller.signal.aborted) return;
        setPage(result.current_page);
      }
      setCatalogue(result);
      setError("");
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load user groups.");
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, [canView, page]);
  useEffect(() => {
    let disposed = false;
    void Promise.resolve().then(() => { if (!disposed) return load(); });
    return () => { disposed = true; request.current?.abort(); };
  }, [load]);
  function refresh() { setLoading(true); setError(""); void load(); }
  function goToPage(next: number) { setLoading(true); setError(""); setSearch(""); setPage(next); }
  async function save(body: GroupForm) {
    if (!selection || pending) return;
    const { mode, group } = selection;
    const allowed = mode === "create" ? canCreate : mode === "edit" ? canUpdate : mode === "assign" ? canAssign : canDelete;
    if (!allowed) { toast.error("You do not have permission to perform this action."); return; }
    setPending(true);
    try {
      const result = await userGroupRequest(mode === "create" ? "" : mode === "assign" ? "/assign-permissions" : `/${group!.id}`, mode === "create" || mode === "assign" ? "POST" : mode === "edit" ? "PUT" : "DELETE", mode === "delete" ? undefined : mode === "assign" ? { user_group_id: group!.id, permissions: body.permissions } : body);
      toast.success(result?.message || (mode === "delete" ? "User group deleted." : "User group saved."));
      setSelection(null);
      const response = await protectedFetch("/api/auth/me");
      const profile = await response.json();
      if (!response.ok) throw new Error(profile.error || "Unable to refresh account permissions.");
      dispatch(profileReceived(profile));
      if (hasPermission(profile, "VIEW_USERGROUPS")) { setLoading(true); await load(); }
      else setCatalogue(null);
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : "Unable to save the user group."); }
    finally { setPending(false); }
  }
  const filtered = (catalogue?.data ?? []).filter((group) => `${group.group_name} ${group.group_description ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const manualGroup: UserGroup = { id: Number(manualId), group_name: "", group_description: "", permissions: null };
  return <AdminShell>{!canManageUserGroups(user) ? <section className="rounded-3xl border border-[#0B1B2B14] bg-white p-8"><h1 className="text-2xl font-semibold">User group management is unavailable</h1><p className="mt-3 text-sm text-[#4A5B6B]">Your account does not have permission to access this workspace.</p></section> : <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-medium tracking-[1.5px] text-[#00629B] uppercase">Administration</p><h1 className="mt-3 text-3xl font-semibold tracking-[-1px]">User groups</h1><p className="mt-3 text-sm text-[#4A5B6B]">Manage roles and select the permissions available to each group.</p></div>{canCreate && <button onClick={() => setSelection({ mode: "create" })} disabled={pending} className="rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#005282] disabled:opacity-50">Create user group</button>}</header>
    {canView ? <section className="overflow-hidden rounded-3xl border border-[#0B1B2B14] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B1B2B14] p-6"><div><h2 className="text-lg font-semibold">Group catalogue</h2><p className="mt-1 text-xs text-[#4A5B6B]">{catalogue?.total ?? 0} groups</p></div><div className="flex items-center gap-3"><label htmlFor="group-search" className="sr-only">Search this page</label><input id="group-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page" className={fieldClass} /><button disabled={loading || pending} onClick={refresh} className={buttonClass}>Refresh</button></div></div>
      {loading ? <p role="status" className="p-8 text-sm text-[#4A5B6B]">Loading user groups…</p> : error ? <div role="alert" className="p-8 text-sm text-[#A6192E]">{error}<button onClick={refresh} className="ml-3 underline">Try again</button></div> : filtered.length === 0 ? <p className="p-8 text-sm text-[#4A5B6B]">{search ? "No groups on this page match your search." : "No user groups have been created yet."}</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#F7F9FB] text-xs text-[#4A5B6B]"><tr><th scope="col" className="px-6 py-4">Group</th><th scope="col" className="px-6 py-4">Description</th><th scope="col" className="px-6 py-4">Permissions</th><th scope="col" className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#0B1B2B14]">{filtered.map((group) => <tr key={group.id}><td className="px-6 py-5 font-medium">{group.group_name}<span className="mt-1 block text-xs font-normal text-[#4A5B6B]">ID {group.id}</span></td><td className="min-w-48 px-6 py-5 text-[#4A5B6B]">{group.group_description || "No description"}</td><td className="px-6 py-5 text-[#4A5B6B]">{group.permissions === null ? "Unavailable" : group.permissions.length}</td><td className="px-6 py-5"><div className="flex justify-end gap-2">{canUpdate && <button disabled={pending} onClick={() => setSelection({ mode: "edit", group })} aria-label={`Edit ${group.group_name}`} className={buttonClass}>Edit</button>}{canAssign && <button disabled={pending} onClick={() => setSelection({ mode: "assign", group })} aria-label={`Assign permissions to ${group.group_name}`} className={buttonClass}>Permissions</button>}{canDelete && <button disabled={pending} onClick={() => setSelection({ mode: "delete", group })} aria-label={`Delete ${group.group_name}`} className={`${buttonClass} text-[#A6192E]`}>Delete</button>}</div></td></tr>)}</tbody></table></div>}
      {catalogue && <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#0B1B2B14] px-6 py-4"><p className="text-xs text-[#4A5B6B]">Showing {catalogue.from ?? 0}–{catalogue.to ?? 0} of {catalogue.total} groups</p><nav aria-label="User group pages" className="flex items-center gap-3"><button disabled={loading || pending || page <= 1} onClick={() => goToPage(page - 1)} className={buttonClass}>Previous</button><span className="text-xs text-[#4A5B6B]">Page {page} of {catalogue.last_page}</span><button disabled={loading || pending || page >= catalogue.last_page} onClick={() => goToPage(page + 1)} className={buttonClass}>Next</button></nav></div>}
    </section> : <section className="rounded-3xl border border-[#0B1B2B14] bg-white p-6"><h2 className="text-lg font-semibold">Catalogue access is restricted</h2><p className="mt-3 text-sm text-[#4A5B6B]">You need VIEW_USERGROUPS to browse groups. You can use your assigned actions by group ID.</p>{(canUpdate || canAssign || canDelete) && <div className="mt-5 flex flex-wrap items-end gap-3"><div><label htmlFor="manual-group-id" className="mb-2 block text-sm font-medium">Group ID</label><input id="manual-group-id" type="number" min="1" step="1" value={manualId} onChange={(event) => setManualId(event.target.value)} className={fieldClass} /></div>{([...(canUpdate ? ["edit"] : []), ...(canAssign ? ["assign"] : []), ...(canDelete ? ["delete"] : [])] as Mode[]).map((mode) => <button key={mode} disabled={!/^[1-9]\d*$/.test(manualId) || pending} onClick={() => setSelection({ mode, group: manualGroup })} className={buttonClass}>{mode === "assign" ? "Assign permissions" : mode === "edit" ? "Edit by ID" : "Delete by ID"}</button>)}</div>}</section>}
    {selection && <UserGroupDialog selection={selection} pending={pending} canViewPermissions={canViewPermissions} onClose={() => setSelection(null)} onSubmit={save} />}
  </div>}</AdminShell>;
}
