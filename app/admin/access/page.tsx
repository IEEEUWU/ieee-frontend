"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldWarning,
  Plus,
  CheckCircle,
} from "@phosphor-icons/react";
import { AdminShell, useAdminUser } from "@/components/admin/admin-shell";
import {
  getStoredGrants,
  addAccessGrant,
  revokeAccessGrant,
  getStoredAuditLogs,
  INITIAL_ADMIN_USERS,
  getStoredEvents,
  getStoredUnits,
  type AccessGrant,
  type FeatureKey,
  type AuditLogEntry,
} from "@/lib/srs-data";

export default function AdminAccessPage() {
  const { user } = useAdminUser();
  const [grants, setGrants] = useState<AccessGrant[]>(() => getStoredGrants());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStoredAuditLogs());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AccessGrant | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [notice, setNotice] = useState("");

  // Form states for new grant
  const [selectedUserId, setSelectedUserId] = useState(INITIAL_ADMIN_USERS[3].id);
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey>("registration.view");
  const [selectedScopeType, setSelectedScopeType] = useState<"GLOBAL" | "UNIT" | "EVENT">("EVENT");
  const [selectedScopeId, setSelectedScopeId] = useState("evt-cs-hackathon");

  // Non-Delegable Admin Check: Only SB Webmaster manages accounts and grants (FR-AUTH-10, BR-10)
  if (user.role !== "sb_webmaster") {
    return (
      <AdminShell>
        <div className="flex items-start gap-4 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-8">
          <ShieldWarning size={32} weight="fill" className="shrink-0 text-[#A6192E]" />
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-bold text-[#A6192E]">
              403 FORBIDDEN: NON-DELEGABLE ADMIN AUTHORITY (FR-AUTH-10 / BR-10)
            </h1>
            <p className="text-sm text-[#4A5B6B]">
              Only the <strong className="text-[#111111]">SB Webmaster</strong> possesses the authority to create administrative accounts and allocate granular feature grants.
              Your current role (<span className="font-mono text-xs font-bold text-[#A6192E]">{user.role.toUpperCase()}</span>) is barred from inspecting or altering the Access Grants table.
            </p>
            <p className="text-xs text-[#667585]">
              To test this view, use the Role Switcher in the top right header to switch to <strong className="text-[#111111]">Kavindu Dimal (SB Webmaster)</strong>.
            </p>
            <Link
              href="/admin"
              className="mt-2 inline-flex w-fit items-center gap-1 font-semibold text-[#00629B] hover:underline text-xs"
            >
              &larr; Return to Dashboard
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  const handleCreateGrant = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = INITIAL_ADMIN_USERS.find((u) => u.id === selectedUserId);
    if (!targetUser) return;

    addAccessGrant(
      {
        userId: targetUser.id,
        userName: targetUser.name,
        featureKey: selectedFeature,
        scopeType: selectedScopeType,
        scopeId: selectedScopeType === "GLOBAL" ? "GLOBAL" : selectedScopeId,
        grantedBy: `${user.name} (SB Webmaster)`,
      },
      user,
    );

    setGrants(getStoredGrants());
    setAuditLogs(getStoredAuditLogs());
    setShowCreateModal(false);
    setNotice(`Successfully issued ${selectedFeature} grant to ${targetUser.name} (FR-AUTH-04).`);
    setTimeout(() => setNotice(""), 4000);
  };

  const handleExecuteRevoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeTarget || !revokeReason.trim()) return;

    revokeAccessGrant(revokeTarget.grantId, revokeReason.trim(), user);
    setGrants(getStoredGrants());
    setAuditLogs(getStoredAuditLogs());
    setRevokeTarget(null);
    setRevokeReason("");
    setNotice(`Grant revoked immediately with audit attribution (FR-AUTH-09, AT-06).`);
    setTimeout(() => setNotice(""), 4000);
  };

  const events = getStoredEvents();
  const units = getStoredUnits();

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                AUTHORIZATION GOVERNANCE (FR-AUTH-04, FR-AUTH-05)
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Access Table & Explicit Feature Grants
            </h1>
            <p className="text-xs text-[#4A5B6B]">
              Only the SB Webmaster can allocate granular permissions per unit or event resource. Default denial applies to unlisted operations (BR-06).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#00629B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#005282]"
          >
            <Plus size={16} weight="bold" />
            Create Feature Grant
          </button>
        </div>

        {notice ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#00843D33] bg-[#00843D0D] p-4 text-xs font-semibold text-[#00843D]">
            <CheckCircle size={18} weight="fill" />
            {notice}
          </div>
        ) : null}

        {/* Access Grants Table (FR-AUTH-05) */}
        <div className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-white shadow-xs">
          <div className="border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="font-bold text-sm text-[#111111]">
              Active & Revoked Permission Grants ({grants.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F7F9FB] font-mono text-[#667585]">
                  <th className="py-3 px-4 font-semibold">GRANT ID</th>
                  <th className="py-3 px-4 font-semibold">USER</th>
                  <th className="py-3 px-4 font-semibold">FEATURE KEY</th>
                  <th className="py-3 px-4 font-semibold">SCOPE</th>
                  <th className="py-3 px-4 font-semibold">RESOURCE TARGET</th>
                  <th className="py-3 px-4 font-semibold">GRANTED BY</th>
                  <th className="py-3 px-4 font-semibold">STATUS</th>
                  <th className="py-3 px-4 text-right font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {grants.map((grant) => (
                  <tr key={grant.grantId} className="hover:bg-[#F7F9FB]">
                    <td className="py-3 px-4 font-mono text-[#667585]">{grant.grantId}</td>
                    <td className="py-3 px-4 font-bold text-[#111111]">{grant.userName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#00629B]">
                      {grant.featureKey}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md border border-[#D9D9D9] bg-[#F7F9FB] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111111]">
                        {grant.scopeType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#4A5B6B]">{grant.scopeId}</td>
                    <td className="py-3 px-4 text-[#667585]">{grant.grantedBy}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                          grant.status === "active"
                            ? "bg-[#00843D1A] text-[#00843D]"
                            : "bg-[#A6192E1A] text-[#A6192E]"
                        }`}
                      >
                        {grant.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {grant.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => setRevokeTarget(grant)}
                          className="rounded-lg border border-[#A6192E33] bg-[#A6192E0D] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#A6192E] hover:bg-[#A6192E1A]"
                        >
                          Revoke Grant
                        </button>
                      ) : (
                        <span className="font-mono text-[10px] text-[#667585]">
                          {grant.revocationReason || "Revoked"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Table (FR-AUTH-13) */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="font-bold text-sm text-[#111111]">
              Immutable Security & Authorization Audit Trail (FR-AUTH-13)
            </h2>
            <span className="font-mono text-xs text-[#667585]">
              {auditLogs.length} AUDIT ENTRIES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] font-mono text-[#667585]">
                  <th className="py-2.5 pr-4 font-semibold">TIME</th>
                  <th className="py-2.5 px-4 font-semibold">ACTOR</th>
                  <th className="py-2.5 px-4 font-semibold">ACTION</th>
                  <th className="py-2.5 px-4 font-semibold">RESOURCE</th>
                  <th className="py-2.5 pl-4 font-semibold">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F9FB]">
                    <td className="py-2.5 pr-4 font-mono text-[#667585]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#111111]">{log.actorName}</td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-[#00629B] font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#667585]">
                      {log.resourceType}:{log.resourceId}
                    </td>
                    <td className="py-2.5 pl-4 text-[#4A5B6B]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Grant Modal (FR-AUTH-04) */}
        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex w-full max-w-lg flex-col gap-4 rounded-3xl border border-[#D9D9D9] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="font-bold text-sm text-[#111111]">
                  Create Fine-Grained Feature Grant (FR-AUTH-04)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs text-[#667585] hover:text-[#111111]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGrant} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111111]">Target User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                  >
                    {INITIAL_ADMIN_USERS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111111]">Feature Key</label>
                  <select
                    value={selectedFeature}
                    onChange={(e) => setSelectedFeature(e.target.value as FeatureKey)}
                    className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                  >
                    <option value="registration.view">registration.view (View Participant Passes)</option>
                    <option value="registration.export">registration.export (Export CSV)</option>
                    <option value="oc.view">oc.view (View OC Applications)</option>
                    <option value="attendance.scan">attendance.scan (Scan QR Attendance)</option>
                    <option value="attendance.correct">attendance.correct (Correct Scan Records)</option>
                    <option value="event.manage">event.manage (Edit Event)</option>
                    <option value="event.publish">event.publish (Publish/Cancel Event)</option>
                    <option value="unit.details.manage">unit.details.manage (Edit Unit)</option>
                    <option value="unit.bod.manage">unit.bod.manage (Manage BOD)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#111111]">Scope Type</label>
                    <select
                      value={selectedScopeType}
                      onChange={(e) =>
                        setSelectedScopeType(e.target.value as "GLOBAL" | "UNIT" | "EVENT")
                      }
                      className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                    >
                      <option value="EVENT">EVENT SCOPE</option>
                      <option value="UNIT">UNIT SCOPE</option>
                      <option value="GLOBAL">GLOBAL SCOPE</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#111111]">Resource ID</label>
                    {selectedScopeType === "EVENT" ? (
                      <select
                        value={selectedScopeId}
                        onChange={(e) => setSelectedScopeId(e.target.value)}
                        className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                      >
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} ({ev.id})
                          </option>
                        ))}
                      </select>
                    ) : selectedScopeType === "UNIT" ? (
                      <select
                        value={selectedScopeId}
                        onChange={(e) => setSelectedScopeId(e.target.value)}
                        className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                      >
                        {units.map((un) => (
                          <option key={un.id} value={un.id}>
                            {un.name} ({un.id})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value="GLOBAL APEX"
                        className="rounded-xl border border-[#D9D9D9] bg-[#F7F9FB] p-2.5 text-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-[#D9D9D9] px-4 py-2 text-xs font-semibold text-[#667585]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#00629B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#005282]"
                  >
                    Issue Grant
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Revocation Modal (FR-AUTH-09) */}
        {revokeTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-[#D9D9D9] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="font-bold text-sm text-[#A6192E]">
                  Revoke Permission Grant (FR-AUTH-09)
                </h3>
                <button
                  type="button"
                  onClick={() => setRevokeTarget(null)}
                  className="text-xs text-[#667585] hover:text-[#111111]"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#4A5B6B]">
                Revoking grant <strong className="text-[#111111]">{revokeTarget.grantId}</strong> ({revokeTarget.featureKey}) from <strong className="text-[#111111]">{revokeTarget.userName}</strong>.
                Revocation takes effect immediately on the next request (AT-06).
              </p>

              <form onSubmit={handleExecuteRevoke} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111111]">
                    Revocation Reason (Mandatory for Audit Trail)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Committee rotation / Project scope concluded"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    required
                    className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#A6192E]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRevokeTarget(null)}
                    className="rounded-xl border border-[#D9D9D9] px-4 py-2 text-xs font-semibold text-[#667585]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!revokeReason.trim()}
                    className="rounded-xl bg-[#A6192E] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8C1526] disabled:opacity-40"
                  >
                    Confirm Immediate Revocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
