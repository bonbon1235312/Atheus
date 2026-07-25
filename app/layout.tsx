import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";

import "./globals.css";
import "./marketing.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Atheus",
    template: "%s | Atheus",
  },
  description:
    "Atheus builds premium SaaS products and fully custom websites. From £600 for small business sites.",
  metadataBase: new URL(process.env.AUTH_URL ?? "https://atheus.dev"),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Atheus",
    description:
      "Custom websites from £600. SaaS products and automation platforms built with serious craft.",
    url: "/",
    siteName: "Atheus",
    type: "website",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atheus",
    description:
      "Custom websites from £600. SaaS products and automation platforms built with serious craft.",
    images: ["/brand/og-default.png"],
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
