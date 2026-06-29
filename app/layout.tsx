import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";

import "./globals.css";
import "./ai-studio.css";

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atheus Industries",
    template: "%s | Atheus Industries",
  },
  description:
    "Engineering intelligent systems across web, AI and robotics. An early-stage technology studio building websites, automation tools, AI systems and hardware prototypes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
