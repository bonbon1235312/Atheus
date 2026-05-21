import type { Metadata } from "next";
import Link from "next/link";
import { MotionReveal } from "@/components/site/motion-reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Atheus pricing for one-off website builds and the Atheus Care managed monthly plan. Launch pricing for the first three clients.",
};

const buildIncludes = [
  "Single-page custom-designed website",
  "Up to six sections, built from your brand and content",
  "Two rounds of revisions",
  "Mobile, tablet and desktop responsive",
  "Delivered within 21 days of receiving your content",
  "Final source files and live URL handed over on launch",
];

const buildExcludes = [
  "Logo design",
  "Copywriting beyond minor polish",
  "Stock photography beyond five images",
  "E-commerce, bookings or third-party integrations",
  "SEO content, ads or social campaigns",
  "Further revisions beyond round two (£40/hr)",
];

const careIncludes = [
  "Your site hosted on your own domain, fast and monitored",
  "Free email forwarding (hello@yourbusiness.co.uk → your inbox)",
  "Working contact form delivering enquiries to your inbox",
  "SSL renewals, security and framework updates handled",
  "One small edit per month (e.g. update opening hours, swap a photo, change a price)",
  "Unused edits roll over up to three months",
  "Uptime monitoring — we know if your site goes down before you do",
  "Annual review call to keep the site current",
];

const careExcludes = [
  "New pages or major redesigns (quoted separately)",
  "Copywriting, photography, paid ads, SEO content",
  "E-commerce, booking systems, custom integrations",
];

export default function PricingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="section-pad">
        <div className="container-studio">
          <MotionReveal>
            <p className="kicker">Pricing</p>
            <h1 className="type-display mt-4 max-w-5xl text-6xl font-semibold leading-[0.95] sm:text-7xl md:text-8xl">
              Two ways to work together. <em className="italic text-acid">Both honest.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-chalk/70">
              A clear one-off build for businesses that want to own the site outright, or a small monthly plan for businesses that would rather we handle the technical side. No lock-in either way.
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* Launch pricing banner */}
      <section className="border-y border-acid/40 bg-acid text-ink">
        <div className="container-studio flex flex-wrap items-center justify-between gap-6 py-7">
          <MotionReveal className="flex items-baseline gap-5">
            <p className="text-xs font-black uppercase tracking-[0.24em]">Launch pricing</p>
            <p className="type-display text-2xl font-semibold leading-none md:text-3xl">
              First three clients · £90 + optional £25/month
            </p>
          </MotionReveal>
          <MotionReveal delay={0.05}>
            <Link href="/contact?tier=launch" className="text-xs font-black uppercase tracking-[0.2em] underline underline-offset-4">
              Claim a spot →
            </Link>
          </MotionReveal>
        </div>
      </section>

      {/* Two tiers */}
      <section className="section-pad">
        <div className="container-studio grid gap-px bg-white/12 md:grid-cols-2">
          {/* The Build */}
          <MotionReveal className="bg-ink">
            <article className="flex h-full flex-col p-8 md:p-10">
              <p className="kicker">The Build</p>
              <p className="mt-6 flex items-baseline gap-3">
                <span className="type-display text-7xl font-semibold leading-none">£90</span>
                <span className="text-sm font-black uppercase tracking-[0.18em] text-chalk/55">one-off · first three</span>
              </p>
              <p className="mt-6 max-w-md text-chalk/72">
                A bespoke single-page website, designed and built from scratch around the business. You own the source files. After launch you're free to host it wherever you like.
              </p>

              <div className="mt-10 border-t border-white/15 pt-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">What you get</p>
                <ul className="mt-5 grid gap-3 text-chalk/85">
                  {buildIncludes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1 w-3 shrink-0 bg-acid" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-white/15 pt-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-chalk/50">Not included</p>
                <ul className="mt-5 grid gap-3 text-chalk/55">
                  {buildExcludes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1 w-3 shrink-0 bg-chalk/25" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact?tier=build"
                className="studio-button studio-button-secondary mt-10 self-start"
              >
                Start a build
              </Link>
            </article>
          </MotionReveal>

          {/* The Care plan */}
          <MotionReveal delay={0.06} className="bg-graphite">
            <article className="relative flex h-full flex-col p-8 md:p-10">
              <span className="absolute right-8 top-8 inline-flex items-center rounded-full border border-acid bg-acid/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-acid">
                Most clients
              </span>

              <p className="kicker">Atheus Care</p>
              <p className="mt-6 flex items-baseline gap-3">
                <span className="type-display text-7xl font-semibold leading-none">£25</span>
                <span className="text-sm font-black uppercase tracking-[0.18em] text-chalk/55">per month · rolling</span>
              </p>
              <p className="mt-6 max-w-md text-chalk/72">
                Add this to the build for a hands-off site, or take it as the whole package. We handle hosting, email forwarding, the contact form, security updates and small monthly edits — on your own domain.
              </p>

              <div className="mt-10 border-t border-white/15 pt-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">What's included</p>
                <ul className="mt-5 grid gap-3 text-chalk/85">
                  {careIncludes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1 w-3 shrink-0 bg-acid" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-white/15 pt-7">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-chalk/50">Not included</p>
                <ul className="mt-5 grid gap-3 text-chalk/55">
                  {careExcludes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1 w-3 shrink-0 bg-chalk/25" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact?tier=care"
                className="studio-button studio-button-primary mt-10 self-start"
              >
                Start with Care
              </Link>
            </article>
          </MotionReveal>
        </div>
      </section>

      {/* Exit clause / trust moment */}
      <section className="section-pad border-y border-white/10 bg-chalk text-ink">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionReveal>
            <p className="font-black uppercase tracking-[0.2em] text-flare">No lock-in</p>
            <h2 className="type-display mt-3 text-5xl font-semibold leading-[1.0] md:text-7xl">
              Your site, <em>your domain,</em> your decision.
            </h2>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <div className="grid gap-6 text-lg leading-relaxed text-black/74">
              <p>
                Your domain is registered in your name, by you, and stays yours. We never hold a client's domain on the Atheus account — it's the single most common trap in this industry, and we don't do it.
              </p>
              <p>
                The Atheus Care plan is rolling monthly. Cancel any time with thirty days notice. If you leave, we hand you a static export of your site you can host anywhere — Netlify, Vercel, your own server — for free.
              </p>
              <p>
                Build clients (£90 only) leave on day one with the source files. You're free to take it anywhere.
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad">
        <div className="container-studio grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <MotionReveal>
            <p className="kicker">Common questions</p>
            <h2 className="type-display mt-4 text-5xl font-semibold leading-[1.0] md:text-7xl">
              The honest answers.
            </h2>
          </MotionReveal>
          <div className="grid gap-0">
            {[
              {
                q: "Why so cheap for the first three?",
                a: "I'm building the portfolio with real businesses, not stock examples. Three actual clients turn 'look at these demos' into 'here is the plumbing firm in Sheffield we launched last month.' The price reflects that trade — testimonials and photographs in exchange for a heavy discount on a build that's normally £600 to £1,500.",
              },
              {
                q: "What if my project is bigger than one page?",
                a: "Quoted separately on the call. A typical three-to-five page small-business site sits between £400 and £900 outside the launch tier, depending on what's needed.",
              },
              {
                q: "Do I need to buy a domain before we start?",
                a: "Easier if you do, but I can walk you through it. We recommend Cloudflare Registrar or Namecheap. Budget around £15 a year for a .co.uk or .com. The domain is registered in your name, not ours.",
              },
              {
                q: "What about pictures? I don't have any.",
                a: "Five stock images sourced for you are included in the build. For real photography, I can recommend local photographers or you can use what you already have on a phone — most small businesses have more than they think.",
              },
              {
                q: "What if I just want one small change after launch?",
                a: "If you're on Atheus Care, that's covered each month. If you're build-only, small jobs are £40 an hour with a half-hour minimum.",
              },
              {
                q: "Are there contracts?",
                a: "A simple written agreement before any money moves — covers scope, timeline, payment, and how we wrap up if either side wants to step away. Plain English, one page.",
              },
            ].map((item, index) => (
              <MotionReveal key={item.q} delay={index * 0.035}>
                <details className="group border-t border-white/12 py-5 last:border-b">
                  <summary className="flex cursor-pointer items-baseline justify-between gap-5 list-none">
                    <span className="type-display text-2xl font-semibold leading-tight md:text-3xl">{item.q}</span>
                    <span className="text-xs font-black tracking-[0.2em] text-acid transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-chalk/72">{item.a}</p>
                </details>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad">
        <div className="container-studio grid gap-8 border-y border-white/15 py-12 md:grid-cols-[1.1fr_auto] md:items-center">
          <MotionReveal>
            <p className="kicker">Ready?</p>
            <h2 className="type-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] md:text-7xl">
              Three launch spots open. <em className="italic text-acid">Then prices rise.</em>
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-chalk/70">
              First-three launch pricing is exactly that — for the first three businesses to commit. From client four onwards the build is £400 and the Care plan is the same.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.08}>
            <Link href="/contact" className="studio-button studio-button-primary">
              Start a project
            </Link>
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}
