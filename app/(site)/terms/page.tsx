import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of the atheus Discord bot and dashboard.",
};

const EFFECTIVE = "30 May 2026";

export default function TermsPage() {
  return (
    <main className="container-studio max-w-3xl py-20 md:py-28">
      <p className="kicker">Legal</p>
      <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
        Terms of Service
      </h1>
      <p className="mt-4 text-chalk/50">Effective {EFFECTIVE}</p>

      <div className="legal-body mt-12 grid gap-10">
        <section>
          <p>
            These terms govern your use of the atheus Discord bot and the dashboard at
            atheus.dev (together, the &quot;Service&quot;). By adding the bot to a server
            or using the dashboard, you agree to these terms. If you do not agree, do
            not use the Service.
          </p>
        </section>

        <section>
          <h2>The service</h2>
          <p>
            atheus is a Discord bot and web dashboard that provides community
            management features, including roles, tickets, forms, giveaways, events,
            analytics and an AI server builder. Features may change over time.
          </p>
        </section>

        <section>
          <h2>Eligibility</h2>
          <ul>
            <li>You must meet Discord&apos;s minimum age requirement for your country.</li>
            <li>
              You must comply with Discord&apos;s Terms of Service and Community
              Guidelines while using atheus.
            </li>
            <li>
              To configure a server you must have the appropriate permission (such as
              Manage Server) in that server.
            </li>
          </ul>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for anything illegal or harmful.</li>
            <li>Abuse, overload, disrupt or attempt to break the Service.</li>
            <li>Resell or rent the Service without our written permission.</li>
            <li>Use the Service to violate the rights of others.</li>
          </ul>
        </section>

        <section>
          <h2>AI server builder</h2>
          <p>
            The AI server builder produces suggested server layouts. You review and
            confirm a layout before it is applied, and any destructive action such as a
            wipe and rebuild requires your explicit confirmation. You are responsible
            for changes you choose to apply to your server. We are not liable for
            changes made at your direction.
          </p>
        </section>

        <section>
          <h2>Pro plan and billing</h2>
          <ul>
            <li>The Pro plan is a per-server subscription billed through Stripe.</li>
            <li>Subscriptions renew automatically until cancelled.</li>
            <li>You can cancel at any time, and access continues until the end of the paid period.</li>
            <li>Prices may change; we will give notice of changes before they take effect.</li>
          </ul>
        </section>

        <section>
          <h2>Availability and changes</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot;. We
            do not guarantee uninterrupted or error-free operation, and we may change,
            suspend or discontinue features at any time.
          </p>
        </section>

        <section>
          <h2>Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, atheus is not liable for any
            indirect, incidental or consequential damages, or for loss of data, profits
            or server configuration, arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2>Termination</h2>
          <p>
            We may suspend or terminate access to the Service if you breach these terms
            or misuse the Service. You may stop using the Service at any time by
            removing the bot.
          </p>
        </section>

        <section>
          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of England and Wales, without regard to
            conflict-of-law rules.
          </p>
        </section>

        <section>
          <h2>Changes to these terms</h2>
          <p>
            We may update these terms. When we do, we will change the effective date
            above. Continued use of the Service after a change means you accept the
            updated terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
