import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Must be absolute HTTPS URL for WhatsApp/social crawlers. Set NEXT_PUBLIC_APP_URL in Vercel to match your deployment.
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://hirefayad.vercel.app").replace(/\/$/, "");
const ogImageUrl = `${siteUrl}/og-image.png`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Hire Fayad",
      description: "Professional web development – build your own website. Portfolio, e‑commerce, custom web apps.",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: ["en", "hi", "ar", "ml"],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: "Hire Fayad",
      url: siteUrl,
      email: "hirefayad@gmail.com",
      telephone: "+91-9074575374",
      description: "Full stack web development: build your own website, portfolio sites, e‑commerce, custom applications. Hire Fayad – professional, modern solutions for students, startups, and businesses.",
      image: ogImageUrl,
      priceRange: "$$",
      areaServed: "Worldwide",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hire Fayad | Build Your Own Website – Professional Web Development",
    template: "%s | Hire Fayad",
  },
  description:
    "Hire Fayad: Build your own website with professional full stack development. Portfolio sites, e‑commerce, custom web apps, and landing pages. Get a quote – hirefayad@gmail.com. Book now for students, startups & businesses.",
  keywords: [
    "hire fayad",
    "hirefayad",
    "build your own website",
    "website development",
    "web development services",
    "full stack developer",
    "portfolio website",
    "ecommerce website",
    "custom web application",
    "landing page",
    "professional web developer",
    "hire web developer",
    "website builder services",
    "React",
    "Next.js",
    "book now",
  ],
  authors: [{ name: "Hire Fayad", url: siteUrl }],
  creator: "Hire Fayad",
  publisher: "Hire Fayad",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Hire Fayad",
    title: "Hire Fayad | Build Your Own Website – Book Now",
    description:
      "Professional web development: portfolio sites, e‑commerce, custom web apps. Build your own website with Hire Fayad. Get a quote – hirefayad@gmail.com",
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Hire Fayad – Build Your Own Website. Book Now. Professional web development services.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire Fayad | Build Your Own Website – Book Now",
    description: "Professional web development. Portfolio, e‑commerce, custom web apps. Get a quote – hirefayad@gmail.com",
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "Hire Fayad – Build Your Own Website. Book Now." }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: siteUrl },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <SpeedInsights />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
