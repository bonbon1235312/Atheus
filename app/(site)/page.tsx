import Link from "next/link";
import type { ComponentType } from "react";
import {
  Sparkle,
  ChartLineUp,
  UsersThree,
  Ticket,
  ClipboardText,
  Gift,
} from "@phosphor-icons/react/dist/ssr";
import { MotionReveal } from "@/components/site/motion-reveal";
import { INVITE_URL } from "@/lib/site";

type IconType = ComponentType<{ size?: number; weight?: "duotone" | "fill" }>;

const heroCommands = [
  "/template ai",
  "/ticket setup",
  "/giveaway start",
  "/poll create",
  "/join-role add",
];

type Feature = {
  name: string;
  body: string;
  cmd: string;
  span: string;
  tone: "accent" | "dark" | "plain";
  icon: IconType;
  status: string;
};

const features: Feature[] = [
  {
    name: "AI server builder",
    body: "Describe your server and atheus generates roles, categories, channels and permissions. Preview, apply, or wipe and rebuild with a snapshot.",
    cmd: "/template ai",
    span: "lg:col-span-2",
    tone: "accent",
    icon: Sparkle,
    status: "Live",
  },
  {
    name: "Analytics",
    body: "See how your community grows: joins, activity and retention.",
    cmd: "/stats server",
    span: "lg:col-span-1",
    tone: "plain",
    icon: ChartLineUp,
    status: "Live",
  },
  {
    name: "Roles & onboarding",
    body: "Join roles, reaction roles and welcome flows.",
    cmd: "/join-role add",
    span: "lg:col-span-1",
    tone: "plain",
    icon: UsersThree,
    status: "Live",
  },
  {
    name: "Tickets",
    body: "Support tickets with open, claim, add, remove, close and transcripts you can read on the web.",
    cmd: "/ticket setup",
    span: "lg:col-span-2",
    tone: "dark",
    icon: Ticket,
    status: "Live",
  },
  {
    name: "Forms & applications",
    body: "Build staff applications members fill in, with responses in your inbox and dashboard.",
    cmd: "/form create",
    span: "lg:col-span-2",
    tone: "plain",
    icon: ClipboardText,
    status: "Live",
  },
  {
    name: "Giveaways & events",
    body: "Run giveaways and quick polls, then track entrants, status and winners from the dashboard.",
    cmd: "/giveaway start",
    span: "lg:col-span-1",
    tone: "plain",
    icon: Gift,
    status: "Live",
  },
];

const replaced = ["MEE6", "Carl-bot", "Ticket Tool", "GiveawayBot", "Dyno"];

const freePlan = [
  "Every core feature included",
  "Unlimited join & reaction roles",
  "Tickets, forms, giveaways, events",
  "AI server builder, 3 builds per server",
  "7-day analytics",
];

const proPlan = [
  "Everything in Free, unlimited",
  "Web ticket transcripts",
  "Full analytics history",
  "Saved AI templates",
  "atheus branding removed",
  "Priority support",
];

const allAccessPlan = [
  "Everything in Pro",
  "Every server you own",
  "New servers covered automatically",
  "One subscription, one bill",
  "Priority support",
];

type Tier = {
  name: string;
  price: string;
  per: string;
  tag: string;
  blurb: string;
  items: string[];
  highlight: boolean;
  cta: { label: string; href: string; external: boolean };
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "£0",
    per: "",
    tag: "",
    blurb: "Everything a community needs to start.",
    items: freePlan,
    highlight: false,
    cta: { label: "Add to Discord", href: INVITE_URL, external: true },
  },
  {
    name: "Pro",
    price: "£5",
    per: "/mo",
    tag: "Per server",
    blurb: "One server, fully unlocked.",
    items: proPlan,
    highlight: false,
    cta: { label: "Upgrade a server", href: "/dashboard/upgrade", external: false },
  },
  {
    name: "All-Access",
    price: "£15",
    per: "/mo",
    tag: "Best value",
    blurb: "Every server you own, one bill.",
    items: allAccessPlan,
    highlight: true,
    cta: { label: "Get All-Access", href: "/dashboard/upgrade", external: false },
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="container-studio flex min-h-[calc(100dvh-72px)] items-center py-20">
        <div className="grid w-full gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <MotionReveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-chalk/70">
              <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
              Discord Community OS
            </span>
            <h1 className="type-display mt-6 text-5xl font-semibold leading-[1.03] md:text-7xl">
              Replace half your Discord bots with one.
            </h1>
            <p className="mt-6 max-w-md text-lg text-chalk/64">
              Roles, tickets, forms, giveaways, events and analytics. One bot, one
              dashboard, one bill.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={INVITE_URL} target="_blank" rel="noreferrer" className="studio-button studio-button-primary">
                Add to Discord
              </a>
              <Link href="/dashboard" className="studio-button studio-button-secondary">
                Open dashboard
              </Link>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.12}>
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-graphite shadow-studio">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <span className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-acid text-[13px] font-bold text-white">a</span>
                  <span className="type-mono text-xs text-chalk/55">atheus</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/35">
                  Commands
                </span>
              </div>
              <ul className="divide-y divide-white/[0.06]">
                {heroCommands.map((cmd) => (
                  <li key={cmd} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blurpleHi" aria-hidden="true" />
                    <span className="type-mono text-sm text-chalk/85">{cmd}</span>
                  </li>
                ))}
              </ul>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* Replace the stack */}
      <section className="border-y border-white/10 py-20">
        <div className="container-studio">
          <MotionReveal className="mx-auto max-w-3xl text-center">
            <p className="type-display text-3xl font-medium leading-snug text-chalk/80 md:text-4xl">
              Most servers juggle four to eight bots to run a community.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {replaced.map((name) => (
                <span key={name} className="type-mono text-base text-chalk/35 line-through decoration-flare/70">
                  {name}
                </span>
              ))}
            </div>
            <p className="type-display mt-8 text-4xl font-semibold tracking-tight md:text-6xl">
              atheus does <span className="text-blurpleHi">all of it.</span>
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-studio py-24">
        <MotionReveal>
          <h2 className="type-display max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            Everything your server actually runs on.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-chalk/60">
            Six tools most communities pay several bots for, together in one place.
          </p>
        </MotionReveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Glyph = f.icon;
            return (
              <MotionReveal key={f.name} delay={i * 0.04} className={f.span}>
                <article
                  className={`feature-tile h-full ${
                    f.tone === "accent"
                      ? "border-blurpleHi/30 bg-acid/[0.08]"
                      : f.tone === "dark"
                      ? "bg-slate"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl ${
                          f.tone === "accent" ? "bg-acid text-white" : "bg-white/5 text-blurpleHi"
                        }`}
                      >
                        <Glyph size={22} weight="duotone" />
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                          f.status === "Live" ? "text-signal" : "text-chalk/35"
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">{f.name}</h3>
                    <p className="mt-2.5 max-w-md text-chalk/60">{f.body}</p>
                  </div>
                  <span className="type-mono mt-8 text-sm text-blurpleHi">{f.cmd}</span>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      {/* Dashboard */}
      <section className="border-t border-white/10 py-24">
        <div className="container-studio grid gap-14 lg:grid-cols-2 lg:items-center">
          <MotionReveal>
            <h2 className="type-display text-4xl font-semibold leading-tight md:text-6xl">
              Set it up in the browser, not the chat box.
            </h2>
            <p className="mt-6 max-w-md text-lg text-chalk/62">
              Log in with Discord, pick a server, and configure every feature from a
              real dashboard. No cryptic commands to memorise.
            </p>
            <Link href="/dashboard" className="studio-button studio-button-secondary mt-8 inline-flex">
              Open dashboard
            </Link>
          </MotionReveal>

          <MotionReveal delay={0.1}>
            {/* Real mini-preview of the actual join-role config (not a mock screenshot). */}
            <div className="mock-browser">
              <div className="mock-browser-bar">
                <span className="mock-browser-dot" />
                <span className="mock-browser-dot" />
                <span className="mock-browser-dot" />
                <span className="type-mono ml-3 text-xs text-chalk/40">atheus.dev/dashboard</span>
              </div>
              <div className="p-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blurpleHi">Join roles</p>
                <p className="mt-3 text-lg font-semibold">Give new members their roles.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Member", "Unverified", "Level 1"].map((r) => (
                    <span key={r} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-chalk/85">
                      {r}
                      <span className="text-chalk/35">x</span>
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-chalk/45">
                  <span>Add a role</span>
                  <span className="type-mono text-blurpleHi">+</span>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-studio py-24">
        <MotionReveal>
          <p className="kicker">Pricing</p>
          <h2 className="type-display mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            Start free. Upgrade when you grow.
          </h2>
        </MotionReveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <MotionReveal key={t.name} delay={i * 0.06}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-7 ${
                  t.highlight ? "border-blurpleHi/30 bg-acid/[0.08]" : "border-white/12 bg-graphite"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-bold uppercase tracking-[0.14em] ${
                      t.highlight ? "text-blurpleHi" : "text-chalk/50"
                    }`}
                  >
                    {t.name}
                  </p>
                  {t.tag && (
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                        t.highlight ? "border-blurpleHi/40 text-blurpleHi" : "border-white/15 text-chalk/45"
                      }`}
                    >
                      {t.tag}
                    </span>
                  )}
                </div>
                <p className="type-display mt-5 text-5xl font-semibold tracking-tight">
                  {t.price}
                  {t.per && <span className="text-xl font-medium text-chalk/45">{t.per}</span>}
                </p>
                <p className="mt-2 text-chalk/55">{t.blurb}</p>
                <ul className="mt-7 grid flex-1 gap-3 text-chalk/85">
                  {t.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                          t.highlight ? "bg-acid text-white" : "bg-white/8 text-blurpleHi"
                        }`}
                        aria-hidden="true"
                      >
                        <Sparkle size={11} weight="fill" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {t.cta.external ? (
                  <a
                    href={t.cta.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`studio-button mt-9 justify-center ${
                      t.highlight ? "studio-button-primary" : "studio-button-secondary"
                    }`}
                  >
                    {t.cta.label}
                  </a>
                ) : (
                  <Link
                    href={t.cta.href}
                    className={`studio-button mt-9 justify-center ${
                      t.highlight ? "studio-button-primary" : "studio-button-secondary"
                    }`}
                  >
                    {t.cta.label}
                  </Link>
                )}
              </div>
            </MotionReveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-chalk/45">
          Upgrade any server from your dashboard, or get All-Access to cover every server you own.
          Cancel anytime.
        </p>
      </section>

      {/* Final CTA */}
      <section className="container-studio pb-28 pt-4">
        <MotionReveal>
          <div className="relative overflow-hidden rounded-3xl border border-blurpleHi/25 bg-acid/[0.1] px-8 py-20 text-center">
            <h2 className="type-display mx-auto max-w-3xl text-4xl font-semibold leading-[1.04] tracking-tight md:text-6xl">
              Replace your bot stack today.
            </h2>
            <div className="mt-9 flex justify-center">
              <a href={INVITE_URL} target="_blank" rel="noreferrer" className="studio-button studio-button-primary">
                Add to Discord
              </a>
            </div>
            <p className="mt-6 text-sm text-chalk/55">Free to add. Live in minutes.</p>
          </div>
        </MotionReveal>
      </section>
    </main>
  );
}
