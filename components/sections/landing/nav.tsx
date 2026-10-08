import Image from "next/image";
import { NAV_LINKS } from "./data";
import { TEXT_15_MED } from "./styles";

/**
 * Top bar: branch logo, four section anchors, one primary action.
 *
 * Not sticky: it scrolls away with the page, exactly as the source does.
 * The lockup is sized to the bar's 36px content height so the nav keeps
 * its original 84.8px rhythm.
 */
export function LandingNav() {
  return (
    <nav
      data-land="nav"
      className="flex w-full max-w-[1120px] flex-row items-center justify-between px-10 py-6"
    >
      <Image
        src="/brand/uwu-sb-logo.png"
        alt="IEEE Student Branch - Uva Wellassa University"
        width={235}
        height={36}
        priority
        className="h-9 w-auto"
      />
      <div data-land="nav-links" className="flex flex-row items-center gap-8">
        {NAV_LINKS.map((link) => (
          <p
            key={link.href}
            className={TEXT_15_MED}
          >
            <a href={link.href}>{link.label}</a>
          </p>
        ))}
        <a
          data-land="nav-join"
          href="#join"
          className="rounded-full bg-[#00629B] px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Join IEEE
        </a>
      </div>
    </nav>
  );
}
