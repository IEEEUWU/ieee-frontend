"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Buildings,
  CalendarDots,
  UsersThree,
  QrCode,
  ShieldCheck,
  SignOut,
  UserSwitch,
  CaretDown,
  Check,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import {
  getActiveUser,
  setActiveUser,
  USER_CHANGE_EVENT,
  INITIAL_ADMIN_USERS,
  type AdminUser,
} from "@/lib/srs-data";

interface AdminContextType {
  user: AdminUser;
  switchUser: (userId: string) => void;
}

const AdminContext = createContext<AdminContextType>({
  user: INITIAL_ADMIN_USERS[0],
  switchUser: () => {},
});

export function useAdminUser() {
  return useContext(AdminContext);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState<AdminUser>(() => getActiveUser());
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      setCurrentUserState(getActiveUser());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener(USER_CHANGE_EVENT, handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(USER_CHANGE_EVENT, handleSync);
    };
  }, []);

  const handleSwitchUser = (userId: string) => {
    setActiveUser(userId);
    const user = INITIAL_ADMIN_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUserState(user);
    }
    setShowRoleSwitcher(false);
    router.refresh();
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: House },
    { href: "/admin/units", label: "Units & BOD", icon: Buildings },
    { href: "/admin/events", label: "Events & Forms", icon: CalendarDots },
    {
      href: "/admin/events/evt-cs-hackathon/responses",
      label: "Responses",
      icon: UsersThree,
    },
    {
      href: "/admin/attendance/evt-cs-hackathon",
      label: "Attendance Scanner",
      icon: QrCode,
    },
    {
      href: "/admin/access",
      label: "Access & RBAC",
      icon: ShieldCheck,
      adminOnly: true,
    },
  ];

  return (
    <AdminContext.Provider value={{ user: currentUser, switchUser: handleSwitchUser }}>
      <div className="flex min-h-screen w-full flex-col bg-[#F7F9FB] font-sans text-[#111111]">
      {/* Top IEEE Admin Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#D9D9D9] bg-white px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00629B] font-mono text-sm font-bold text-white">
              UWU
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#111111]">
                IEEE UWU Administrative Portal
              </span>
              <span className="font-mono text-[10px] uppercase text-[#667585]">
                SRS v1.1 RBAC Console
              </span>
            </div>
          </Link>

          <div className="hidden h-5 w-px bg-[#E2E8F0] md:block" />

          {/* Scope Indicator Badge */}
          <div className="hidden items-center gap-2 rounded-full border border-[#D9D9D9] bg-[#F7F9FB] px-3 py-1 font-mono text-xs md:flex">
            <span className="text-[#667585]">ACTIVE SCOPE:</span>
            <span className="font-semibold text-[#00629B]">
              {currentUser.role === "sb_webmaster"
                ? "GLOBAL (ALL 5 UNITS)"
                : currentUser.role === "sb_secretary"
                  ? "CROSS-UNIT RESPONSE AUDITOR"
                  : currentUser.role === "unit_webmaster"
                    ? `UNIT SCOPE [${currentUser.assignedUnitId?.toUpperCase()}]`
                    : `EVENT DELEGATE [${currentUser.assignedEventId?.toUpperCase()}]`}
            </span>
          </div>
        </div>

        {/* Right side persona selector & actions */}
        <div className="flex items-center gap-3">
          {/* Public Portal Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-xl border border-[#D9D9D9] px-3 py-1.5 text-xs font-semibold text-[#4A5B6B] hover:bg-[#F7F9FB] sm:flex"
          >
            Public Site
            <ArrowSquareOut size={14} />
          </Link>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleSwitcher((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-[#00629B40] bg-[#00629B0D] px-3 py-1.5 text-xs font-semibold text-[#00629B] transition-colors hover:bg-[#00629B1A]"
            >
              <UserSwitch size={16} weight="bold" />
              <span className="hidden sm:inline">Active Persona:</span>
              <span className="font-bold underline">{currentUser.name}</span>
              <CaretDown size={12} weight="bold" />
            </button>

            {showRoleSwitcher ? (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#D9D9D9] bg-white p-2 shadow-lg z-50">
                <div className="border-b border-[#E2E8F0] px-3 py-2">
                  <p className="font-mono text-[10px] uppercase font-bold text-[#667585]">
                    SWITCH TEST PERSONA (SRS §3)
                  </p>
                </div>
                <div className="flex flex-col gap-1 py-1">
                  {INITIAL_ADMIN_USERS.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSwitchUser(u.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-[#00629B] text-white"
                            : "text-[#111111] hover:bg-[#F7F9FB]"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{u.name}</span>
                          <span
                            className={`font-mono text-[10px] ${
                              isSelected ? "text-white/80" : "text-[#667585]"
                            }`}
                          >
                            {u.role.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        {isSelected ? <Check size={14} weight="bold" /> : null}
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-[#E2E8F0] pt-1">
                  <Link
                    href="/admin/login"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#A6192E] hover:bg-[#F7F9FB]"
                  >
                    <SignOut size={14} />
                    Shared Login Screen
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#D9D9D9] bg-white p-4 md:flex">
          <div className="flex flex-col gap-1.5">
            <span className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#667585]">
              ADMIN NAVIGATION
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#00629B] font-semibold text-white"
                      : "text-[#4A5B6B] hover:bg-[#F7F9FB] hover:text-[#111111]"
                  }`}
                >
                  <Icon size={18} weight={isActive ? "bold" : "regular"} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Profile Mini Card */}
          <div className="rounded-2xl border border-[#D9D9D9] bg-[#F7F9FB] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111111]">{currentUser.name}</span>
              <span className="h-2 w-2 rounded-full bg-[#00843D]" />
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[#667585]">{currentUser.email}</p>
            <div className="mt-2 border-t border-[#E2E8F0] pt-2">
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00629B] border border-[#D9D9D9]">
                {currentUser.role.toUpperCase()}
              </span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-x-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  </AdminContext.Provider>
  );
}
