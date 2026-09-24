import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";

import { HOME_DESCRIPTION, HOME_TITLE, SITE_ORIGIN } from "@/lib/seo";

import "./globals.css";
import "./marketing.css";
import "./agency.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: {
    default: HOME_TITLE,
    template: "%s | Atheus",
  },
  description: HOME_DESCRIPTION,
  metadataBase: new URL(SITE_ORIGIN),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: "Atheus",
    type: "website",
    locale: "en_GB",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Atheus independent digital design studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
