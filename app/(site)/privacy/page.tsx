import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How atheus collects, uses and protects data for the Discord bot and dashboard.",
};

const EFFECTIVE = "30 May 2026";

export default function PrivacyPage() {
  return (
    <main className="container-studio max-w-3xl py-20 md:py-28">
      <p className="kicker">Legal</p>
      <h1 className="type-display mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-chalk/50">Effective {EFFECTIVE}</p>

      <div className="legal-body mt-12 grid gap-10">
        <section>
          <p>
            This policy explains what data atheus (&quot;atheus&quot;, &quot;we&quot;,
            &quot;us&quot;) collects when you add our Discord bot to a server or sign in
            to the dashboard at atheus.dev, how we use it, and the choices you have. By
            using atheus you agree to this policy.
          </p>
        </section>

        <section>
          <h2>What we collect</h2>
          <h3>From Discord (the bot)</h3>
          <ul>
            <li>Server (guild) IDs and names where the bot is added.</li>
            <li>
              Role, channel and message IDs needed to run the features you enable (for
              example join roles, reaction roles, tickets and giveaways).
            </li>
            <li>
              User IDs of members who interact with a feature (for example opening a
              ticket, submitting a form, or entering a giveaway).
            </li>
            <li>
              We do not read or store general message content beyond what a feature you
              enable specifically requires.
            </li>
          </ul>

          <h3>From the dashboard (Discord login)</h3>
          <ul>
            <li>
              When you sign in with Discord we receive your Discord user ID, username,
              avatar and the list of servers you can manage.
            </li>
            <li>
              A Discord access token is used to show your servers and roles. It is held
              only for your session and is not shared.
            </li>
            <li>The configuration you set for each server.</li>
          </ul>

          <h3>AI server builder</h3>
          <ul>
            <li>
              When you use the AI server builder, the text description you submit is
              sent to our AI provider to generate a server layout. Do not include
              sensitive personal information in that description.
            </li>
          </ul>

          <h3>Billing</h3>
          <ul>
            <li>
              Payments for the Pro plan are processed by Stripe. We store your
              subscription status and identifiers, not your card details.
            </li>
          </ul>
        </section>

        <section>
          <h2>How we use data</h2>
          <ul>
            <li>To provide and operate the bot features and the dashboard.</li>
            <li>To apply the configuration you set to your server.</li>
            <li>To process Pro subscriptions and provide support.</li>
            <li>To keep the service secure and diagnose problems.</li>
          </ul>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>
            We do not sell your data. We use the following service providers to run
            atheus, and share only what each needs to do its job:
          </p>
          <ul>
            <li>Discord, to operate the bot and sign-in.</li>
            <li>Supabase, for database and hosting of configuration and feature data.</li>
            <li>Stripe, to process Pro payments.</li>
            <li>Groq, to generate AI server layouts from the text you submit.</li>
          </ul>
        </section>

        <section>
          <h2>Retention</h2>
          <p>
            We keep a server&apos;s data while the bot is in that server and your
            account is active. If you remove the bot, or ask us to delete your data, we
            remove the associated configuration and feature data, except where we must
            keep limited records for legal or billing reasons.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <ul>
            <li>Remove the bot from a server at any time to stop new data collection.</li>
            <li>
              Request access to, or deletion of, your data by emailing{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </li>
          </ul>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            We take reasonable measures to protect your data. No method of transmission
            or storage is completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            atheus is not directed to anyone under the minimum age required to use
            Discord in their country. Do not use atheus if you are under that age.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>
            We may update this policy. When we do, we will change the effective date
            above. Continued use of atheus after a change means you accept the updated
            policy.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about privacy? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
