import type { Metadata } from "next";
import { CinderCloverDemo } from "@/components/demos/cinder-clover-demo";

export const metadata: Metadata = {
  title: "Cinder & Clover Demo",
  description: "A cafe website concept and live demo by ATHEUS.",
};

export default function CinderCloverDemoPage() {
  return <CinderCloverDemo />;
}
