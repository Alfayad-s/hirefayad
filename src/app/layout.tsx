import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Service Funnel | Full Stack Development Services",
  description:
    "Professional web development services for students, startups, and businesses. Portfolio sites, e‑commerce, and custom full stack solutions.",
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
            __html: `(function(){var d=document.documentElement;var t=localStorage.getItem('serviceFunnel_theme');if(t==='light'){d.classList.add('light');}else if(t==='dark'){d.classList.add('dark');}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){d.classList.add('dark');}else{d.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
