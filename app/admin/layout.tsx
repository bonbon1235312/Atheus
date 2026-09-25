import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description: "Sign in to manage an Atheus league.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
