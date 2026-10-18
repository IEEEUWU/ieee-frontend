"use client";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAppSelector } from "@/lib/auth/store";
import { CHAPTER_NAMES, ROLE_NAMES, type DashboardRole } from "@/lib/auth/user";

export const DASHBOARDS: Record<DashboardRole, { description: string; metrics: [string, string][]; priorities: [string, string][]; activity: string[] }> = {
  webmaster: {
    description: "Keep your chapter’s digital presence current and connected.",
    metrics: [["Published pages", "12"], ["Content drafts", "4"], ["Upcoming events", "3"], ["Profile updates", "2"]],
    priorities: [["Update the chapter website", "Review chapter information, featured content, and member resources."], ["Prepare event announcements", "Organize upcoming event pages and registration details."], ["Refresh committee profiles", "Check the current committee’s photos and contact information."]],
    activity: ["A chapter news draft is ready for review", "The upcoming workshop page has been updated", "Committee profile updates are queued"],
  },
  secretary: {
    description: "Bring your chapter’s records, meetings, and communications together.",
    metrics: [["Meeting records", "8"], ["Pending minutes", "2"], ["Member records", "48"], ["Reports due", "3"]],
    priorities: [["Finalize meeting minutes", "Prepare the latest committee meeting notes for circulation."], ["Review member records", "Keep your chapter’s membership register and contact list current."], ["Prepare the monthly report", "Bring together event summaries, attendance, and chapter updates."]],
    activity: ["Meeting minutes are awaiting review", "A membership register update was prepared", "The monthly chapter report has been drafted"],
  },
  chair: {
    description: "Guide your chapter’s plans, people, and upcoming activities.",
    metrics: [["Active initiatives", "5"], ["Pending reviews", "3"], ["Committee members", "12"], ["Planned events", "4"]],
    priorities: [["Review chapter initiatives", "Check progress and priorities across your chapter’s projects."], ["Coordinate the committee", "Prepare agenda items and follow up on team responsibilities."], ["Plan the next activities", "Review upcoming workshops, partnerships, and chapter goals."]],
    activity: ["A new initiative proposal is ready for discussion", "Committee planning notes have been updated", "An upcoming event plan is awaiting review"],
  },
};

export default function AdminDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return null;
  const dashboard = user.role ? DASHBOARDS[user.role] : null;
  return <AdminShell><div className="flex flex-col gap-8">
    <section className="rounded-3xl border border-[#0B1B2B14] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-[#00629B14] px-4 py-2 text-xs font-medium text-[#00629B]">{user.chapter} · {user.role ? ROLE_NAMES[user.role] : "Role pending"}</span><span className="text-xs text-[#4A5B6B]">Dashboard preview · Sample data</span></div>
      <h1 className="mt-6 text-3xl font-semibold tracking-[-1px] sm:text-4xl">Welcome, {user.first_name}.</h1>
      <p className="mt-3 text-base text-[#4A5B6B]">{dashboard?.description || "Your account is connected. Your role needs to be configured before a workspace can be selected."}</p>
      <p className="mt-5 text-sm font-medium text-[#00629B]">{CHAPTER_NAMES[user.chapter]}</p>
    </section>
    {dashboard ? <>
      <section aria-label="Sample chapter metrics" className="grid grid-cols-2 gap-4 xl:grid-cols-4">{dashboard.metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-[#0B1B2B14] bg-white p-5"><p className="text-sm text-[#4A5B6B]">{label}</p><p className="mt-3 text-3xl font-semibold text-[#00629B]">{value}</p><p className="mt-2 text-xs text-[#667585]">{user.chapter} · Sample value</p></div>)}</section>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section id="priorities" className="scroll-mt-6 rounded-3xl border border-[#0B1B2B14] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Your priorities</h2><p className="mt-2 text-sm text-[#4A5B6B]">A preview of your {user.chapter} {ROLE_NAMES[user.role!].toLowerCase()} workspace.</p><div className="mt-6 divide-y divide-[#0B1B2B14]">{dashboard.priorities.map(([title, description], index) => <div key={title} className="flex gap-4 py-5 first:pt-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00629B0D] text-sm font-medium text-[#00629B]">0{index + 1}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#4A5B6B]">{description}</p></div></div>)}</div></section>
        <section id="activity" className="scroll-mt-6 rounded-3xl border border-[#0B1B2B14] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Chapter activity</h2><p className="mt-2 text-sm text-[#4A5B6B]">Sample updates for {user.chapter}.</p><ul className="mt-6 space-y-6">{dashboard.activity.map((activity) => <li key={activity} className="flex gap-3"><span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00629B]" /><div><p className="text-sm leading-relaxed">{activity}</p><p className="mt-2 text-xs text-[#667585]">Preview activity</p></div></li>)}</ul></section>
      </div>
    </> : <section className="rounded-2xl border border-[#00629B26] bg-[#00629B0A] p-6"><h2 className="text-lg font-semibold">Your role is not configured yet</h2><p className="mt-2 text-sm text-[#4A5B6B]">Contact your branch webmaster to confirm the role assigned to your account.</p></section>}
    <section className="rounded-3xl border border-[#0B1B2B14] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Your account</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[["Name", `${user.first_name} ${user.last_name}`], ["Email", user.email], ["Enrollment number", user.enrollment_number], ["Chapter", user.chapter]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#4A5B6B]">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd></div>)}</dl></section>
  </div></AdminShell>;
}