import type { MetadataRoute } from "next";
import { EVENTS } from "@/components/sections/landing/data";

const BASE = "https://ieee-uwu-student-branch.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE}/events`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // One entry per published event, counted from the same calendar the pages
    // are generated from, so the sitemap cannot list a route that does not
    // exist or miss one that does.
    ...EVENTS.map((event) => ({
      url: `${BASE}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}