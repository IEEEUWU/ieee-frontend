"use client";

import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDots,
  UsersThree,
  QrCode,
  Buildings,
} from "@phosphor-icons/react";
import { AdminShell, useAdminUser } from "@/components/admin/admin-shell";
import {
  getStoredUnits,
  getStoredEvents,
  getStoredSubmissions,
  getStoredAttendance,
  getStoredAuditLogs,
  hasPermission,
} from "@/lib/srs-data";

export default function AdminDashboardPage() {
  const { user } = useAdminUser();
  const units = getStoredUnits();
  const events = getStoredEvents();
  const submissions = getStoredSubmissions();
  const attendance = getStoredAttendance();
  const auditLogs = getStoredAuditLogs();

  // Filter scoped data based on role
  const isGlobal = user.role === "sb_webmaster" || user.role === "sb_secretary";
  const accessibleUnits = isGlobal
    ? units
    : units.filter((u) => u.id === user.assignedUnitId);

  const accessibleEvents = isGlobal
    ? events
    : user.role === "unit_webmaster"
      ? events.filter((e) => e.unitId === user.assignedUnitId)
      : events.filter((e) => e.id === user.assignedEventId);

  const participantSubs = submissions.filter((s) => s.purpose === "participant");
  const ocSubs = submissions.filter((s) => s.purpose === "oc");
  const attendedCount = attendance.filter((a) => a.status === "attended").length;

  // Permission capabilities inspector (FR-AUTH-12)
  const permissionsList = [
    {
      feature: "Edit Unit Metadata & Advisors",
      granted: hasPermission(user, "unit.details.manage", "UNIT", user.assignedUnitId || "sb"),
      rule: "FR-UNIT-01",
    },
    {
      feature: "Manage Executive Committee (BOD)",
      granted: hasPermission(user, "unit.bod.manage", "UNIT", user.assignedUnitId || "sb"),
      rule: "FR-BOD-05",
    },
    {
      feature: "Publish / Cancel Events",
      granted: hasPermission(user, "event.publish", "UNIT", user.assignedUnitId || "sb"),
      rule: "FR-EVT-07",
    },
    {
      feature: "View Participant Registrations",
      granted: hasPermission(user, "registration.view", "EVENT", "evt-cs-hackathon"),
      rule: "FR-RESP-01",
    },
    {
      feature: "View OC Applications",
      granted: hasPermission(user, "oc.view", "EVENT", "evt-cs-hackathon"),
      rule: "FR-RESP-01",
    },
    {
      feature: "Scan Attendee QR Codes",
      granted: hasPermission(user, "attendance.scan", "EVENT", "evt-cs-hackathon"),
      rule: "FR-QR-04",
    },
    {
      feature: "Manage User Accounts & RBAC Grants",
      granted: user.role === "sb_webmaster",
      rule: "FR-AUTH-10",
    },
  ];

  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-2 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                ROLE-SCOPED DASHBOARD (FR-ADM-01)
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
                Welcome, {user.name}
              </h1>
              <p className="text-sm text-[#4A5B6B]">
                Operating as{" "}
                <strong className="font-semibold text-[#111111]">
                  {user.role.replace("_", " ").toUpperCase()}
                </strong>{" "}
                ({user.email}). Scope:{" "}
                <span className="font-mono text-xs font-bold text-[#00629B]">
                  {isGlobal ? "Global All 5 Units" : user.assignedUnitId?.toUpperCase() || "Assigned Event"}
                </span>
              </p>
            </div>

            <Link
              href="/admin/login"
              className="rounded-full border border-[#D9D9D9] bg-[#F7F9FB] px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#EBF2F7]"
            >
              Switch Role Persona
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Accessible Units</span>
            <span className="font-mono text-2xl font-bold text-[#111111]">{accessibleUnits.length}</span>
            <span className="text-xs text-[#667585]">of 5 Chartered Units</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Active Events</span>
            <span className="font-mono text-2xl font-bold text-[#00629B]">{accessibleEvents.length}</span>
            <span className="text-xs text-[#667585]">Published or Draft</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Registrations</span>
            <span className="font-mono text-2xl font-bold text-[#111111]">{participantSubs.length}</span>
            <span className="text-xs text-[#667585]">Participant Passes</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">OC Applicants</span>
            <span className="font-mono text-2xl font-bold text-[#111111]">{ocSubs.length}</span>
            <span className="text-xs text-[#667585]">Committee Intake</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Checked In</span>
            <span className="font-mono text-2xl font-bold text-[#00843D]">{attendedCount}</span>
            <span className="text-xs text-[#667585]">Verified Attendee Passes</span>
          </div>
        </div>

        {/* Two-Column Section: Effective Permissions Matrix + Quick Modules */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Effective Permissions Matrix (FR-AUTH-12) */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#00629B]" weight="bold" />
                <h2 className="font-bold text-sm text-[#111111]">
                  Effective Access Inspection (FR-AUTH-12)
                </h2>
              </div>
              <span className="font-mono text-[11px] uppercase text-[#667585]">
                BASELINE & GRANTS
              </span>
            </div>

            <p className="text-xs text-[#4A5B6B]">
              This matrix computes the effective permissions for the active persona according to the SRS authorization matrix and the Access Grants table:
            </p>

            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {permissionsList.map((perm) => (
                <div key={perm.feature} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#111111]">{perm.feature}</span>
                    <span className="font-mono text-[10px] text-[#667585]">{perm.rule}</span>
                  </div>
                  {perm.granted ? (
                    <span className="flex items-center gap-1 font-semibold text-[#00843D]">
                      <CheckCircle size={16} weight="fill" />
                      Permitted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-[#A6192E]">
                      <XCircle size={16} weight="fill" />
                      Denied / Grant Req.
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Operation Modules */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <h2 className="font-bold text-sm text-[#111111] border-b border-[#E2E8F0] pb-3">
              Quick Administrative Tasks
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/admin/events"
                className="flex flex-col gap-1 rounded-xl border border-[#D9D9D9] p-4 transition-colors hover:border-[#00629B] hover:bg-[#F7F9FB]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#00629B]">
                  <CalendarDots size={16} weight="bold" />
                  Events & Form Scheduler
                </div>
                <p className="text-xs text-[#667585]">
                  Open/close registration windows and configure form schemas (FR-FORM-03).
                </p>
              </Link>

              <Link
                href="/admin/events/evt-cs-hackathon/responses"
                className="flex flex-col gap-1 rounded-xl border border-[#D9D9D9] p-4 transition-colors hover:border-[#00629B] hover:bg-[#F7F9FB]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#00629B]">
                  <UsersThree size={16} weight="bold" />
                  Response Manager
                </div>
                <p className="text-xs text-[#667585]">
                  View participant lists, OC submissions, and export sanitized CSV (FR-RESP-04).
                </p>
              </Link>

              <Link
                href="/admin/attendance/evt-cs-hackathon"
                className="flex flex-col gap-1 rounded-xl border border-[#D9D9D9] p-4 transition-colors hover:border-[#00629B] hover:bg-[#F7F9FB]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#00629B]">
                  <QrCode size={16} weight="bold" />
                  Real-Time QR Scanner
                </div>
                <p className="text-xs text-[#667585]">
                  Check-in attendees with barcode simulator and duplicate scan guard (FR-QR-06).
                </p>
              </Link>

              <Link
                href="/admin/units"
                className="flex flex-col gap-1 rounded-xl border border-[#D9D9D9] p-4 transition-colors hover:border-[#00629B] hover:bg-[#F7F9FB]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#00629B]">
                  <Buildings size={16} weight="bold" />
                  Units & Term Handover
                </div>
                <p className="text-xs text-[#667585]">
                  Manage unit profiles, faculty advisors, and Junior/Senior BOD terms (FR-BOD-05).
                </p>
              </Link>
            </div>

            {user.role === "sb_webmaster" ? (
              <div className="mt-2 rounded-xl border border-[#00629B33] bg-[#00629B0A] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#00629B]">
                      Access Grants & RBAC Table
                    </span>
                    <span className="text-xs text-[#4A5B6B]">
                      Delegate fine-grained access grants to project chairs and check-in desks.
                    </span>
                  </div>
                  <Link
                    href="/admin/access"
                    className="rounded-full bg-[#00629B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005282]"
                  >
                    Manage Grants
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Recent Audit Log Snippets (FR-ADM-02, FR-AUTH-13) */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#667585]" weight="bold" />
              <h2 className="font-bold text-sm text-[#111111]">
                Protected System Audit Log (FR-ADM-02)
              </h2>
            </div>
            <span className="font-mono text-xs text-[#667585]">
              {auditLogs.length} LOGGED OPERATIONS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] font-mono text-[#667585]">
                  <th className="py-2.5 pr-4 font-semibold">TIMESTAMP</th>
                  <th className="py-2.5 px-4 font-semibold">ACTOR</th>
                  <th className="py-2.5 px-4 font-semibold">ACTION</th>
                  <th className="py-2.5 px-4 font-semibold">RESOURCE</th>
                  <th className="py-2.5 pl-4 font-semibold">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F9FB]">
                    <td className="py-2.5 pr-4 font-mono text-[#667585]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#111111]">
                      {log.actorName}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="rounded-md bg-[#F7F9FB] border border-[#D9D9D9] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00629B]">
                        {log.action}
                      </span>
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
      </div>
    </AdminShell>
  );
}
