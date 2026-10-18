import type { MetadataRoute } from "next";

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
    // Live event routes are discovered through the paginated /events index.
    // Do not advertise the old demo slugs as backend event pages.
  ];
}
