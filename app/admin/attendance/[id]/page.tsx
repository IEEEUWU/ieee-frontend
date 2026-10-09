"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  ShieldWarning,
  Keyboard,
  Camera,
  ArrowLeft,
} from "@phosphor-icons/react";
import { AdminShell, useAdminUser } from "@/components/admin/admin-shell";
import {
  getStoredEvents,
  getStoredSubmissions,
  getStoredAttendance,
  recordAttendanceCheckIn,
  correctAttendanceRecord,
  hasPermission,
  type AttendanceRecord,
  type Submission,
} from "@/lib/srs-data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminAttendancePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { user } = useAdminUser();
  const events = getStoredEvents();
  const event = events.find((e) => e.id === eventId || e.slug === eventId) ?? null;
  const [submissions, setSubmissions] = useState<Submission[]>(() => getStoredSubmissions());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStoredAttendance());

  // Scan input states
  const [scannedToken, setScannedToken] = useState("");
  const [manualRefCode, setManualRefCode] = useState("");
  const [selectedPresetToken, setSelectedPresetToken] = useState("");

  // Scan Feedback result state (FR-QR-09, AT-12, AT-15, AT-16)
  const [feedback, setFeedback] = useState<{
    code:
      | "VALID"
      | "ALREADY_CHECKED_IN"
      | "INVALID_PASS"
      | "WRONG_EVENT"
      | "UNAUTHORIZED"
      | "EVENT_CANCELLED"
      | "INVALIDATED"
      | null;
    message: string;
    record?: AttendanceRecord;
    priorRecord?: AttendanceRecord;
  }>({ code: null, message: "" });

  // Correction Modal State (FR-QR-12, AT-18)
  const [correctionTarget, setCorrectionTarget] = useState<AttendanceRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionStatus, setCorrectionStatus] = useState<"attended" | "voided">("voided");

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

  // Permission Gate (FR-QR-04, AT-15)
  const canScan =
    user.role === "sb_webmaster" ||
    hasPermission(user, "attendance.scan", "EVENT", event.id);

  if (!canScan) {
    return (
      <AdminShell>
        <div className="flex items-start gap-4 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-8">
          <ShieldWarning size={32} weight="fill" className="shrink-0 text-[#A6192E]" />
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-bold text-[#A6192E]">
              403 FORBIDDEN: SCANNER ACCESS GATED (FR-QR-04 / AT-15)
            </h1>
            <p className="text-sm text-[#4A5B6B]">
              Operator <strong className="text-[#111111]">{user.name}</strong> ({user.role.toUpperCase()}) lacks{" "}
              <code className="font-mono text-xs">attendance.scan</code> rights for event{" "}
              <strong className="text-[#111111]">{event.title}</strong>.
            </p>
            <p className="text-xs text-[#667585]">
              Check-in scanner interfaces are strictly gated to authorized operators or designated Project Chairs.
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

  const eventSubmissions = submissions.filter(
    (s) => s.eventId === event.id && s.purpose === "participant" && s.status === "valid",
  );
  const eventAttendance = attendance.filter((a) => a.eventId === event.id);
  const attendedCount = eventAttendance.filter((a) => a.status === "attended").length;
  const absentCount = Math.max(0, eventSubmissions.length - attendedCount);
  const attendanceRate =
    eventSubmissions.length > 0
      ? Math.round((attendedCount / eventSubmissions.length) * 100)
      : 0;

  const handleExecuteScan = (tokenOrRef: string, method: "qr" | "manual") => {
    if (!tokenOrRef.trim()) return;

    const result = recordAttendanceCheckIn(event.id, tokenOrRef.trim(), user, method);
    setFeedback({
      code: result.code,
      message: result.message,
      record: result.record,
      priorRecord: result.priorRecord,
    });
    setAttendance(getStoredAttendance());
    setSubmissions(getStoredSubmissions());
    setScannedToken("");
    setManualRefCode("");
  };

  const handleExecuteCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget || !correctionReason.trim()) return;

    correctAttendanceRecord(correctionTarget.id, correctionStatus, correctionReason.trim(), user);
    setAttendance(getStoredAttendance());
    setCorrectionTarget(null);
    setCorrectionReason("");
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        {/* Navigation */}
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
                REAL-TIME CHECK-IN TERMINAL (FR-QR-04 TO FR-QR-10)
              </span>
              <span className="rounded-md border border-[#D9D9D9] bg-[#F7F9FB] px-2 py-0.5 font-mono text-[10px] font-bold text-[#667585]">
                {event.unitId.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              {event.title}: Attendance Desk
            </h1>
            <p className="text-xs text-[#4A5B6B]">
              Operator: <strong className="text-[#111111]">{user.name}</strong> · Method: Atomic Verification (BR-18)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#00843D33] bg-[#00843D0D] px-3 py-1 font-mono text-xs font-semibold text-[#00843D]">
              <span className="h-2 w-2 rounded-full bg-[#00843D]" />
              ONLINE VERIFIER ACTIVE (FR-QR-14)
            </span>
          </div>
        </div>

        {/* Live Attendance Metrics Bar (FR-QR-13) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Total Registered</span>
            <span className="font-mono text-2xl font-bold text-[#111111]">
              {eventSubmissions.length}
            </span>
            <span className="text-xs text-[#667585]">Valid Participant Passes</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Checked In</span>
            <span className="font-mono text-2xl font-bold text-[#00843D]">{attendedCount}</span>
            <span className="text-xs text-[#667585]">Verified Present</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Absent / Pending</span>
            <span className="font-mono text-2xl font-bold text-[#A6192E]">{absentCount}</span>
            <span className="text-xs text-[#667585]">Awaiting Check-in</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-[#D9D9D9] bg-white p-5">
            <span className="font-mono text-[11px] uppercase text-[#667585]">Attendance Rate</span>
            <span className="font-mono text-2xl font-bold text-[#00629B]">{attendanceRate}%</span>
            <span className="text-xs text-[#667585]">Live Turnout Ratio</span>
          </div>
        </div>

        {/* FEEDBACK BANNER (FR-QR-09, AT-13, AT-14) */}
        {feedback.code ? (
          <div
            className={`flex items-start gap-4 rounded-2xl border p-6 transition-all ${
              feedback.code === "VALID"
                ? "border-[#00843D40] bg-[#00843D0D] text-[#00843D]"
                : feedback.code === "ALREADY_CHECKED_IN"
                  ? "border-[#E8730C40] bg-[#E8730C0D] text-[#B4530A]"
                  : "border-[#A6192E40] bg-[#A6192E0D] text-[#A6192E]"
            }`}
          >
            {feedback.code === "VALID" ? (
              <CheckCircle size={32} weight="fill" className="shrink-0 text-[#00843D]" />
            ) : feedback.code === "ALREADY_CHECKED_IN" ? (
              <WarningCircle size={32} weight="fill" className="shrink-0 text-[#B4530A]" />
            ) : (
              <XCircle size={32} weight="fill" className="shrink-0 text-[#A6192E]" />
            )}

            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                {feedback.code === "VALID"
                  ? "CHECK-IN VERIFIED (VALID)"
                  : feedback.code === "ALREADY_CHECKED_IN"
                    ? "DUPLICATE CHECK-IN DETECTED (FR-QR-07)"
                    : "CHECK-IN REJECTED"}
              </span>
              <p className="text-base font-bold text-[#111111]">{feedback.message}</p>
              {feedback.record ? (
                <div className="mt-1 flex flex-wrap gap-4 font-mono text-xs text-[#4A5B6B]">
                  <span>Attendee: <strong className="text-[#111111]">{feedback.record.attendeeName}</strong></span>
                  <span>Ref: <strong className="text-[#111111]">{feedback.record.referenceCode}</strong></span>
                  <span>Method: {feedback.record.method.toUpperCase()}</span>
                  <span>Time: {new Date(feedback.record.scannedAt).toLocaleTimeString()}</span>
                </div>
              ) : null}
              {feedback.priorRecord ? (
                <div className="mt-1 rounded-xl border border-[#E8730C33] bg-white p-3 font-mono text-xs text-[#B4530A]">
                  <p className="font-bold">INITIAL SCAN RECORD ON FILE:</p>
                  <p>Timestamp: {new Date(feedback.priorRecord.scannedAt).toLocaleTimeString()} · Scanned By: {feedback.priorRecord.scannedByUserName}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Scanner Simulation & Manual Fallback Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Quick Scanner Simulator (for review testing) */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-[#00629B]" weight="bold" />
                <h2 className="font-bold text-sm text-[#111111]">
                  Interactive QR Scanner Simulator
                </h2>
              </div>
              <span className="font-mono text-[11px] text-[#667585]">HARDWARE SIMULATOR</span>
            </div>

            <p className="text-xs text-[#4A5B6B]">
              Test scanning pre-registered delegates or scan an alien barcode to verify validation gates:
            </p>

            {/* Quick 1-Click Preset Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#111111]">
                Quick Select Pre-Registered Attendee:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPresetToken}
                  onChange={(e) => setSelectedPresetToken(e.target.value)}
                  className="flex-1 rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                >
                  <option value="">Select an attendee pass...</option>
                  {eventSubmissions.map((s) => (
                    <option key={s.id} value={s.qrToken || s.referenceCode}>
                      {s.attendeeName} ({s.referenceCode})
                    </option>
                  ))}
                  <option value="QR-ALIEN-EVENT-9999">
                    [TEST INVALID] Alien Event Barcode (AT-13)
                  </option>
                  <option value="QR-HACK-REVOKED-TEST-99">
                    [TEST REVOKED] Invalidated Registration Pass (AT-15)
                  </option>
                </select>
                <button
                  type="button"
                  onClick={() => handleExecuteScan(selectedPresetToken, "qr")}
                  disabled={!selectedPresetToken}
                  className="rounded-xl bg-[#00629B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#005282] disabled:opacity-40"
                >
                  Simulate QR Scan
                </button>
              </div>
            </div>

            {/* Direct Barcode Hash Input */}
            <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#111111]">
                Or Input Raw QR Token Hash:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. QR-HACK-9821-SEC-A1"
                  value={scannedToken}
                  onChange={(e) => setScannedToken(e.target.value)}
                  className="flex-1 rounded-xl border border-[#D9D9D9] p-2.5 font-mono text-xs outline-none focus:border-[#00629B]"
                />
                <button
                  type="button"
                  onClick={() => handleExecuteScan(scannedToken, "qr")}
                  disabled={!scannedToken.trim()}
                  className="rounded-xl border border-[#00629B] bg-white px-4 py-2.5 text-xs font-semibold text-[#00629B] hover:bg-[#00629B0D] disabled:opacity-40"
                >
                  Scan Barcode
                </button>
              </div>
            </div>
          </div>

          {/* Manual Reference Code Fallback (FR-QR-10) */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Keyboard size={20} className="text-[#00629B]" weight="bold" />
                <h2 className="font-bold text-sm text-[#111111]">
                  Manual Reference Lookup Fallback (FR-QR-10)
                </h2>
              </div>
              <span className="font-mono text-[11px] text-[#667585]">FALLBACK DESK</span>
            </div>

            <p className="text-xs text-[#4A5B6B]">
              If a participant&rsquo;s phone screen is cracked or camera hardware fails, input their alphanumeric reference code directly:
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#111111]">
                Registration Reference Code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. REG-HACK-0101"
                  value={manualRefCode}
                  onChange={(e) => setManualRefCode(e.target.value)}
                  className="flex-1 rounded-xl border border-[#D9D9D9] p-2.5 font-mono text-xs uppercase outline-none focus:border-[#00629B]"
                />
                <button
                  type="button"
                  onClick={() => handleExecuteScan(manualRefCode, "manual")}
                  disabled={!manualRefCode.trim()}
                  className="rounded-xl bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#333333] disabled:opacity-40"
                >
                  Manual Check-In
                </button>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-3 text-xs text-[#667585]">
              <strong className="text-[#111111]">Audit Requirement:</strong> Manual check-ins are logged distinctly with method &ldquo;manual&rdquo; in the security audit trail.
            </div>
          </div>
        </div>

        {/* Live Attendance Log Table & Corrections (FR-QR-12) */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="font-bold text-sm text-[#111111]">
              Live Check-In Attendance Log ({eventAttendance.length})
            </h2>
            <span className="font-mono text-xs text-[#667585]">ATOMIC LEDGER</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] font-mono text-[#667585]">
                  <th className="py-2.5 px-4 font-semibold">ATTENDEE NAME</th>
                  <th className="py-2.5 px-4 font-semibold">REFERENCE</th>
                  <th className="py-2.5 px-4 font-semibold">METHOD</th>
                  <th className="py-2.5 px-4 font-semibold">CHECKED IN AT</th>
                  <th className="py-2.5 px-4 font-semibold">OPERATOR</th>
                  <th className="py-2.5 px-4 font-semibold">STATUS</th>
                  <th className="py-2.5 px-4 text-right font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {eventAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F7F9FB]">
                    <td className="py-2.5 px-4 font-bold text-[#111111]">{rec.attendeeName}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#00629B]">{rec.referenceCode}</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded-md border border-[#D9D9D9] bg-[#F7F9FB] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#111111]">
                        {rec.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#667585]">
                      {new Date(rec.scannedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 text-[#4A5B6B]">{rec.scannedByUserName}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                          rec.status === "attended"
                            ? "bg-[#00843D1A] text-[#00843D]"
                            : "bg-[#A6192E1A] text-[#A6192E]"
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCorrectionTarget(rec);
                          setCorrectionStatus(rec.status === "attended" ? "voided" : "attended");
                        }}
                        className="rounded-lg border border-[#D9D9D9] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#667585] hover:border-[#00629B] hover:text-[#00629B]"
                      >
                        Correct (FR-QR-12)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Correction Modal (FR-QR-12, AT-18) */}
        {correctionTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-[#D9D9D9] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="font-bold text-sm text-[#111111]">
                  Attendance Status Correction (FR-QR-12)
                </h3>
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  className="text-xs text-[#667585] hover:text-[#111111]"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#4A5B6B]">
                Correcting check-in record for <strong className="text-[#111111]">{correctionTarget.attendeeName}</strong> ({correctionTarget.referenceCode}).
                Mandatory justification reason required for audit compliance:
              </p>

              <form onSubmit={handleExecuteCorrection} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111111]">New Status</label>
                  <select
                    value={correctionStatus}
                    onChange={(e) => setCorrectionStatus(e.target.value as "attended" | "voided")}
                    className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                  >
                    <option value="attended">ATTENDED</option>
                    <option value="voided">VOIDED (Mistaken Scan)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#111111]">
                    Justification Reason (Mandatory)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Accidental double scan / Wrong badge presented"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    required
                    className="rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCorrectionTarget(null)}
                    className="rounded-xl border border-[#D9D9D9] px-4 py-2 text-xs font-semibold text-[#667585]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!correctionReason.trim()}
                    className="rounded-xl bg-[#00629B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#005282] disabled:opacity-40"
                  >
                    Confirm Correction
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
