import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atheus.dev"),
  title: {
    default: "atheus — one bot for your whole Discord server",
    template: "%s | atheus",
  },
  description:
    "atheus is a Discord Community OS: roles, tickets, forms, giveaways, events and analytics in one bot, configured from a real web dashboard. Replace half your bots with one.",
  applicationName: "atheus",
  creator: "atheus",
  publisher: "atheus",
  openGraph: {
    title: "atheus — one bot for your whole Discord server",
    description:
      "Roles, tickets, forms, giveaways, events and analytics in one bot. Replace half your Discord bots with one.",
    url: "https://atheus.dev",
    siteName: "atheus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "atheus — one bot for your whole Discord server",
    description:
      "Roles, tickets, forms, giveaways, events and analytics in one bot.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
