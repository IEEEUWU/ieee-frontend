"use client";
import { canManagePermissions } from "@/lib/permissions/shared";
import { canManageUserGroups } from "@/lib/usergroups/shared";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAppSelector } from "@/lib/auth/store";
import { CHAPTER_NAMES, ROLE_NAMES } from "@/lib/auth/user";
import type { AdminUser, SocietyId } from "@/lib/srs-data";

// Compatibility for the older demo module pages; identity comes from /auth/me.
export function useAdminUser(): { user: AdminUser } {
  const profile = useAppSelector((state) => state.auth.user);
  if (!profile) throw new Error("An authenticated profile is required.");
  return { user: {
    id: String(profile.id), name: `${profile.first_name} ${profile.last_name}`.trim(),
    email: profile.email, username: profile.email,
    role: profile.role === "webmaster" ? (profile.chapter === "SB" ? "sb_webmaster" : "unit_webmaster") : profile.role === "secretary" ? "sb_secretary" : profile.role === "chair" ? "project_chair" : "attendance_operator",
    assignedUnitId: profile.chapter.toLowerCase() as SocietyId,
    status: profile.status === "active" ? "active" : "suspended", createdAt: "",
  } };
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const pathname = usePathname();
  if (!user) return null;
  const name = `${user.first_name} ${user.last_name}`.trim();
  const role = user.role ? ROLE_NAMES[user.role] : "Role pending";
  return <div className="flex min-h-svh flex-col bg-[#F7F9FB] font-plex text-[#0B1B2B]">
    <header className="border-b border-[#0B1B2B14] bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
        <Image src="/brand/uwu-sb-logo.png" alt="IEEE Uva Wellassa Student Branch" width={235} height={36} className="h-auto w-[200px]" priority />
        <div className="flex items-center gap-4"><span className="hidden text-sm text-[#4A5B6B] sm:block">{name}</span><span className="rounded-full bg-[#00629B0D] px-3 py-1.5 text-xs font-medium text-[#00629B]">{user.chapter} · {role}</span><LogoutButton /></div>
      </div>
    </header>
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-[#0B1B2B14] bg-white p-6 lg:w-64 lg:border-r lg:border-b-0 lg:p-8">
        <p className="text-xs font-medium tracking-[1.5px] text-[#4A5B6B] uppercase">Your workspace</p>
        <p className="mt-3 text-lg font-semibold">{user.chapter}</p><p className="mt-1 text-sm leading-relaxed text-[#4A5B6B]">{CHAPTER_NAMES[user.chapter]}</p>
        <nav aria-label="Dashboard navigation" className="mt-6 flex flex-wrap gap-2 lg:flex-col">
          <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined} className={`rounded-xl px-4 py-3 text-sm font-medium ${pathname === "/admin" ? "bg-[#00629B] text-white" : "text-[#4A5B6B] hover:bg-[#F7F9FB]"}`}>Overview</Link>
          {canManagePermissions(user) && <Link href="/admin/permissions" aria-current={pathname === "/admin/permissions" ? "page" : undefined} className={`rounded-xl px-4 py-3 text-sm font-medium ${pathname === "/admin/permissions" ? "bg-[#00629B] text-white" : "text-[#4A5B6B] hover:bg-[#F7F9FB]"}`}>Permission management</Link>}
          {canManageUserGroups(user) && <Link href="/admin/usergroups" aria-current={pathname === "/admin/usergroups" ? "page" : undefined} className={`rounded-xl px-4 py-3 text-sm font-medium ${pathname === "/admin/usergroups" ? "bg-[#00629B] text-white" : "text-[#4A5B6B] hover:bg-[#F7F9FB]"}`}>User groups</Link>}
        </nav>
        <div className="mt-8 border-t border-[#0B1B2B14] pt-5 lg:mt-auto"><p className="text-sm font-medium">{name}</p><p className="mt-1 break-all text-xs text-[#4A5B6B]">{user.email}</p></div>
      </aside>
      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  </div>;
}
