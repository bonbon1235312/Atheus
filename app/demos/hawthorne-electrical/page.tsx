import type { Metadata } from "next";
import { HawthorneDemo } from "@/components/demos/hawthorne-demo";

export const metadata: Metadata = {
  title: "Hawthorne Electrical Demo",
  description: "An electrician website concept and live demo by ATHEUS.",
};

export default function HawthorneElectricalDemoPage() {
  return <HawthorneDemo />;
}
