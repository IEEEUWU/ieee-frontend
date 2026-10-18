import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Administrator login",
  description: "Administrator sign in for the IEEE Uva Wellassa Student Branch.",
  alternates: { canonical: "/auth/login" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col bg-[#F7F9FB] font-plex text-[#0B1B2B]">
      <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-6 py-6 sm:px-10">
        <Image
          src="/brand/uwu-sb-logo.png"
          alt="IEEE Student Branch - Uva Wellassa University"
          width={235}
          height={36}
          priority
          className="h-auto w-[200px] sm:w-[235px]"
        />
        <span className="hidden rounded-full border border-[#00629B26] bg-[#00629B0A] px-4 py-2 text-xs font-medium tracking-wide text-[#00629B] sm:inline-flex">
          Administrative portal
        </span>
      </header>

      <div className="mx-auto grid w-full max-w-[1120px] flex-1 items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:py-20">
        <section aria-labelledby="portal-heading" className="max-w-[480px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#00629B14] px-4 py-2 text-sm font-medium text-[#00629B]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#00629B]" />
            IEEE UWU · Administrator access
          </div>
          <h1 id="portal-heading" className="text-[40px] leading-[1.08] font-semibold tracking-[-1.5px] sm:text-[56px]">
            Behind every chapter.<br />
            <span className="text-[#00629B]">A connected team.</span>
          </h1>
          <p className="mt-6 max-w-[420px] text-[17px] leading-relaxed text-[#4A5B6B]">
            The workspace for our branch and chapter administrators. Keep your community connected and help the next idea take shape.
          </p>
          <div className="mt-8 flex items-center gap-3 border-t border-[#0B1B2B14] pt-6 text-sm text-[#4A5B6B]">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00629B0D] text-[#00629B]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3Z" />
                <path d="m8.5 12 2.5 2.5 4.5-5" />
              </svg>
            </span>
            Access for authorized branch and chapter administrators.
          </div>
        </section>

        <section aria-labelledby="login-heading" className="w-full rounded-3xl border border-[#0B1B2B14] bg-white p-6 sm:p-10">
          <div className="mb-8">
            <p className="mb-3 text-xs font-medium tracking-[1.5px] text-[#00629B] uppercase">Welcome back</p>
            <h2 id="login-heading" className="text-[32px] leading-tight font-semibold tracking-[-0.8px]">Administrator login</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4A5B6B]">Sign in with your administrator credentials.</p>
          </div>
          <LoginForm />
          <p className="mt-7 border-t border-[#0B1B2B14] pt-6 text-[13px] leading-relaxed text-[#4A5B6B]">
            Need access or help with your account? Contact your student branch webmaster.
          </p>
        </section>
      </div>

      <footer className="mx-auto w-full max-w-[1120px] px-6 pb-6 sm:px-10">
        <div className="flex flex-col justify-between gap-2 border-t border-[#0B1B2B14] pt-5 text-xs text-[#4A5B6B] sm:flex-row">
          <p>IEEE Student Branch · Uva Wellassa University</p>
          <p>Advancing technology for humanity.</p>
        </div>
      </footer>
    </main>
  );
}
