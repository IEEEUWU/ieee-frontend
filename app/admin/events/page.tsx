"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  UsersThree,
  QrCode,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { AdminShell, useAdminUser } from "@/components/admin/admin-shell";
import {
  getStoredEvents,
  updateEvent,
  hasPermission,
  type SrsEvent,
} from "@/lib/srs-data";

export default function AdminEventsPage() {
  const { user } = useAdminUser();
  const [events, setEvents] = useState<SrsEvent[]>(() => getStoredEvents());
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [notice, setNotice] = useState("");

  const handleToggleParticipantForm = (event: SrsEvent) => {
    // Permission gate (FR-EVT-02)
    const canManage =
      user.role === "sb_webmaster" ||
      (user.role === "unit_webmaster" && user.assignedUnitId === event.unitId) ||
      hasPermission(user, "form.manage", "EVENT", event.id);

    if (!canManage) {
      alert("Permission Denied: You cannot modify forms for this unit's event.");
      return;
    }

    const updated: SrsEvent = {
      ...event,
      participantForm: {
        ...event.participantForm,
        isEnabled: !event.participantForm.isEnabled,
      },
    };
    updateEvent(updated, user);
    setEvents(getStoredEvents());
    setNotice(`Updated participant form status for ${event.title}.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const handleToggleOcForm = (event: SrsEvent) => {
    const canManage =
      user.role === "sb_webmaster" ||
      (user.role === "unit_webmaster" && user.assignedUnitId === event.unitId) ||
      hasPermission(user, "form.manage", "EVENT", event.id);

    if (!canManage) {
      alert("Permission Denied: You cannot modify forms for this unit's event.");
      return;
    }

    const updated: SrsEvent = {
      ...event,
      ocForm: {
        ...event.ocForm,
        isEnabled: !event.ocForm.isEnabled,
      },
    };
    updateEvent(updated, user);
    setEvents(getStoredEvents());
    setNotice(`Updated OC recruitment form status for ${event.title}.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const handleToggleEventState = (event: SrsEvent, newState: "published" | "cancelled" | "draft") => {
    const canPublish =
      user.role === "sb_webmaster" ||
      (user.role === "unit_webmaster" && user.assignedUnitId === event.unitId) ||
      hasPermission(user, "event.publish", "EVENT", event.id);

    if (!canPublish) {
      alert("Permission Denied: You lack event.publish permission for this event.");
      return;
    }

    const updated: SrsEvent = {
      ...event,
      state: newState,
      // FR-EVT-08: Cancellation automatically closes forms
      ...(newState === "cancelled"
        ? {
            participantForm: { ...event.participantForm, isEnabled: false },
            ocForm: { ...event.ocForm, isEnabled: false },
          }
        : {}),
    };

    updateEvent(updated, user);
    setEvents(getStoredEvents());
    setNotice(`Event state transitioned to ${newState.toUpperCase()} (FR-EVT-06 / FR-EVT-08).`);
    setTimeout(() => setNotice(""), 3500);
  };

  const filteredEvents = events.filter((e) => {
    if (filterUnit !== "all" && e.unitId !== filterUnit) return false;
    return true;
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                EVENT CATALOG & FORM WINDOW SCHEDULER (FR-EVT-01, FR-FORM-03)
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
                Events & Dynamic Form Administration
              </h1>
              <p className="text-sm text-[#4A5B6B]">
                Control event publication lifecycles and toggle participant vs OC intake schedules independently.
              </p>
            </div>
          </div>

          {/* Unit Filters */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E2E8F0]">
            {["all", "sb", "cs", "ias", "ras", "wie"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setFilterUnit(u)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                  filterUnit === u
                    ? "bg-[#00629B] text-white"
                    : "border border-[#D9D9D9] bg-white text-[#4A5B6B] hover:bg-[#F7F9FB]"
                }`}
              >
                {u === "all" ? "All Units" : u}
              </button>
            ))}
          </div>
        </div>

        {notice ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#00843D33] bg-[#00843D0D] p-4 text-xs font-semibold text-[#00843D]">
            <CheckCircle size={18} weight="fill" />
            {notice}
          </div>
        ) : null}

        {/* Event List */}
        <div className="flex flex-col gap-6">
          {filteredEvents.map((evt) => {
            const canManage =
              user.role === "sb_webmaster" ||
              (user.role === "unit_webmaster" && user.assignedUnitId === evt.unitId) ||
              hasPermission(user, "event.manage", "EVENT", evt.id);

            return (
              <div
                key={evt.id}
                className="flex flex-col gap-6 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:p-8"
              >
                {/* Event Title Row */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-[#D9D9D9] bg-[#F7F9FB] px-2 py-0.5 font-mono text-[10px] font-bold text-[#00629B]">
                        UNIT: {evt.unitId.toUpperCase()}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                          evt.state === "published"
                            ? "bg-[#00843D1A] text-[#00843D]"
                            : evt.state === "cancelled"
                              ? "bg-[#A6192E1A] text-[#A6192E]"
                              : "bg-[#F7F9FB] text-[#667585]"
                        }`}
                      >
                        {evt.state.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-[#667585]">
                        {evt.mode.toUpperCase()} · CAPACITY: {evt.capacityLimit}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#111111]">
                      {evt.title}
                    </h2>
                    <p className="text-xs text-[#4A5B6B]">
                      {evt.day} {evt.month} {evt.year} · {evt.time} · {evt.venue}
                    </p>
                  </div>

                  {/* State Change Buttons (FR-EVT-06, FR-EVT-08) */}
                  <div className="flex items-center gap-2">
                    {evt.state !== "published" ? (
                      <button
                        type="button"
                        onClick={() => handleToggleEventState(evt, "published")}
                        disabled={!canManage}
                        className="rounded-xl bg-[#00843D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00622E] disabled:opacity-40"
                      >
                        Publish Event
                      </button>
                    ) : null}

                    {evt.state !== "cancelled" ? (
                      <button
                        type="button"
                        onClick={() => handleToggleEventState(evt, "cancelled")}
                        disabled={!canManage}
                        className="rounded-xl border border-[#A6192E33] bg-[#A6192E0D] px-3 py-1.5 text-xs font-semibold text-[#A6192E] hover:bg-[#A6192E1A] disabled:opacity-40"
                      >
                        Cancel Event (FR-EVT-08)
                      </button>
                    ) : null}

                    <Link
                      href={`/events/${evt.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 rounded-xl border border-[#D9D9D9] px-3 py-1.5 text-xs font-semibold text-[#4A5B6B] hover:bg-[#F7F9FB]"
                    >
                      Public Page
                      <ArrowSquareOut size={14} />
                    </Link>
                  </div>
                </div>

                {/* Independent Form Schedule Windows (FR-FORM-03, BR-03) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Participant Registration Window */}
                  <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                        PARTICIPANT REGISTRATION FORM
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleParticipantForm(evt)}
                        disabled={!canManage || evt.state === "cancelled"}
                        className="flex items-center gap-1 text-xs font-semibold text-[#00629B] disabled:opacity-40"
                      >
                        {evt.participantForm.isEnabled ? (
                          <>
                            <ToggleRight size={24} weight="fill" className="text-[#00843D]" />
                            <span className="text-[#00843D]">OPEN</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={24} weight="fill" className="text-[#667585]" />
                            <span className="text-[#667585]">CLOSED</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-[#4A5B6B]">
                      <p className="font-medium text-[#111111]">{evt.participantForm.title}</p>
                      <p className="mt-1 font-mono text-[11px] text-[#667585]">
                        Questions: {evt.participantForm.fields.length} dynamic schema fields
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col gap-1 rounded-lg border border-[#D9D9D9] bg-white p-2.5 font-mono text-[11px] text-[#667585]">
                      <div>SCHEDULED OPEN: {new Date(evt.participantForm.openAt).toLocaleDateString()}</div>
                      <div>SCHEDULED CLOSE: {new Date(evt.participantForm.closeAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Organizing Committee (OC) Intake Window */}
                  <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                        ORGANIZING COMMITTEE (OC) RECRUITMENT
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleOcForm(evt)}
                        disabled={!canManage || evt.state === "cancelled"}
                        className="flex items-center gap-1 text-xs font-semibold text-[#00629B] disabled:opacity-40"
                      >
                        {evt.ocForm.isEnabled ? (
                          <>
                            <ToggleRight size={24} weight="fill" className="text-[#00843D]" />
                            <span className="text-[#00843D]">OPEN</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={24} weight="fill" className="text-[#667585]" />
                            <span className="text-[#667585]">CLOSED</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-[#4A5B6B]">
                      <p className="font-medium text-[#111111]">{evt.ocForm.title}</p>
                      <p className="mt-1 font-mono text-[11px] text-[#667585]">
                        Questions: {evt.ocForm.fields.length} volunteer intake fields
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col gap-1 rounded-lg border border-[#D9D9D9] bg-white p-2.5 font-mono text-[11px] text-[#667585]">
                      <div>SCHEDULED OPEN: {new Date(evt.ocForm.openAt).toLocaleDateString()}</div>
                      <div>SCHEDULED CLOSE: {new Date(evt.ocForm.closeAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Action Links Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                  <span className="font-mono text-xs text-[#667585]">
                    EVENT ID: {evt.id}
                  </span>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/events/${evt.id}/responses`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] bg-white px-3.5 py-2 text-xs font-semibold text-[#111111] hover:bg-[#F7F9FB]"
                    >
                      <UsersThree size={16} weight="bold" />
                      View Responses & CSV
                    </Link>

                    <Link
                      href={`/admin/attendance/${evt.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#00629B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#005282]"
                    >
                      <QrCode size={16} weight="bold" />
                      QR Attendance Scanner
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
