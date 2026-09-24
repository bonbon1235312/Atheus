import type { Metadata } from "next";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a website or digital product project with Atheus. Send a brief to hello@atheus.dev.",
};

export default function ContactPage() {
  return (
    <MarketingShell variant="agency">
      <section className="agency-contact">
        <div className="ax-container">
          <div className="agency-section-label"><span>Contact / Atheus Studio</span><span>Good things start with a conversation</span></div>
          <div className="agency-contact-intro">
            <h1>Let’s make<br /><em>something matter.</em></h1>
            <p>Have a new site in mind, or a product that needs shaping? Tell us the story and we’ll find the next step together.</p>
          </div>
          <a className="agency-contact-mail" href="mailto:hello@atheus.dev?subject=New%20project%20enquiry">hello@atheus.dev <span aria-hidden="true">↗</span></a>
          <div className="agency-contact-bottom">
            <div><span>01 / The brief</span><p>Tell us about your business, who it serves, and what the new site or product needs to do.</p></div>
            <div><span>02 / The starting point</span><p>Share your current site, any references you like, and your ideal timeline if you have one.</p></div>
            <div><span>03 / Product access</span><p>Looking for League or another Atheus product? Mention the product in your message, or <Link href="/admin">open the platform ↗</Link>.</p></div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
