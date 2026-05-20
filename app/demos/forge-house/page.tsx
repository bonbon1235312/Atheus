import type { Metadata } from "next";
import { ForgeHouseDemo } from "@/components/demos/forge-house-demo";

export const metadata: Metadata = {
  title: "Forge House Demo",
  description: "A strength gym website concept and live demo by ATHEUS.",
};

export default function ForgeHouseDemoPage() {
  return <ForgeHouseDemo />;
}
