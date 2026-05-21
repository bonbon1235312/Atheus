import type { Metadata } from "next";
import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Atheus collects, uses and protects personal information under the UK GDPR and Data Protection Act 2018.",
};

const sections = [
  {
    n: "01",
    title: "Who we are",
    body: (
      <>
        <p>
          Atheus (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a small independent web design studio based in the United Kingdom, operating at atheus.dev. Atheus is the data controller for the personal information described in this policy.
        </p>
        <p>
          If you have any questions about this policy, your information, or your rights, email us at{" "}
          <a className="link underline" href="mailto:hello@atheus.dev">
            hello@atheus.dev
          </a>
          .
        </p>
      </>
    ),
  },
  {
    n: "02",
    title: "What we collect, and when",
    body: (
      <>
        <p>
          We only collect information that you actively give us. We do not use analytics, advertising trackers, behavioural cookies, or third-party scripts that profile you.
        </p>
        <p>The contact form on atheus.dev/contact collects:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>Your name</li>
          <li>Your business name (optional)</li>
          <li>Your email address</li>
          <li>Project type and budget range (the options you select)</li>
          <li>The message you write</li>
        </ul>
        <p>
          Submitting that form is the only routine way Atheus collects personal data from a visitor. If we work together on a project, we will additionally collect what you choose to share — typically content, photographs, brand assets and access information needed to deliver the work.
        </p>
      </>
    ),
  },
  {
    n: "03",
    title: "How we use it",
    body: (
      <>
        <p>We use the information you give us to:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>Reply to your enquiry and discuss whether the studio is a good fit</li>
          <li>Send you a written quote or proposal</li>
          <li>Carry out the work you have engaged us to do</li>
          <li>Keep ordinary business records (invoices, project notes)</li>
        </ul>
        <p>
          We do not sell, rent, or share your data with third parties for marketing. We do not add you to a mailing list unless you have asked us to.
        </p>
      </>
    ),
  },
  {
    n: "04",
    title: "Lawful basis (UK GDPR)",
    body: (
      <>
        <p>We rely on the following lawful bases under Article 6 of the UK GDPR:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>
            <strong>Legitimate interests</strong> — to reply to your enquiry and run a small business correspondence with you. You can object at any time.
          </li>
          <li>
            <strong>Performance of a contract</strong> — to deliver work you have engaged us to do and handle payment.
          </li>
          <li>
            <strong>Legal obligation</strong> — to keep records HMRC or other UK authorities require.
          </li>
        </ul>
      </>
    ),
  },
  {
    n: "05",
    title: "Who processes your data on our behalf",
    body: (
      <>
        <p>
          We use a small set of trusted service providers (&quot;processors&quot;) to run the studio. Each is contractually bound to protect your data and act only on our instructions:
        </p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>
            <strong>Vercel Inc.</strong> — hosting of atheus.dev and client sites we manage. Data may be processed in the United States under appropriate safeguards.
          </li>
          <li>
            <strong>Resend</strong> — delivery of email from the contact form and from hello@atheus.dev. Stored only for as long as needed to deliver and log the message.
          </li>
          <li>
            <strong>ImprovMX / Cloudflare</strong> — forwarding of email sent to addresses on our domain to the relevant inbox.
          </li>
          <li>
            <strong>Google (Gmail)</strong> — the inbox where enquiries are read and replied to.
          </li>
        </ul>
        <p>
          We do not transfer data outside the UK or EU beyond what these providers require to operate their services. Each maintains its own data-protection certifications.
        </p>
      </>
    ),
  },
  {
    n: "06",
    title: "How long we keep it",
    body: (
      <>
        <p>
          Enquiries that don&apos;t lead to a project are kept for up to 24 months and then deleted, so we have a record of who has been in touch.
        </p>
        <p>
          Client project records are kept for six years after the end of the engagement to meet UK tax and accounting requirements (HMRC requires self-employed records to be retained for at least five years after the 31 January submission deadline).
        </p>
        <p>
          You can ask us to delete information about you at any time, except where we are legally required to keep it.
        </p>
      </>
    ),
  },
  {
    n: "07",
    title: "Cookies",
    body: (
      <>
        <p>
          atheus.dev does not set any cookies of its own. We do not run analytics, advertising pixels, or behavioural tracking.
        </p>
        <p>
          If that changes in future — for example if we add a simple, privacy-respecting visitor counter — this policy will be updated and where appropriate a consent banner will appear before any non-essential cookie is set.
        </p>
      </>
    ),
  },
  {
    n: "08",
    title: "Your rights under UK GDPR",
    body: (
      <>
        <p>You have the right to:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>Ask what personal data we hold about you (a &quot;subject access request&quot;)</li>
          <li>Ask us to correct anything that&apos;s inaccurate</li>
          <li>Ask us to delete your data (where we&apos;re not required to keep it)</li>
          <li>Ask us to restrict how we use it</li>
          <li>Ask for a copy of the data you&apos;ve given us, in a portable format</li>
          <li>Object to processing based on legitimate interests</li>
          <li>Withdraw consent at any time, where we are relying on it</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a className="link underline" href="mailto:hello@atheus.dev">
            hello@atheus.dev
          </a>
          . We aim to respond within five working days and at the latest within one month.
        </p>
      </>
    ),
  },
  {
    n: "09",
    title: "Complaints",
    body: (
      <>
        <p>
          If you&apos;re unhappy with how we have handled your personal data, we&apos;d appreciate the chance to put it right — please write to us first. You also have the right to complain to the UK Information Commissioner&apos;s Office:
        </p>
        <p>
          Information Commissioner&apos;s Office, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF — phone 0303 123 1113 —{" "}
          <a className="link underline" href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            ico.org.uk
          </a>
          .
        </p>
      </>
    ),
  },
  {
    n: "10",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We may update this policy from time to time as the studio evolves or the law changes. The effective date below tells you when it was last revised. Material changes will be highlighted on the homepage for at least 30 days.
        </p>
      </>
    ),
  },
];

const effectiveDate = "21 May 2026";

export default function PrivacyPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Privacy policy</p>
            <h1 className="type-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] sm:text-6xl md:text-7xl">
              How we handle your information.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              Plain-English version: we collect what you give us via the contact form, use it to reply to you and run the studio, never sell it, and never track you around the web. The detail below covers the rest, written to be readable.
            </p>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
              Effective {effectiveDate} · UK GDPR / Data Protection Act 2018
            </p>
          </MotionReveal>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="container-studio">
          {sections.map((section, index) => (
            <MotionReveal key={section.n} delay={index * 0.03}>
              <article className="grid gap-6 border-b border-white/12 py-10 lg:grid-cols-[160px_1fr]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-acid">§ {section.n}</p>
                <div>
                  <h2 className="type-display text-3xl font-semibold leading-tight md:text-4xl">{section.title}</h2>
                  <div className="mt-5 grid gap-4 text-chalk/82 leading-relaxed">{section.body}</div>
                </div>
              </article>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-studio grid gap-6 border-y border-white/15 py-12 md:grid-cols-[1.1fr_auto] md:items-center">
          <MotionReveal>
            <p className="kicker">Questions about your data?</p>
            <p className="type-display mt-4 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
              We&apos;d rather hear from you than have you wonder. Drop a line and we&apos;ll reply within one working day.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.06}>
            <Link href="/contact" className="studio-button studio-button-primary">
              Get in touch
            </Link>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}
