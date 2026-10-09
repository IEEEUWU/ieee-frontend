"use client";

import { useState } from "react";
import {
  ShieldWarning,
  CheckCircle,
} from "@phosphor-icons/react";
import { AdminShell, useAdminUser } from "@/components/admin/admin-shell";
import {
  getStoredUnits,
  updateUnit,
  getStoredBodTerms,
  saveBodTerm,
  hasPermission,
  type OrganisationalUnit,
  type BodTerm,
  type SocietyId,
} from "@/lib/srs-data";

function buildIncomingTerm(unitId: SocietyId, termLabel: string): BodTerm {
  const timestamp = Date.now();
  return {
    id: `term-${unitId}-${termLabel.replace(/\//g, "-")}`,
    unitId: unitId,
    termLabel: termLabel.trim(),
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(timestamp + 365 * 86400000).toISOString().split("T")[0],
    state: "current",
    isPublished: true,
    members: [
      {
        id: `mem-${timestamp}-1`,
        name: "Incoming Chairperson",
        position: "Chairperson",
        tier: "senior",
        displayOrder: 1,
        imageUrl: "/photos/committee-placeholder.jpg",
        email: "chair@ieeeuwu.org",
      },
      {
        id: `mem-${timestamp}-2`,
        name: "Incoming Secretary",
        position: "Secretary",
        tier: "senior",
        displayOrder: 2,
        imageUrl: "/photos/committee-placeholder.jpg",
        email: "secretary@ieeeuwu.org",
      },
      {
        id: `mem-${timestamp}-3`,
        name: "Incoming Junior Officer",
        position: "Junior Coordinator",
        tier: "junior",
        displayOrder: 3,
        imageUrl: "/photos/committee-placeholder.jpg",
        email: "junior@ieeeuwu.org",
      },
    ],
  };
}

export default function AdminUnitsPage() {
  const { user } = useAdminUser();
  const [units, setUnits] = useState(() => getStoredUnits());
  const [terms, setTerms] = useState(() => getStoredBodTerms());
  const [selectedUnitId, setSelectedUnitId] = useState<SocietyId>(
    () => (user.assignedUnitId as SocietyId) || "cs",
  );
  const [editingDescription, setEditingDescription] = useState(() => {
    const id = (user.assignedUnitId as SocietyId) || "cs";
    return getStoredUnits().find((un) => un.id === id)?.description || "";
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [newTermLabel, setNewTermLabel] = useState("");
  const [handoverNotice, setHandoverNotice] = useState("");

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const unitTerms = terms.filter((t) => t.unitId === selectedUnitId);
  const currentTerm = unitTerms.find((t) => t.state === "current");
  const pastTerms = unitTerms.filter((t) => t.state === "past");

  // Check if active user has permission to edit this unit (FR-UNIT-01, FR-AUTH-02)
  const canEditSelectedUnit =
    user.role === "sb_webmaster" ||
    (user.role === "unit_webmaster" && user.assignedUnitId === selectedUnitId) ||
    hasPermission(user, "unit.details.manage", "UNIT", selectedUnitId);

  const handleSelectUnit = (id: SocietyId) => {
    setSelectedUnitId(id);
    setSaveMessage("");
    setHandoverNotice("");
    const unitObj = units.find((u) => u.id === id);
    if (unitObj) {
      setEditingDescription(unitObj.description);
    }
  };

  const handleSaveUnitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSelectedUnit) return;

    const updated: OrganisationalUnit = {
      ...selectedUnit,
      description: editingDescription,
    };

    updateUnit(updated, user);
    setUnits(getStoredUnits());
    setSaveMessage("Unit details successfully updated.");
    setTimeout(() => setSaveMessage(""), 3500);
  };

  const handleHandoverTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSelectedUnit || !newTermLabel.trim()) return;

    // Archive current term (FR-BOD-05, FR-BOD-06)
    if (currentTerm) {
      const archived: BodTerm = {
        ...currentTerm,
        state: "past",
      };
      saveBodTerm(archived, user);
    }

    const incomingTerm = buildIncomingTerm(selectedUnitId, newTermLabel);
    saveBodTerm(incomingTerm, user);
    setTerms(getStoredBodTerms());
    setNewTermLabel("");
    setHandoverNotice(
      `Executive committee term handed over to ${incomingTerm.termLabel}. Previous term archived with history preserved.`,
    );
    setTimeout(() => setHandoverNotice(""), 5000);
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2 rounded-2xl border border-[#D9D9D9] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                ORGANISATIONAL UNITS & EXECUTIVE COMMITTEE (FR-UNIT-01, FR-BOD-05)
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
                Unit Governance & Term Administration
              </h1>
              <p className="text-sm text-[#4A5B6B]">
                Maintain chapter metadata, faculty advisors, and manage committee handover transitions.
              </p>
            </div>
          </div>

          {/* Unit Switcher Tabs */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E2E8F0]">
            {units.map((unit) => {
              const isSelected = unit.id === selectedUnitId;
              const isPermitted =
                user.role === "sb_webmaster" ||
                (user.role === "unit_webmaster" && user.assignedUnitId === unit.id);

              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => handleSelectUnit(unit.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-[#00629B] text-white"
                      : "border border-[#D9D9D9] bg-white text-[#4A5B6B] hover:bg-[#F7F9FB]"
                  }`}
                >
                  <span>{unit.abbreviation}</span>
                  <span className="opacity-75">· {unit.name}</span>
                  {!isPermitted ? (
                    <span className="ml-1 rounded-sm bg-[#A6192E1A] px-1.5 py-0.2 font-mono text-[9px] text-[#A6192E]">
                      LOCKED
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Boundary Notice if restricted (AT-02) */}
        {!canEditSelectedUnit ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-5">
            <ShieldWarning size={24} weight="fill" className="mt-0.5 shrink-0 text-[#A6192E]" />
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-semibold text-[#A6192E]">
                ACCESS RESTRICTED: SCOPED BOUNDARY ENFORCED (FR-AUTH-02 / AT-02)
              </p>
              <p className="text-[#4A5B6B]">
                You are currently signed in as <strong className="text-[#111111]">{user.name}</strong> with role{" "}
                <span className="font-mono text-xs font-bold text-[#A6192E]">{user.role.toUpperCase()}</span>.
                Unit Webmasters have administrative privileges strictly bounded to their assigned chapter.
                Modifying details for <strong className="text-[#111111]">{selectedUnit.name}</strong> is blocked.
              </p>
            </div>
          </div>
        ) : null}

        {saveMessage ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#00843D33] bg-[#00843D0D] p-4 text-xs font-semibold text-[#00843D]">
            <CheckCircle size={18} weight="fill" />
            {saveMessage}
          </div>
        ) : null}

        {handoverNotice ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#00629B33] bg-[#00629B0D] p-4 text-xs font-semibold text-[#00629B]">
            <CheckCircle size={18} weight="fill" />
            {handoverNotice}
          </div>
        ) : null}

        {/* Unit Details & Advisor Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Unit Profile Editor */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-bold text-sm text-[#111111]">
                Unit Profile: {selectedUnit.name}
              </h2>
              <span className="rounded-md border border-[#D9D9D9] bg-[#F7F9FB] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00629B]">
                {selectedUnit.type.toUpperCase()}
              </span>
            </div>

            <form onSubmit={handleSaveUnitProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#111111]">
                  Official Charter Scope / Description
                </label>
                <textarea
                  rows={4}
                  value={editingDescription}
                  disabled={!canEditSelectedUnit}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#D9D9D9] p-3 text-sm outline-none focus:border-[#00629B] disabled:bg-[#F7F9FB] disabled:text-[#667585]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-mono text-xs text-[#667585]">Brand Hex</span>
                  <p className="font-mono text-sm font-semibold text-[#111111]">
                    {selectedUnit.colour.brand}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#667585]">Public URL</span>
                  <p className="font-mono text-sm text-[#00629B]">{selectedUnit.portalUrl}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!canEditSelectedUnit}
                  className="rounded-full bg-[#00629B] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#005282] disabled:opacity-40"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>

            {/* Advisors Roster (FR-UNIT-02) */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#667585]">
                CONFIRMED FACULTY ADVISORS ({selectedUnit.advisors.length})
              </span>
              <div className="mt-3 flex flex-col gap-2">
                {selectedUnit.advisors.map((adv) => (
                  <div
                    key={adv.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#111111]">{adv.name}</p>
                      <p className="text-[#667585]">{adv.designation} · {adv.termLabel}</p>
                    </div>
                    <span className="rounded-md bg-white border border-[#D9D9D9] px-2 py-0.5 font-mono text-[10px] text-[#00843D]">
                      PUBLIC RECORD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOD Term & Handover Manager (FR-BOD-05, AT-19) */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#D9D9D9] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-bold text-sm text-[#111111]">
                BOD Term & Handover Manager (FR-BOD-05)
              </h2>
              <span className="font-mono text-xs text-[#00843D] font-bold">
                ACTIVE: {currentTerm?.termLabel || "None"}
              </span>
            </div>

            {/* Active Term Breakdown with Junior & Senior categories (FR-BOD-02) */}
            {currentTerm ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111111]">Current Committee Roster</span>
                  <span className="font-mono text-[#667585]">
                    {currentTerm.members.length} Officers Listed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-[#D9D9D9] bg-[#F7F9FB] p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-[#00629B]">
                      SENIOR EXCOM TIER
                    </span>
                    <p className="text-sm font-bold text-[#111111]">
                      {currentTerm.members.filter((m) => m.tier === "senior").length} Members
                    </p>
                    <p className="text-[11px] text-[#667585]">Executive leadership & heads</p>
                  </div>
                  <div className="rounded-xl border border-[#D9D9D9] bg-[#F7F9FB] p-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-[#00629B]">
                      JUNIOR EXCOM TIER
                    </span>
                    <p className="text-sm font-bold text-[#111111]">
                      {currentTerm.members.filter((m) => m.tier === "junior").length} Members
                    </p>
                    <p className="text-[11px] text-[#667585]">Junior leads & associates</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Handover Form */}
            <form onSubmit={handleHandoverTerm} className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#667585]">
                OFFICE HANDOVER: DESIGNATE INCOMING TERM
              </span>
              <p className="text-xs text-[#4A5B6B]">
                Transitioning archives the current term into permanent history and establishes the new incoming term with fresh Senior/Junior rosters (FR-BOD-05, AT-19).
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 2026/2027"
                  disabled={!canEditSelectedUnit}
                  value={newTermLabel}
                  onChange={(e) => setNewTermLabel(e.target.value)}
                  className="flex-1 rounded-xl border border-[#D9D9D9] p-2.5 text-xs outline-none focus:border-[#00629B] disabled:bg-[#F7F9FB]"
                />
                <button
                  type="submit"
                  disabled={!canEditSelectedUnit || !newTermLabel.trim()}
                  className="rounded-xl bg-[#00629B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#005282] disabled:opacity-40"
                >
                  Execute Handover
                </button>
              </div>
            </form>

            {/* Archived Past Terms (FR-BOD-07) */}
            <div className="border-t border-[#E2E8F0] pt-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#667585]">
                ARCHIVED PAST TERMS ({pastTerms.length})
              </span>
              <div className="mt-2 flex flex-col gap-2">
                {pastTerms.map((term) => (
                  <div
                    key={term.id}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-2.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#111111]">{term.termLabel}</span>
                      <span className="ml-2 font-mono text-[10px] text-[#667585]">
                        {term.members.length} historical officers preserved
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#667585]">ARCHIVED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
