"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Ticket, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { LandingNav } from "@/components/sections/landing/nav";
import { LandingFooter } from "@/components/sections/landing/footer";
import {
  getStoredEvents,
  getStoredSubmissions,
} from "@/lib/srs-data";
import { renderQrSvg } from "@/lib/qr";

interface PageProps {
  params: Promise<{
    slug: string;
    ref: string;
  }>;
}

export default function AttendeePassPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug, ref } = resolvedParams;

  const events = getStoredEvents();
  const event = events.find((e) => e.slug === slug) ?? null;

  const subs = getStoredSubmissions();
  const submission =
    subs.find(
      (s) =>
        s.referenceCode.toUpperCase() === decodeURIComponent(ref).toUpperCase() &&
        s.purpose === "participant",
    ) ?? null;

  if (!event || !submission) {
    return (
      <main className="landing-page flex min-h-screen w-full flex-col items-center bg-[#F7F9FB] font-sans">
        <LandingNav />
        <div className="flex flex-col items-center justify-center py-40">
          <WarningCircle size={40} className="text-[#A6192E]" weight="duotone" />
          <p className="mt-3 font-mono text-sm uppercase tracking-wider text-[#667585]">
            Pass Not Found
          </p>
          <p className="mt-1 text-sm text-[#4A5B6B]">
            No participant registration exists matching reference &ldquo;{ref}&rdquo;.
          </p>
          <Link href="/events" className="mt-6 rounded-full bg-[#00629B] px-6 py-2.5 text-sm font-semibold text-white">
            Browse Events
          </Link>
        </div>
        <LandingFooter />
      </main>
    );
  }

  return (
    <main className="landing-page flex min-h-screen w-full flex-col items-center bg-[#F7F9FB] font-sans leading-[1.3] text-[#111111]">
      <div className="print:hidden w-full">
        <LandingNav />
      </div>
      <div className="h-24 w-full print:hidden" />

      <div className="flex w-full max-w-[680px] flex-col items-center gap-6 px-4 pb-20">
        {/* Top Controls */}
        <div className="flex w-full items-center justify-between print:hidden">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#667585] hover:text-[#00629B]"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to {event.title}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-xs font-semibold text-[#111111] shadow-xs hover:bg-[#EBF2F7]"
          >
            <Printer size={16} weight="bold" />
            Print Pass
          </button>
        </div>

        {/* Printable Pass Card */}
        <div className="flex w-full flex-col overflow-hidden rounded-3xl border-2 border-[#00629B] bg-white shadow-xs">
          {/* Header Banner */}
          <div className="flex items-center justify-between bg-[#00629B] px-8 py-5 text-white">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-white/80">
                IEEE UWU STUDENT BRANCH
              </span>
              <h1 className="text-xl font-bold tracking-tight">{event.title}</h1>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <Ticket size={24} weight="bold" />
            </div>
          </div>

          {/* Pass Body */}
          <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#667585]">
                  ATTENDEE NAME
                </span>
                <p className="text-2xl font-bold tracking-tight text-[#111111]">
                  {submission.attendeeName}
                </p>
                {submission.studentRegNo ? (
                  <p className="font-mono text-xs font-semibold text-[#00629B]">
                    {submission.studentRegNo}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#E2E8F0] pt-3">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#667585]">
                    EVENT DATE
                  </span>
                  <p className="font-mono text-sm font-bold text-[#111111]">
                    {event.day} {event.month} {event.year}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#667585]">
                    CHECK-IN TIME
                  </span>
                  <p className="font-mono text-sm font-bold text-[#111111]">{event.time}</p>
                </div>
              </div>

              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#667585]">
                  VENUE LOCATION
                </span>
                <p className="text-sm font-medium text-[#4A5B6B]">{event.venue}</p>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#667585]">
                  REGISTRATION REFERENCE
                </span>
                <p className="font-mono text-lg font-bold tracking-wide text-[#00629B]">
                  {submission.referenceCode}
                </p>
              </div>
            </div>

            {/* QR Barcode Column */}
            <div className="flex flex-col items-center gap-3 self-center rounded-2xl border border-[#D9D9D9] bg-[#F7F9FB] p-4">
              {submission.qrToken ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderQrSvg(submission.qrToken, 180, "#00629B", "#ffffff"),
                  }}
                  className="h-[180px] w-[180px] bg-white p-1"
                />
              ) : null}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#00843D]">
                <CheckCircle size={14} weight="fill" />
                <span>OFFICIAL QR TOKEN</span>
              </div>
            </div>
          </div>

          {/* Pass Footer */}
          <div className="border-t border-dashed border-[#D9D9D9] bg-[#F7F9FB] px-8 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-[#667585]">
              <span>Issued by IEEE UWU Student Branch</span>
              <span className="font-mono">STATUS: VALID CREDENTIAL</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#667585] print:hidden">
          Please present this screen or printed ticket at the registration desk upon entrance.
        </p>
      </div>

      <div className="print:hidden w-full">
        <LandingFooter />
      </div>
    </main>
  );
}
