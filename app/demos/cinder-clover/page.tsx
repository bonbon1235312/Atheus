import type { Metadata } from "next";
import { CinderCloverDemo } from "@/components/demos/cinder-clover-demo";

export const metadata: Metadata = {
  title: "Cinder & Clover Demo",
  description: "A fictional cafe website demo by ATHEUS.",
};

export default function CinderCloverDemoPage() {
  return <CinderCloverDemo />;
}
