"use client";
export default function Error({ retry }: { retry: () => void }) {
  return <main className="flex min-h-svh items-center justify-center bg-[#F7F9FB] p-10 font-plex"><div role="alert" className="max-w-lg rounded-3xl border border-[#0B1B2B26] bg-white p-10"><h1 className="text-2xl font-semibold text-[#0B1B2B]">Events are temporarily unavailable</h1><p className="mt-4 leading-relaxed text-[#4A5B6B]">We couldn’t load the event information. Please try again.</p><button onClick={retry} className="mt-6 rounded-full bg-[#00629B] px-6 py-3 text-white">Try again</button></div></main>;
}
