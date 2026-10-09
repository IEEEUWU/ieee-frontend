"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, WarningCircle, Info, ArrowRight } from "@phosphor-icons/react";
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

function generateOcSubmission(
  event: EventItem,
  ocForm: DynamicForm,
  formData: Record<string, string>
): Submission {
  const randomSuffix = Math.floor(500 + Math.random() * 499);
  const refCode = `OC-${event.slug.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}-${randomSuffix}`;

  // Resolve mapped core fields (FR-FORM-06)
  const nameField = ocForm.fields.find((f) => f.coreMapping === "attendee_name")?.key;
  const emailField = ocForm.fields.find((f) => f.coreMapping === "attendee_email")?.key;
  const studentField = ocForm.fields.find((f) => f.coreMapping === "student_id")?.key;
  const phoneField = ocForm.fields.find((f) => f.coreMapping === "phone")?.key;

  const attendeeName = (nameField && formData[nameField]) || formData.fullName || "Applicant";
  const attendeeEmail = (emailField && formData[emailField]) || formData.email || "";
  const studentRegNo = (studentField && formData[studentField]) || formData.studentRegNo || "";
  const phone = (phoneField && formData[phoneField]) || formData.phone || "";

  // Note: OC submission does NOT generate a participant QR code (FR-OC-03, BR-04)
  return {
    id: `sub-oc-${Date.now()}`,
    eventId: event.id,
    formId: ocForm.id,
    purpose: "oc",
    referenceCode: refCode,
    status: "valid",
    submittedAt: new Date().toISOString(),
    attendeeName,
    attendeeEmail,
    studentRegNo,
    phone,
    answers: { ...formData },
  };
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EventApplyOcPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const event = getStoredEvents().find((e) => e.slug === slug) ?? null;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateNotice, setDuplicateNotice] = useState("");
  const [submittedApp, setSubmittedApp] = useState<Submission | null>(null);
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

  const ocForm = event.ocForm;
  const now = new Date();
  const isOpen =
    event.state === "published" &&
    ocForm.isEnabled &&
    (!ocForm.openAt || new Date(ocForm.openAt) <= now) &&
    (!ocForm.closeAt || new Date(ocForm.closeAt) >= now);

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
    for (const field of ocForm.fields) {
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

    const submission = generateOcSubmission(event, ocForm, formData);

    // Deduplication check for OC recruitment
    const currentSubs = getStoredSubmissions().filter(
      (s) => s.eventId === event.id && s.purpose === "oc" && s.status === "valid",
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
        `An OC application (${existing.referenceCode}) has already been submitted under this Student ID / Email.`,
      );
      return;
    }

    saveSubmission(submission);
    setIsSubmitting(false);
    setSubmittedApp(submission);
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

        {/* CRITICAL DISCLAIMER (FR-OC-03, BR-04) */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#00629B40] bg-[#00629B0D] p-5">
          <Info size={24} weight="fill" className="mt-0.5 shrink-0 text-[#00629B]" />
          <div className="flex flex-col gap-1 text-sm text-[#0B1B2B]">
            <p className="font-semibold text-[#00629B]">
              ORGANIZING COMMITTEE RECRUITMENT NOTICE (FR-OC-03 / BR-04)
            </p>
            <p className="leading-relaxed text-[#4A5B6B]">
              This application is exclusively for joining the student volunteer Organizing Committee (OC).
              <strong> Applying to the OC does not register you as an event participant or grant event entry credentials.</strong>{" "}
              If you wish to participate in the hackathon or challenge as a competitor or audience member, please complete the{" "}
              <Link href={`/events/${event.slug}/register`} className="font-semibold text-[#00629B] underline">
                Participant Registration Form
              </Link>
              .
            </p>
          </div>
        </div>

        {submittedApp ? (
          /* OC Application Confirmation Screen */
          <div className="flex w-full flex-col items-center gap-8 rounded-2xl border border-[#D9D9D9] bg-white p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00629B14] text-[#00629B]">
                <CheckCircle size={36} weight="fill" />
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#111111]">
                Application Received!
              </h1>
              <p className="mt-2 text-base text-[#4A5B6B]">
                Your application to join the Organizing Committee has been logged for review.
              </p>
            </div>

            <div className="flex w-full max-w-[560px] flex-col gap-4 rounded-2xl border border-[#D9D9D9] bg-[#F7F9FB] p-6">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="font-mono text-xs uppercase text-[#667585]">APPLICATION REF</span>
                  <p className="font-mono text-xl font-bold text-[#00629B]">
                    {submittedApp.referenceCode}
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 font-mono text-xs font-semibold text-[#4A5B6B] border border-[#D9D9D9]">
                  STATUS: PENDING REVIEW
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-mono text-xs text-[#667585]">Applicant Name</span>
                  <p className="font-semibold text-[#111111]">{submittedApp.attendeeName}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#667585]">Reg Number</span>
                  <p className="font-mono font-semibold text-[#111111]">{submittedApp.studentRegNo}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#667585]">Email</span>
                  <p className="text-[#4A5B6B]">{submittedApp.attendeeEmail}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#667585]">Event Target</span>
                  <p className="font-semibold text-[#111111]">{event.title}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#D9D9D9] bg-white p-4 text-xs text-[#667585]">
                The Project Chair and Executive Committee review candidate applications on a rolling basis. If shortlisted, you will be invited via email/WhatsApp for a brief briefing.
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#005282]"
              >
                Back to Event
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        ) : !isOpen ? (
          /* OC Recruitment Closed State (FR-FORM-03, FR-FORM-11) */
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#D9D9D9] bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2F7] text-[#667585]">
              <WarningCircle size={32} weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold text-[#111111]">OC Recruitment Closed</h1>
            <p className="max-w-md text-sm text-[#4A5B6B]">
              Organizing Committee recruitment for <strong className="font-semibold text-[#111111]">{event.title}</strong> is currently closed or has completed its intake window.
            </p>
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FB] p-4 text-xs font-mono text-[#667585]">
              <div>SCHEDULED OC WINDOW:</div>
              <div>OPEN: {new Date(ocForm.openAt).toLocaleString()}</div>
              <div>CLOSE: {new Date(ocForm.closeAt).toLocaleString()}</div>
            </div>
            <Link
              href={`/events/${event.slug}`}
              className="mt-4 inline-flex items-center rounded-full bg-[#00629B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#005282]"
            >
              Return to Event Overview
            </Link>
          </div>
        ) : (
          /* OC Recruitment Application Form */
          <div className="flex flex-col gap-8 rounded-2xl border border-[#D9D9D9] bg-white p-8 md:p-12">
            <header className="flex flex-col gap-2 border-b border-[#E2E8F0] pb-6">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00629B]">
                ORGANIZING COMMITTEE RECRUITMENT
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
                Join the Team: {event.title}
              </h1>
              <p className="text-sm text-[#4A5B6B]">
                Work alongside passionate student engineers to plan, build, and deliver IEEE UWU&rsquo;s flagship initiatives.
              </p>
            </header>

            {duplicateNotice ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[#A6192E40] bg-[#A6192E0D] p-5">
                <WarningCircle size={22} weight="fill" className="shrink-0 text-[#A6192E] mt-0.5" />
                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-bold text-[#A6192E]">DUPLICATE APPLICATION DETECTED</span>
                  <p className="text-[#4A5B6B]">{duplicateNotice}</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              {ocForm.fields.map((field) => {
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
                  {isSubmitting ? "Submitting Application..." : "Submit OC Application"}
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
