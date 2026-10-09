"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, WarningCircle, Ticket, ArrowRight } from "@phosphor-icons/react";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingFooter } from "@/components/sections/landing/footer";
import {
  getStoredEvents,
  getStoredSubmissions,
  saveSubmission,
  type Submission,
  type EventItem,
  type DynamicForm,
} from "@/lib/srs-data";
import { renderQrSvg } from "@/lib/qr";

function generateParticipantSubmission(
  event: EventItem,
  pForm: DynamicForm,
  formData: Record<string, string>
): Submission {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const refCode = `REG-${event.slug.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}-${randomSuffix}`;
  const qrToken = `QR-${event.slug.toUpperCase()}-${randomSuffix}-SEC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Resolve mapped core fields (FR-FORM-06)
  const nameField = pForm.fields.find((f) => f.coreMapping === "attendee_name")?.key;
  const emailField = pForm.fields.find((f) => f.coreMapping === "attendee_email")?.key;
  const studentField = pForm.fields.find((f) => f.coreMapping === "student_id")?.key;
  const phoneField = pForm.fields.find((f) => f.coreMapping === "phone")?.key;

  const attendeeName = (nameField && formData[nameField]) || formData.fullName || "Attendee";
  const attendeeEmail = (emailField && formData[emailField]) || formData.email || "";
  const studentRegNo = (studentField && formData[studentField]) || formData.studentRegNo || "";
  const phone = (phoneField && formData[phoneField]) || formData.phone || "";

  return {
    id: `sub-${Date.now()}`,
    eventId: event.id,
    formId: pForm.id,
    purpose: "participant",
    referenceCode: refCode,
    status: "valid",
    submittedAt: new Date().toISOString(),
    attendeeName,
    attendeeEmail,
    studentRegNo,
    phone,
    qrToken,
    answers: { ...formData },
  };
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EventRegisterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const event = getStoredEvents().find((e) => e.slug === slug) ?? null;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateNotice, setDuplicateNotice] = useState("");
  const [submittedPass, setSubmittedPass] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) {
    return (
      <main className="landing-page flex min-h-screen w-full flex-col items-center bg-[#F7F9FB] font-sans">
        <LandingNav />
        <div className="flex flex-col items-center justify-center py-40">
          <p className="font-mono text-sm uppercase tracking-wider text-[#667585]">Event Not Found</p>
          <Link href="/events" className="mt-4 font-semibold text-[#00629B] hover:underline">
            Return to calendar
          </Link>
        </div>
        <LandingFooter />
      </main>
    );
  }

  const pForm = event.participantForm;
  const now = new Date();
  const existingSubs = getStoredEvents()
    ? getStoredSubmissions().filter(
        (s) => s.eventId === event.id && s.purpose === "participant" && s.status === "valid",
      )
    : [];
  const isCapacityReached = event.capacityLimit > 0 && existingSubs.length >= event.capacityLimit;

  const isOpen =
    event.state === "published" &&
    pForm.isEnabled &&
    !isCapacityReached &&
    (!pForm.openAt || new Date(pForm.openAt) <= now) &&
    (!pForm.closeAt || new Date(pForm.closeAt) >= now);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setDuplicateNotice("");
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of pForm.fields) {
      const val = formData[field.key]?.trim() || "";
      if (field.isRequired && !val) {
        newErrors[field.key] = `${field.label} is required`;
        continue;
      }
      if (val && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newErrors[field.key] = "Please enter a valid email address";
      }
      if (val && field.type === "phone" && !/^[0-9+\-\s()]{7,15}$/.test(val)) {
        newErrors[field.key] = "Please enter a valid telephone number";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const submission = generateParticipantSubmission(event, pForm, formData);

    // Deduplication Policy Check (FR-REG-04)
    const currentSubs = getStoredSubmissions().filter(
      (s) => s.eventId === event.id && s.purpose === "participant" && s.status === "valid",
    );
    const existing = currentSubs.find(
      (s) =>
        (submission.studentRegNo &&
          s.studentRegNo?.toLowerCase().trim() ===
            submission.studentRegNo.toLowerCase().trim()) ||
        (submission.attendeeEmail &&
          s.attendeeEmail.toLowerCase().trim() ===
            submission.attendeeEmail.toLowerCase().trim()),
    );

    if (existing) {
      setIsSubmitting(false);
      setDuplicateNotice(
        `A registration pass (${existing.referenceCode}) already exists for this Student ID / Email. Duplicate registrations are blocked (FR-REG-04).`,
      );
      return;
    }

    saveSubmission(submission);
    setIsSubmitting(false);
    setSubmittedPass(submission);
  };

  return (
    <main className="landing-page flex min-h-screen w-full flex-col items-center bg-[#F7F9FB] font-sans leading-[1.3] text-[#111111]">
      <LandingNav />
      <div className="h-28 w-full" />

      <div className="flex w-full max-w-[920px] flex-col gap-8 px-6 pb-24">
        {/* Navigation link */}
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#667585] transition-colors hover:text-[#00629B]"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to {event.title}
        </Link>

        {submittedPass ? (
          /* Confirmation & QR Pass Screen (FR-REG-02, FR-QR-02) */
          <div className="flex w-full flex-col items-center gap-8 rounded-2xl border border-[#D9D9D9] bg-white p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00629B14] text-[#00629B]">
                <CheckCircle size={36} weight="fill" />
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#111111]">
                Registration Confirmed!
              </h1>
              <p className="mt-2 text-base text-[#4A5B6B]">
                Your participant pass has been issued. Save or screenshot this pass for event entry.
              </p>
            </div>

            {/* Pass Card */}
            <div className="flex w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border-2 border-[#00629B] bg-[#F7F9FB]">
              <div className="flex items-center justify-between border-b border-[#D9D9D9] bg-[#00629B] px-6 py-4 text-white">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-white/80">
                    IEEE UWU · OFFICIAL ATTENDEE PASS
                  </p>
                  <p className="text-lg font-bold">{event.title}</p>
                </div>
                <Ticket size={28} weight="duotone" />
              </div>

              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="font-mono text-xs uppercase text-[#667585]">Attendee</span>
                    <p className="text-xl font-bold text-[#111111]">{submittedPass.attendeeName}</p>
                    {submittedPass.studentRegNo ? (
                      <p className="font-mono text-xs text-[#00629B]">{submittedPass.studentRegNo}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-mono text-xs uppercase text-[#667585]">Date</span>
                      <p className="font-mono text-sm font-semibold text-[#111111]">
                        {event.day} {event.month} {event.year}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase text-[#667585]">Time</span>
                      <p className="font-mono text-sm font-semibold text-[#111111]">{event.time}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-xs uppercase text-[#667585]">Venue</span>
                    <p className="text-sm font-medium text-[#4A5B6B]">{event.venue}</p>
                  </div>

                  <div>
                    <span className="font-mono text-xs uppercase text-[#667585]">Pass Reference</span>
                    <p className="font-mono text-base font-bold text-[#00629B]">
                      {submittedPass.referenceCode}
                    </p>
                  </div>
                </div>

                {/* SVG QR Code */}
                {submittedPass.qrToken ? (
                  <div className="flex flex-col items-center gap-2 self-center rounded-xl border border-[#D9D9D9] bg-white p-3">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderQrSvg(submittedPass.qrToken, 160, "#00629B", "#ffffff"),
                      }}
                      className="h-40 w-40"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#667585]">
                      SCAN AT ENTRANCE
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[#D9D9D9] bg-white px-6 py-3">
                <p className="text-xs text-[#667585]">
                  Present this QR pass to the IEEE check-in desk at the venue. Pass is cryptographically bound to your registration.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/events/${event.slug}/pass/${submittedPass.referenceCode}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005282]"
              >
                View Fullscreen / Print Pass
                <ArrowRight size={16} weight="bold" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedPass(null);
                  setFormData({});
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#EBF2F7]"
              >
                Register Another Attendee
              </button>
            </div>
          </div>
        ) : !isOpen ? (
          /* Form Closed / Capacity Reached State (FR-FORM-11, FR-REG-06) */
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F7] text-[#667585]">
              <WarningCircle size={32} weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold text-[#111111]">
              {isCapacityReached ? "Attendee Capacity Limit Reached" : "Registration Window Closed"}
            </h1>
            <p className="max-w-md text-sm text-[#4A5B6B]">
              {isCapacityReached
                ? `Registration for ${event.title} has reached the maximum permitted capacity of ${event.capacityLimit} delegates (FR-REG-06).`
                : `Participant registrations for ${event.title} are currently not accepting submissions.`}
            </p>
            {!isCapacityReached && (pForm.openAt || pForm.closeAt) ? (
              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-4 text-xs font-mono text-[#667585]">
                <div>SCHEDULED WINDOW:</div>
                <div>OPEN: {new Date(pForm.openAt).toLocaleString()}</div>
                <div>CLOSE: {new Date(pForm.closeAt).toLocaleString()}</div>
              </div>
            ) : null}
            <Link
              href={`/events/${event.slug}`}
              className="mt-4 inline-flex items-center rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#005282]"
            >
              Return to Event Overview
            </Link>
          </div>
        ) : (
          /* Dynamic Registration Form (FR-FORM-02, FR-FORM-10) */
          <div className="flex flex-col gap-8 rounded-2xl border border-[#D9D9D9] bg-white p-8 md:p-12">
            <header className="flex flex-col gap-2 border-b border-[#E2E8F0] pb-6">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                PARTICIPANT REGISTRATION
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
                {event.title}
              </h1>
              <p className="text-sm text-[#4A5B6B]">
                {event.day} {event.month} {event.year} · {event.time} · {event.venue}
              </p>
            </header>

            {duplicateNotice ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-5">
                <WarningCircle size={22} weight="fill" className="shrink-0 text-[#A6192E] mt-0.5" />
                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-bold text-[#A6192E]">DUPLICATE REGISTRATION BLOCKED (FR-REG-04)</span>
                  <p className="text-[#4A5B6B]">{duplicateNotice}</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              {pForm.fields.map((field) => {
                const hasError = !!errors[field.key];
                return (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={field.key}
                      className="text-sm font-semibold text-[#111111]"
                    >
                      {field.label}
                      {field.isRequired ? (
                        <span className="ml-1 text-[#A6192E]">*</span>
                      ) : (
                        <span className="ml-1 text-xs font-normal text-[#667585]">(Optional)</span>
                      )}
                    </label>

                    {field.helperText ? (
                      <p className="text-xs text-[#667585]">{field.helperText}</p>
                    ) : null}

                    {field.type === "textarea" ? (
                      <textarea
                        id={field.key}
                        rows={3}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={`w-full rounded-xl border bg-white p-3 text-sm outline-none transition-colors ${
                          hasError
                            ? "border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]"
                            : "border-[#D9D9D9] focus:border-[#00629B]"
                        }`}
                      />
                    ) : field.type === "dropdown" ? (
                      <select
                        id={field.key}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={`w-full rounded-xl border bg-white p-3 text-sm outline-none transition-colors ${
                          hasError
                            ? "border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]"
                            : "border-[#D9D9D9] focus:border-[#00629B]"
                        }`}
                      >
                        <option value="">Select an option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "single_choice" ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {field.options?.map((opt) => (
                          <label
                            key={opt}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                              formData[field.key] === opt
                                ? "border-[#00629B] bg-[#00629B14] text-[#00629B]"
                                : "border-[#D9D9D9] bg-white text-[#4A5B6B] hover:border-[#667585]"
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.key}
                              value={opt}
                              checked={formData[field.key] === opt}
                              onChange={() => handleInputChange(field.key, opt)}
                              className="sr-only"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        id={field.key}
                        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={`w-full rounded-xl border bg-white p-3 text-sm outline-none transition-colors ${
                          hasError
                            ? "border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]"
                            : "border-[#D9D9D9] focus:border-[#00629B]"
                        }`}
                      />
                    )}

                    {hasError ? (
                      <span className="text-xs font-medium text-[#A6192E]">
                        {errors[field.key]}
                      </span>
                    ) : null}
                  </div>
                );
              })}

              {/* Data Privacy Disclosure (FR-RESP-07) */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-4 text-xs text-[#667585]">
                <strong className="font-semibold text-[#111111]">Privacy Notice (FR-RESP-07):</strong> The information collected is used strictly by the IEEE Student Branch for event logistics, delegate accreditation, and certificate issuance. It is never sold or shared with external third parties.
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-[#E2E8F0] pt-6">
                <Link
                  href={`/events/${event.slug}`}
                  className="rounded-full border border-[#D9D9D9] px-6 py-3 text-sm font-semibold text-[#667585] hover:bg-[#EBF2F7]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#00629B] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005282] disabled:opacity-50"
                >
                  {isSubmitting ? "Generating Pass..." : "Submit Registration & Get QR Pass"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <LandingFooter />
    </main>
  );
}
