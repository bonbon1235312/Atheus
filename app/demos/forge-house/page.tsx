import type { Metadata } from "next";
import { ForgeHouseDemo } from "@/components/demos/forge-house-demo";

export const metadata: Metadata = {
  title: "Forge House Demo",
  description: "A fictional strength gym website demo by ATHEUS.",
};

export default function ForgeHouseDemoPage() {
  return <ForgeHouseDemo />;
}
