import {
  DM_Sans,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Oswald,
  Outfit,
} from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDemoSite } from "@/lib/demo-sites";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-demo-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-demo-dm-sans",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-demo-oswald",
  display: "swap",
});

const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-demo-ibm-sans",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-demo-ibm-mono",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-demo-outfit",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function DemoLayout({ children, params }: Props) {
  const { slug } = await params;
  if (!getDemoSite(slug)) notFound();

  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} ${oswald.variable} ${ibmSans.variable} ${ibmMono.variable} ${outfit.variable}`}
    >
      {children}
    </div>
  );
}
