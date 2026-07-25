import { Cormorant_Garamond, DM_Sans, Fraunces, Newsreader } from "next/font/google";
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

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-demo-newsreader",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-demo-cormorant",
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
      className={`${fraunces.variable} ${dmSans.variable} ${newsreader.variable} ${cormorant.variable}`}
    >
      {children}
    </div>
  );
}
