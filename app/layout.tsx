import type { Metadata } from "next";
import { Cormorant_Garamond, Inter_Tight } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atheus.dev"),
  title: {
    default: "ATHEUS | Design-led websites for independent businesses",
    template: "%s | ATHEUS",
  },
  description:
    "ATHEUS is a premium creative web studio building design-led websites with clarity, motion, and identity for independent businesses.",
  applicationName: "ATHEUS",
  authors: [{ name: "ATHEUS", url: "https://atheus.dev" }],
  creator: "ATHEUS",
  publisher: "ATHEUS",
  openGraph: {
    title: "ATHEUS | Design-led websites for independent businesses",
    description:
      "Premium creative web design and frontend development for independent businesses.",
    url: "https://atheus.dev",
    siteName: "ATHEUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATHEUS | Design-led websites for independent businesses",
    description:
      "Premium creative web design and frontend development for independent businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
