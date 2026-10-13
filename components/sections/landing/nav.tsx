"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { NAV_LINKS } from "./data";
import { TEXT_15_MED } from "./styles";

/**
 * Top navigation bar: branch logo, four section anchors, one primary action.
 * Responsive: desktop row collapses to an accessible mobile full-screen overlay.
 */
export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="relative w-full flex justify-center border-b border-[#0B1B2B0A] bg-[#F7F9FB] z-40">
        <nav
          data-land="nav"
          className="flex w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6"
        >
          <Link
            href="/"
            aria-label="IEEE Student Branch - Uva Wellassa University Home"
            className="shrink-0"
          >
            <Image
              src="/brand/uwu-sb-logo.png"
              alt="IEEE Student Branch - Uva Wellassa University"
              width={235}
              height={36}
              priority
              className="h-7 sm:h-9 w-auto max-w-[180px] sm:max-w-[235px] object-contain"
            />
          </Link>

          {/* Desktop Links */}
          <div data-land="nav-links" className="hidden md:flex flex-row items-center gap-8">
            {NAV_LINKS.map((link) => (
              <p key={link.href} className={TEXT_15_MED}>
                <Link href={link.href} className="transition-colors hover:text-[#00629B]">
                  {link.label}
                </Link>
              </p>
            ))}
            <Link
              data-land="nav-join"
              href="/#join"
              className="rounded-full bg-[#00629B] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#005282]"
            >
              Join IEEE
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-label="Open navigation menu"
            className="inline-flex items-center justify-center rounded-xl p-2 text-[#0B1B2B] hover:bg-[#00629B14] transition-colors md:hidden focus:outline-none"
          >
            <List size={24} weight="bold" />
          </button>
        </nav>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-[#F7F9FB] md:hidden"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#0B1B2B0A]">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              aria-label="IEEE Student Branch - Uva Wellassa University Home"
            >
              <Image
                src="/brand/uwu-sb-logo.png"
                alt="IEEE Student Branch - Uva Wellassa University"
                width={235}
                height={36}
                priority
                className="h-7 sm:h-9 w-auto max-w-[180px] sm:max-w-[235px] object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="inline-flex items-center justify-center rounded-xl p-2 text-[#0B1B2B] hover:bg-[#00629B14] transition-colors focus:outline-none"
            >
              <X size={24} weight="bold" />
            </button>
          </div>

          <div className="flex flex-col gap-6 p-6 overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[20px] font-semibold text-[#0B1B2B] hover:text-[#00629B] transition-colors py-2 border-b border-[#0B1B2B0A]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#join"
              onClick={() => setMobileOpen(false)}
              className="mt-4 rounded-full bg-[#00629B] py-3.5 text-center text-[16px] font-semibold text-white shadow-sm transition-colors hover:bg-[#005282]"
            >
              Join IEEE
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
