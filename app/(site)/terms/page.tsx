import type { Metadata } from "next";
import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "Terms governing services provided by Atheus, a UK independent web design studio.",
};

const sections = [
  {
    n: "01",
    title: "These terms",
    body: (
      <>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern any work carried out by Atheus (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) for a client (&quot;you&quot;, &quot;your&quot;). They apply alongside any specific written proposal, statement of work or care-plan agreement we send you. Where a written proposal and these Terms disagree, the written proposal takes precedence for that project.
        </p>
        <p>
          By engaging us in writing — including by reply email accepting a quote — you accept these Terms.
        </p>
      </>
    ),
  },
  {
    n: "02",
    title: "Services we offer",
    body: (
      <>
        <p>Atheus offers:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>
            <strong>The Build</strong> — a one-off website design and development project, delivered against a written scope.
          </li>
          <li>
            <strong>Atheus Care</strong> — an ongoing monthly service covering hosting, monitoring, email forwarding, contact-form delivery, and a fixed allowance of small monthly edits.
          </li>
          <li>
            <strong>Additional work</strong> — any work outside an agreed scope is quoted and billed separately at our standard hourly rate (£40/hour at the date of these Terms, with a half-hour minimum).
          </li>
        </ul>
      </>
    ),
  },
  {
    n: "03",
    title: "Quotes, scope and acceptance",
    body: (
      <>
        <p>
          Before any paid work begins, we will send you a written quote describing the work, the price and the timeline. The quote is valid for 30 days unless otherwise stated.
        </p>
        <p>
          Work begins when you have accepted the quote in writing (a reply email is fine) and the deposit, if any, has cleared. We are not obliged to start work before then.
        </p>
        <p>
          Anything not explicitly listed in the quote is out of scope. Out-of-scope work will be quoted separately before it is started.
        </p>
      </>
    ),
  },
  {
    n: "04",
    title: "Payment",
    body: (
      <>
        <p>Unless your written proposal says otherwise:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>
            <strong>Builds under £200</strong> are paid in full upfront before work starts.
          </li>
          <li>
            <strong>Builds £200 and above</strong> are paid 50% upfront and 50% on launch.
          </li>
          <li>
            <strong>Atheus Care</strong> is billed monthly in advance, on the anniversary of your start date.
          </li>
          <li>
            <strong>Hourly work</strong> is invoiced on completion or at the end of each calendar month, whichever is sooner.
          </li>
        </ul>
        <p>
          Invoices are payable within 14 days. Overdue invoices may attract interest at the rate prescribed by the Late Payment of Commercial Debts (Interest) Act 1998, currently the Bank of England base rate plus 8%, plus reasonable recovery costs.
        </p>
        <p>
          We may pause or withhold delivery of work, hosting, or domain transfers while an invoice is overdue.
        </p>
      </>
    ),
  },
  {
    n: "05",
    title: "Timeline and your responsibilities",
    body: (
      <>
        <p>
          The timeline in your quote starts from the day we receive all the content we need from you — typically copy, photographs, logo, brand assets and any third-party access required.
        </p>
        <p>You agree to:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>Provide content in usable, organised form by the dates we agree</li>
          <li>Respond to feedback requests within five working days</li>
          <li>Have authority to use any content, images, fonts or logos you provide</li>
          <li>Make sure the business represented is lawful and that any claims about it are accurate</li>
          <li>Own your own domain and email accounts, and not pass them to us in your name</li>
        </ul>
        <p>
          If you don&apos;t supply content or feedback within agreed timeframes, the project may be paused. If a project is paused for more than 60 days without a clear restart date, we may treat it as cancelled and invoice for work completed to date.
        </p>
      </>
    ),
  },
  {
    n: "06",
    title: "Revisions",
    body: (
      <>
        <p>
          The number of revision rounds is set out in your written proposal. A &quot;round&quot; is a single, consolidated set of feedback covering the whole site or page in question — not a drip-feed of individual changes.
        </p>
        <p>
          Revisions beyond the agreed number are billed at our standard hourly rate. We will tell you in advance if you&apos;re about to go over.
        </p>
      </>
    ),
  },
  {
    n: "07",
    title: "Intellectual property",
    body: (
      <>
        <p>
          On full payment, you receive a perpetual, worldwide, royalty-free licence to use the final delivered website (and its design and code) for the business it was made for.
        </p>
        <p>We retain:</p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>Ownership of any underlying components, libraries, or design systems that pre-existed your project</li>
          <li>The right to display the work in our portfolio, including on atheus.dev and in pitches to other clients</li>
          <li>The right to discuss the project publicly in case studies, posts and talks</li>
        </ul>
        <p>
          You retain ownership of your content — text, images, logos, branding — and grant us a licence to use it for the purposes of delivering and showcasing the work.
        </p>
        <p>
          Until full payment is received, ownership of any deliverables remains with Atheus.
        </p>
      </>
    ),
  },
  {
    n: "08",
    title: "Content you provide",
    body: (
      <>
        <p>
          You are responsible for any content (text, images, logos, video, data) you give us. By providing it, you confirm that you own it or are properly licensed to use it, and that it does not infringe anyone&apos;s rights or break any laws.
        </p>
        <p>
          You agree to indemnify Atheus against any claims, costs, damages or expenses that arise from content you provided being unlawful, infringing or misleading.
        </p>
      </>
    ),
  },
  {
    n: "09",
    title: "Atheus Care plan",
    body: (
      <>
        <p>
          The Atheus Care plan is a rolling monthly subscription. The fee covers what is listed in the plan description on atheus.dev/pricing or your written proposal — typically hosting, monitoring, email forwarding, contact-form delivery, SSL renewals, security and framework updates, and one small edit per month.
        </p>
        <p>
          &quot;Small edit&quot; means a change that can reasonably be completed inside 30 minutes — for example updating a price, swapping a photo, or amending opening hours. Larger changes are quoted separately.
        </p>
        <p>
          Unused monthly edits roll over for up to three months and then expire.
        </p>
        <p>
          Either side may end the Care plan with 30 days written notice. On termination we will hand you a static export of the site at no charge so you can host it elsewhere. The fee for the final month is not refundable.
        </p>
      </>
    ),
  },
  {
    n: "10",
    title: "Hosting and third-party services",
    body: (
      <>
        <p>
          Where we host your site as part of the Care plan, we use third-party providers (currently Vercel and Cloudflare). We are not the operator of those services and cannot guarantee 100% uptime, but we monitor them and respond to any prolonged outage within a reasonable time during UK working hours.
        </p>
        <p>
          We are not liable for downtime, data loss, or service interruption caused by those third-party providers, but we will work with you in good faith to restore service.
        </p>
        <p>
          Domain registrations, paid third-party software, and licences (e.g. premium fonts, plugins, CMS subscriptions) are billed to you at cost where they are obtained on your behalf, or registered in your own name where possible.
        </p>
      </>
    ),
  },
  {
    n: "11",
    title: "Warranties and disclaimers",
    body: (
      <>
        <p>
          We will deliver the work with reasonable care and skill in line with normal industry practice. Outside that, deliverables are provided &quot;as is&quot;. To the maximum extent allowed by law, we exclude all other warranties, including warranties of merchantability or fitness for a particular purpose.
        </p>
        <p>
          We will fix bugs in our own work, at no charge, for 30 days after launch — provided the bug is in code we wrote and is not the result of a change you or a third party made to the site after delivery.
        </p>
        <p>
          Nothing in these Terms limits any liability that cannot lawfully be limited — including liability for death or personal injury caused by negligence, or for fraud.
        </p>
      </>
    ),
  },
  {
    n: "12",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the maximum extent permitted by law, Atheus&apos;s total liability to you in connection with these Terms — whether in contract, tort, breach of statutory duty or otherwise — is limited to the total amount you have paid us under the relevant engagement in the twelve months preceding the claim.
        </p>
        <p>
          We are not liable for indirect, consequential or special losses, including loss of profit, loss of business, loss of goodwill, loss of anticipated savings, or loss of data, even where we have been advised of the possibility of such losses.
        </p>
      </>
    ),
  },
  {
    n: "13",
    title: "Confidentiality",
    body: (
      <>
        <p>
          Both sides will keep confidential information shared during the project private and only use it to deliver the work. Information that is already public, or that is required to be disclosed by law, is not confidential under these Terms.
        </p>
        <p>
          We may discuss high-level case-study details about your project (the brief, the design approach, the outcome) for the purposes of marketing the studio. We will not share confidential commercial information without your permission.
        </p>
      </>
    ),
  },
  {
    n: "14",
    title: "Cancellation and refunds",
    body: (
      <>
        <p>
          You may cancel a Build at any time by writing to us. If you cancel:
        </p>
        <ul className="grid gap-2 pl-5 list-disc marker:text-acid">
          <li>before work has started — your deposit is refunded in full</li>
          <li>after work has started but before delivery — we keep an amount proportionate to the work completed, and refund the rest</li>
          <li>after delivery — no refund is due</li>
        </ul>
        <p>
          We may cancel an engagement if you breach these Terms (for example, by failing to pay an invoice or by providing unlawful content). In that case, we will invoice for work completed to date.
        </p>
        <p>
          The Atheus Care plan can be cancelled by either side with 30 days notice as described above.
        </p>
      </>
    ),
  },
  {
    n: "15",
    title: "Force majeure",
    body: (
      <>
        <p>
          Neither party is liable for delays or failures to perform caused by events outside reasonable control — including outages at major third-party providers, network failures, illness, natural disasters, or government action. The party affected will tell the other as soon as practical and the timeline will be extended by the time lost.
        </p>
      </>
    ),
  },
  {
    n: "16",
    title: "Governing law",
    body: (
      <>
        <p>
          These Terms and any dispute arising from them are governed by the laws of England and Wales. The courts of England and Wales have exclusive jurisdiction to resolve any dispute, except that we may bring proceedings in the courts of the country where you are based to recover unpaid amounts.
        </p>
      </>
    ),
  },
  {
    n: "17",
    title: "Changes to these Terms",
    body: (
      <>
        <p>
          We may update these Terms from time to time. Material changes will be notified to active clients by email at least 30 days before they take effect, and the effective date below will be updated. If you do not accept a change, you may terminate any rolling agreement with 30 days notice.
        </p>
      </>
    ),
  },
  {
    n: "18",
    title: "Contact",
    body: (
      <>
        <p>
          Questions about these Terms, or about an existing engagement, can be sent to{" "}
          <a className="link underline" href="mailto:hello@atheus.dev">
            hello@atheus.dev
          </a>
          .
        </p>
      </>
    ),
  },
];

const effectiveDate = "21 May 2026";

export default function TermsPage() {
  return (
    <main>
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Terms of service</p>
            <h1 className="type-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] sm:text-6xl md:text-7xl">
              The rules of the engagement, in plain English.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-chalk/68">
              Plain version: agree the scope in writing, pay on time, you own your domain and your content, we own the studio&apos;s underlying work, either side can end the monthly plan with 30 days notice. The detail below is what holds up if anything goes wrong.
            </p>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-chalk/55">
              Effective {effectiveDate} · Governed by the laws of England and Wales
            </p>
          </MotionReveal>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="container-studio">
          {sections.map((section, index) => (
            <MotionReveal key={section.n} delay={index * 0.025}>
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
            <p className="kicker">Want to talk before signing anything?</p>
            <p className="type-display mt-4 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
              Every engagement starts with a written quote. Send a few details and we&apos;ll come back with a proposal you can read in five minutes.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.06}>
            <Link href="/contact" className="studio-button studio-button-primary">
              Start a project
            </Link>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}
