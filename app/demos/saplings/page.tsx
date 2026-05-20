import type { Metadata } from "next";
import { SaplingsDemo } from "@/components/demos/saplings-demo";

export const metadata: Metadata = {
  title: "Saplings Demo",
  description: "A restaurant website concept and live demo by ATHEUS.",
};

export default function SaplingsDemoPage() {
  return <SaplingsDemo />;
}
