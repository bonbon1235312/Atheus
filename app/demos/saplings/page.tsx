import type { Metadata } from "next";
import { SaplingsDemo } from "@/components/demos/saplings-demo";

export const metadata: Metadata = {
  title: "Saplings Demo",
  description: "A fictional restaurant website demo by ATHEUS.",
};

export default function SaplingsDemoPage() {
  return <SaplingsDemo />;
}
