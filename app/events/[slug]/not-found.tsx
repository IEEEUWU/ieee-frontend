import Link from "next/link";
export default function NotFound() {
  return <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#F7F9FB] p-10 font-plex text-[#0B1B2B]"><h1 className="text-3xl font-semibold">Event not found</h1><p>This event is unavailable or has not been published.</p><Link href="/events" className="rounded-full bg-[#00629B] px-6 py-3 text-white">Browse events</Link></main>;
}
