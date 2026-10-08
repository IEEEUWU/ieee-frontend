import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

/**
 * Type.
 *
 * Two families, two jobs.
 *
 * Archivo carries all prose and all display. It is a grotesque built for
 * high-performance screen use, and it holds its weight at 12rem without the
 * counters filling in the way softer faces do at that size.
 *
 * IBM Plex Mono carries the technical register only: charter codes, dates,
 * register labels, instrument values. Mono is not decoration here. Wherever the
 * page is stating a fact that a reader might want to copy or compare, it is set
 * in mono, so "this is data" is legible before the sentence is read.
 *
 * Both are subset to Latin, preloaded, and served from the build rather than a
 * third-party request at runtime. `display: swap` plus the size-adjusted metrics
 * keep the layout shift at zero.
 */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

/**
 * IBM Plex Sans carries the landing page. The source design is set entirely
 * in Plex Sans at four weights; scoped rules under `.landing-page` swap the
 * family in without touching the rest of the site.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://ieee-uwu-student-branch.vercel.app";
const TITLE = "IEEE Uva Wellassa Student Branch: five societies, one branch";
const DESCRIPTION =
  "Five chartered IEEE societies operating under one student branch at Uva Wellassa University, Badulla, Sri Lanka. Society scopes, technical areas, and a record that names what is still unpublished.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | IEEE UWU Student Branch",
  },
  description: DESCRIPTION,
  applicationName: "IEEE UWU Student Branch",
  keywords: [
    "IEEE",
    "student branch",
    "Uva Wellassa University",
    "IEEE Sri Lanka Section",
    "engineering students",
    "Badulla",
    "Sri Lanka",
  ],
  authors: [{ name: "IEEE Uva Wellassa Student Branch" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "IEEE UWU Student Branch",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/photos/robotics-arm.jpg",
        width: 1800,
        height: 1198,
        alt: "IEEE Uva Wellassa Student Branch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/photos/robotics-arm.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/**
 * Structured data, describing the organisation rather than the page.
 *
 * Only fields that are actually true are included. A founding date, a member
 * count or a contact point that the branch has not published is left out
 * entirely rather than emitted as a placeholder, because a schema.org claim is a
 * factual assertion to a machine and a wrong one is worse than a missing one.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "IEEE Uva Wellassa Student Branch",
  url: SITE_URL,
  description: DESCRIPTION,
  parentOrganization: {
    "@type": "Organization",
    name: "IEEE Sri Lanka Section",
  },
  areaServed: {
    "@type": "Place",
    name: "Uva Wellassa University, Badulla, Sri Lanka",
  },
} as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${plexMono.variable} ${plexSans.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          // Static, author-controlled object literal. No user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}