import type { Metadata } from "next";

import { ContactExperience } from "@/components/marketing/contact-experience";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Atheus about products, partnerships, access, or custom automation systems.",
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <ContactExperience />
    </MarketingShell>
  );
}
