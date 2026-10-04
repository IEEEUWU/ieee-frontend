import type { MetadataRoute } from "next";

/**
 * The branch publishes one public page. Anything else a crawler finds is a 404,
 * and this says so explicitly rather than leaving it to the default.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://ieee-uwu-student-branch.vercel.app/sitemap.xml",
  };
}