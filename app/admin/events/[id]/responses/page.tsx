"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  DownloadSimple,
  MagnifyingGlass,
  ShieldWarning,
  CheckCircle,
  ArrowLeft,
} from "@phosphor-icons/react";
import { AdminShell, useAdminUser } from "@/components/admin/admin-shell";
import {
  getStoredEvents,
  getStoredSubmissions,
  sanitizeForCsv,
  hasPermission,
  setSubmissionStatus,
  reissueQrToken,
  type Submission,
} from "@/lib/srs-data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventResponsesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { user } = useAdminUser();
  const events = getStoredEvents();
  const event = events.find((e) => e.id === eventId || e.slug === eventId) ?? null;

  const [submissions, setSubmissions] = useState<Submission[]>(() => getStoredSubmissions());
  const [activeTab, setActiveTab] = useState<"participant" | "oc">("participant");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");

  if (!event) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-32">
          <p className="font-mono text-sm uppercase text-[#667585]">Event Not Found</p>
          <Link href="/admin/events" className="mt-3 font-semibold text-[#00629B]">
            &larr; Back to Events
          </Link>
        </div>
      </AdminShell>
    );
  }

  // Segregated Permission Gates (FR-RESP-01, FR-AUTH-03, FR-AUTH-06, FR-AUTH-07, AT-04, AT-05, SRS §4.2)
  // SB Secretary has default unrestricted read rights across all units (FR-AUTH-03, FR-RESP-01)
  // Unit Webmasters & others require explicit feature grants per event/unit
  const hasParticipantView =
    user.role === "sb_webmaster" ||
    user.role === "sb_secretary" ||
    hasPermission(user, "registration.view", "EVENT", event.id);

  const hasOcView =
    user.role === "sb_webmaster" ||
    user.role === "sb_secretary" ||
    hasPermission(user, "oc.view", "EVENT", event.id);

  // If user has neither permission on this event, deny page access completely (FR-AUTH-06)
  if (!hasParticipantView && !hasOcView) {
    return (
      <AdminShell>
        <div className="flex items-start gap-4 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-8">
          <ShieldWarning size={32} weight="fill" className="shrink-0 text-[#A6192E]" />
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-bold text-[#A6192E]">
              403 FORBIDDEN: RESPONSE ACCESS DENIED (BR-15 / FR-AUTH-06 / FR-AUTH-07)
            </h1>
            <p className="text-sm text-[#4A5B6B]">
              Your active persona (<strong className="text-[#111111]">{user.name}</strong>, role:{" "}
              <span className="font-mono text-xs font-bold text-[#A6192E]">{user.role.toUpperCase()}</span>)
              does not possess <code className="font-mono text-xs">registration.view</code> or <code className="font-mono text-xs">oc.view</code> authority on event{" "}
              <strong className="text-[#111111]">{event.title}</strong>.
            </p>
            <p className="text-xs text-[#667585]">
              Per SRS §4.2 Baseline Matrix & FR-AUTH-07, Unit Webmasters and delegates require an explicit grant to inspect private delegate or applicant records.
            </p>
            <Link
              href="/admin/events"
              className="mt-2 inline-flex w-fit items-center gap-1 font-semibold text-[#00629B] hover:underline text-xs"
            >
              &larr; Return to Event Catalog
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  const canViewCurrentTab = activeTab === "participant" ? hasParticipantView : hasOcView;

  // Export gate (FR-RESP-04, Baseline Matrix §4.2): Only SB Webmaster has default export rights (A).
  // All other roles require explicit registration.export or oc.export grants.
  const canExportCurrentTab =
    user.role === "sb_webmaster" ||
    (activeTab === "participant"
      ? hasPermission(user, "registration.export", "EVENT", event.id)
      : hasPermission(user, "oc.export", "EVENT", event.id));

  const eventSubs = submissions.filter((s) => s.eventId === event.id && s.purpose === activeTab);
  const filteredSubs = eventSubs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.attendeeName.toLowerCase().includes(q) ||
      s.referenceCode.toLowerCase().includes(q) ||
      s.attendeeEmail.toLowerCase().includes(q) ||
      (s.studentRegNo && s.studentRegNo.toLowerCase().includes(q))
    );
  });

  // Formula-Sanitized CSV Export (FR-RESP-04, NFR-SEC-04, AT-21)
  const handleExportCsv = () => {
    if (!canExportCurrentTab) {
      alert(
        `Permission Denied: You lack explicit ${
          activeTab === "participant" ? "registration.export" : "oc.export"
        } authority on this event (FR-AUTH-07, SRS §4.2 Baseline Matrix).`,
      );
      return;
    }

    if (filteredSubs.length === 0) {
      alert("No responses available to export.");
      return;
    }

    const headers =
      activeTab === "participant"
        ? ["Reference Code", "Attendee Name", "Email", "Reg Number", "Phone", "Status", "Submitted At", "QR Token"]
        : ["Application Code", "Applicant Name", "Email", "Reg Number", "Phone", "Status", "Submitted At"];

    const rows = filteredSubs.map((s) => {
      if (activeTab === "participant") {
        return [
          sanitizeForCsv(s.referenceCode),
          sanitizeForCsv(s.attendeeName),
          sanitizeForCsv(s.attendeeEmail),
          sanitizeForCsv(s.studentRegNo || ""),
          sanitizeForCsv(s.phone || ""),
          sanitizeForCsv(s.status),
          sanitizeForCsv(s.submittedAt),
          sanitizeForCsv(s.qrToken || ""),
        ];
      } else {
        return [
          sanitizeForCsv(s.referenceCode),
          sanitizeForCsv(s.attendeeName),
          sanitizeForCsv(s.attendeeEmail),
          sanitizeForCsv(s.studentRegNo || ""),
          sanitizeForCsv(s.phone || ""),
          sanitizeForCsv(s.status),
          sanitizeForCsv(s.submittedAt),
        ];
      }
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.slug}-${activeTab}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotice(`Exported ${rows.length} formula-sanitized records to CSV (NFR-SEC-04).`);
    setTimeout(() => setNotice(""), 3500);
  };

  // Registration Revocation / Invalidation with Audit Logging (FR-RESP-06)
  const handleToggleInvalidate = (sub: Submission) => {
    const newStatus = sub.status === "valid" ? "invalidated" : "valid";
    setSubmissionStatus(sub.id, newStatus, user, "Toggled via response audit console");
    setSubmissions(getStoredSubmissions());
    setNotice(
      `Registration ${sub.referenceCode} status changed to ${newStatus.toUpperCase()} (FR-RESP-06).`,
    );
    setTimeout(() => setNotice(""), 3500);
  };

  // Token Reissuance for SB Webmaster (FR-QR-11, AT-16)
  const handleReissueQr = (sub: Submission) => {
    const res = reissueQrToken(sub.id, user);
    if (res.success) {
      setSubmissions(getStoredSubmissions());
      setNotice(`Reissued QR credential for ${sub.attendeeName} (${sub.referenceCode}): ${res.newQrToken}`);
      setTimeout(() => setNotice(""), 4500);
    } else {
      alert(res.message);
    }
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#667585] hover:text-[#00629B]"
        >
          <ArrowLeft size={14} weight="bold" />
          Back to Events Catalog
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                RESPONSE AUDIT DESK (FR-RESP-01)
              </span>
              <span className="rounded-md border border-[#D9D9D9] bg-[#F7F9FB] px-2 py-0.5 font-mono text-[10px] font-bold text-[#667585]">
                {event.unitId.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              {event.title}: Submissions
            </h1>
            <p className="text-xs text-[#4A5B6B]">
              Viewing as{" "}
              <strong className="text-[#111111]">{user.name}</strong> ({user.role.toUpperCase()}).
              Formula-injection sanitized export available.
            </p>
          </div>

          {/* Export Action */}
          <button
            type="button"
            onClick={handleExportCsv}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
              canExportCurrentTab
                ? "bg-[#00629B] text-white hover:bg-[#005282]"
                : "border border-[#D9D9D9] bg-[#F7F9FB] text-[#8796A5] cursor-not-allowed"
            }`}
            title={
              canExportCurrentTab
                ? "Export to formula-sanitized CSV"
                : "Requires explicit registration.export or oc.export grant (FR-AUTH-07)"
            }
          >
            <DownloadSimple size={16} weight="bold" />
            {canExportCurrentTab ? "Export CSV (Sanitized NFR-SEC-04)" : "Export CSV (Grant Required)"}
          </button>
        </div>

        {notice ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#00843D33] bg-[#00843D0D] p-4 text-xs font-semibold text-[#00843D]">
            <CheckCircle size={18} weight="fill" />
            {notice}
          </div>
        ) : null}

        {/* Tab & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex items-center rounded-2xl border border-[#D9D9D9] bg-white p-1">
            <button
              type="button"
              onClick={() => setActiveTab("participant")}
              className={`rounded-xl px-5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "participant"
                  ? "bg-[#00629B] text-white"
                  : "text-[#4A5B6B] hover:text-[#111111]"
              }`}
            >
              Participant Passes ({submissions.filter((s) => s.eventId === event.id && s.purpose === "participant").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("oc")}
              className={`rounded-xl px-5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "oc"
                  ? "bg-[#00629B] text-white"
                  : "text-[#4A5B6B] hover:text-[#111111]"
              }`}
            >
              OC Applications ({submissions.filter((s) => s.eventId === event.id && s.purpose === "oc").length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-72">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667585]"
            />
            <input
              type="text"
              placeholder="Search by name, reference, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#D9D9D9] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#00629B]"
            />
          </div>
        </div>

        {!canViewCurrentTab ? (
          /* Scoped Tab Access Restricted Guard (AT-05) */
          <div className="flex items-start gap-3 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-6">
            <ShieldWarning size={24} weight="fill" className="mt-0.5 shrink-0 text-[#A6192E]" />
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-[#A6192E]">
                TAB SCOPE RESTRICTED: MISSING {activeTab === "participant" ? "REGISTRATION.VIEW" : "OC.VIEW"} PERMISSION (AT-05)
              </span>
              <p className="text-[#4A5B6B]">
                Your account possesses access to the alternate response category on this event, but lacks the distinct{" "}
                <code className="font-mono text-[11px] font-bold text-[#111111]">
                  {activeTab === "participant" ? "registration.view" : "oc.view"}
                </code>{" "}
                permission grant required to inspect these records (FR-AUTH-07, SRS §4.2 Baseline Matrix).
              </p>
            </div>
          </div>
        ) : (
          /* Responses Table */
          <div className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F7F9FB] font-mono text-[#667585]">
                    <th className="py-3 px-4 font-semibold">REFERENCE</th>
                    <th className="py-3 px-4 font-semibold">NAME</th>
                    <th className="py-3 px-4 font-semibold">STUDENT REG NO</th>
                    <th className="py-3 px-4 font-semibold">EMAIL / CONTACT</th>
                    <th className="py-3 px-4 font-semibold">
                      {activeTab === "participant" ? "TRACK" : "PREFERRED SUB-TEAM"}
                    </th>
                    <th className="py-3 px-4 font-semibold">STATUS</th>
                    <th className="py-3 px-4 font-semibold">SUBMITTED AT</th>
                    <th className="py-3 px-4 text-right font-semibold">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredSubs.length > 0 ? (
                    filteredSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F7F9FB]">
                        <td className="py-3 px-4 font-mono font-bold text-[#00629B]">
                          {sub.referenceCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#111111]">
                          {sub.attendeeName}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#667585]">
                          {sub.studentRegNo || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-[#111111]">{sub.attendeeEmail}</span>
                            <span className="font-mono text-[11px] text-[#667585]">{sub.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#4A5B6B]">
                          {activeTab === "participant"
                            ? (sub.answers.trackPreference as string) || "Standard Track"
                            : (sub.answers.subTeams as string) || "General Committee"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${
                              sub.status === "valid"
                                ? "bg-[#00843D1A] text-[#00843D]"
                                : "bg-[#A6192E1A] text-[#A6192E]"
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#667585]">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.role === "sb_webmaster" && activeTab === "participant" ? (
                              <button
                                type="button"
                                onClick={() => handleReissueQr(sub)}
                                className="rounded-lg border border-[#00629B40] bg-[#00629B0D] px-2 py-1 font-mono text-[10px] font-semibold text-[#00629B] hover:bg-[#00629B1A]"
                                title="Revoke old token and reissue new QR credential (FR-QR-11)"
                              >
                                Reissue QR
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleToggleInvalidate(sub)}
                              className="rounded-lg border border-[#D9D9D9] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#667585] hover:border-[#A6192E] hover:text-[#A6192E]"
                            >
                              {sub.status === "valid" ? "Invalidate" : "Revalidate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#667585]">
                        No {activeTab} submissions recorded matching the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
