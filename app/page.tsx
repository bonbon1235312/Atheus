import Link from "next/link";

const DISCORD_URL = "https://discord.gg/dPrMMc82bf";

const capabilities = [
  {
    n: "01",
    title: "Fixture generation",
    body: "Build a full round-robin season in seconds. Set your match windows, configure divisions, publish — done before the kettle boils.",
    badge: "Seconds, not hours",
  },
  {
    n: "02",
    title: "EA result verification",
    body: "Atheus matches scheduled clubs to real EA data and surfaces each discovered result for admin review. Zero guesswork, zero manual entry.",
    badge: "Human-approved",
  },
  {
    n: "03",
    title: "Live player statistics",
    body: "Every approved match becomes a ranked leaderboard row and a player profile. Ratings, goals, assists — position-aware and always current.",
    badge: "Always current",
  },
  {
    n: "04",
    title: "Public league website",
    body: "Your league gets a real home at yourleague.atheus.dev. Fixtures, results, table, player stats, club pages — all branded to your colours.",
    badge: "Ready to share",
  },
  {
    n: "05",
    title: "Discord operations",
    body: "Commands, graphics and team data stay scoped to your Discord server. Multiple leagues never bleed into each other.",
    badge: "Guild-isolated",
  },
];

const steps = [
  {
    n: "01",
    title: "Sign in with Discord",
    body: "Your Discord account proves which servers you manage. No extra sign-up — one click and you're in.",
  },
  {
    n: "02",
    title: "Name your league",
    body: "Set the league name, pick your club colours and choose a public address. Your site at yourleague.atheus.dev goes live the moment you finish.",
  },
  {
    n: "03",
    title: "Add your clubs",
    body: "Link each club to its EA Pro Clubs ID. Atheus uses this to identify real match data automatically — no manual entry ever.",
  },
  {
    n: "04",
    title: "Generate the season",
    body: "Set your match windows and Atheus builds a full round-robin fixture calendar. Publish it to your league site in one click.",
  },
  {
    n: "05",
    title: "Atheus runs the rest",
    body: "After each matchday, Atheus finds results in EA's data and surfaces them for approval. Approve — and every leaderboard updates instantly.",
  },
];

const standingsRows = [
  { pos: "1", name: "Born 2 Say Wesh", p: "6", w: "5", pts: "15", highlight: true },
  { pos: "2", name: "OG Black Mamba", p: "6", w: "4", pts: "12" },
  { pos: "3", name: "EliteXII", p: "6", w: "3", pts: "11" },
  { pos: "4", name: "Oscroh Dynasty", p: "6", w: "3", pts: "10" },
];

export default function Home() {
  return (
    <main className="landing-shell">
      <div className="landing-ambient" aria-hidden="true" />

      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="Atheus home">
          <span>A</span>
          <strong>atheus</strong>
        </Link>

        <nav aria-label="Primary navigation">
          <a href="#capabilities">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href={DISCORD_URL} rel="noreferrer" target="_blank">Discord</a>
        </nav>

        <Link className="landing-nav-action" href="/admin">
          Start your league
        </Link>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-status">
            <i />
            Built for EA FC Pro Clubs leagues
          </p>
          <h1>Give your league a proper home.</h1>
          <p className="landing-lead">
            Atheus handles everything — fixtures, verified EA results, live
            player stats and a public website. One platform, built for
            league owners who take it seriously.
          </p>
          <div className="landing-actions">
            <Link className="landing-button landing-button-primary" href="/admin">
              Start for free
            </Link>
            <a
              className="landing-button landing-button-ghost"
              href={DISCORD_URL}
              rel="noreferrer"
              target="_blank"
            >
              Join our Discord
            </a>
          </div>
        </div>

        <div className="landing-site-preview" aria-label="Atheus league website preview">
          <div className="site-preview-bar">
            <span className="site-preview-dots">
              <i /><i /><i />
            </span>
            <span className="site-preview-url">
              <i />
              northstar.atheus.dev
            </span>
          </div>
          <div className="site-preview-body">
            <div className="site-preview-nav">
              <span className="site-preview-badge">NP</span>
              <strong>NORTHSTAR PRO</strong>
              <div className="site-preview-nav-links">
                <span>Home</span>
                <span>Fixtures</span>
                <span>Table</span>
                <span>Stats</span>
              </div>
            </div>
            <div className="site-preview-hero">
              <p>Season 2 / Europe/London</p>
              <h3>
                NORTHSTAR<br />
                PRO LEAGUE
              </h3>
              <div className="site-preview-stats">
                <div><b>12</b><small>Clubs</small></div>
                <div><b>132</b><small>Fixtures</small></div>
                <div><b>84</b><small>Approved</small></div>
              </div>
            </div>
            <div className="site-preview-table">
              {standingsRows.map((row) => (
                <div
                  key={row.pos}
                  className={`site-preview-row${row.highlight ? " is-first" : ""}`}
                >
                  <b>{row.pos}</b>
                  <span>{row.name}</span>
                  <small>{row.p}</small>
                  <small>{row.w}</small>
                  <em>{row.pts}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <div className="landing-proof-bar">
        <span><b>Free</b> for your first league</span>
        <i />
        <span><b>Automated</b> EA result collection</span>
        <i />
        <span><b>Live</b> website from day one</span>
        <i />
        <span><b>Zero</b> spreadsheets</span>
      </div>

      {/* ── Capabilities ───────────────────────────────────────────── */}
      <section className="landing-section" id="capabilities">
        <div className="landing-section-head">
          <p className="landing-kicker">Everything included</p>
          <h2>Less admin. Better matchdays.</h2>
        </div>

        <div className="landing-capabilities">
          {capabilities.map((cap) => (
            <div className="landing-cap" key={cap.n}>
              <span className="cap-num">{cap.n}</span>
              <div className="cap-content">
                <h3>{cap.title}</h3>
                <p>{cap.body}</p>
              </div>
              <span className="cap-badge">{cap.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="landing-section landing-steps-section" id="how-it-works">
        <div className="landing-section-head">
          <p className="landing-kicker">Get started</p>
          <h2>Live in under ten minutes.</h2>
          <p className="landing-section-sub">
            No configuration maze. No waiting room. Atheus gives you a
            real, working league operation the same day you sign up.
          </p>
        </div>

        <div className="landing-steps">
          {steps.map((step, i) => (
            <div className="landing-step" key={step.n}>
              <div className="step-left">
                <span className="step-num">{step.n}</span>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>
              <div className="step-body">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="steps-cta">
          <Link className="landing-button landing-button-primary" href="/admin">
            Create your league workspace
          </Link>
        </div>
      </section>

      {/* ── Community / Discord ────────────────────────────────────── */}
      <section className="landing-community">
        <div className="community-inner">
          <div className="community-copy">
            <p className="landing-kicker">Join the community</p>
            <h2>Built alongside the people who run leagues.</h2>
            <p>
              Every feature in Atheus came from real league owners — the
              people who stay up late approving results and chasing
              clubs for their squad photos. Join the Discord to share
              feedback, see what&apos;s coming, and get help when you
              need it.
            </p>
            <a
              className="landing-button landing-button-primary"
              href={DISCORD_URL}
              rel="noreferrer"
              target="_blank"
            >
              Join Discord
            </a>
          </div>
          <div className="community-panel">
            <div className="discord-preview">
              <div className="discord-preview-header">
                <i className="discord-icon" aria-hidden="true" />
                <span>atheus</span>
                <small>discord server</small>
              </div>
              <div className="discord-channels">
                <div className="discord-channel is-active">
                  <span>#</span> general
                </div>
                <div className="discord-channel">
                  <span>#</span> feedback
                </div>
                <div className="discord-channel">
                  <span>#</span> announcements
                </div>
                <div className="discord-channel">
                  <span>#</span> league-showcase
                </div>
              </div>
              <div className="discord-messages">
                <div className="discord-msg">
                  <span>EvanR</span>
                  <p>just set up my third league with atheus, took about 8 minutes</p>
                </div>
                <div className="discord-msg">
                  <span>Kaiyo</span>
                  <p>the EA verification is genuinely clean — zero manual work</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section className="landing-section landing-pricing" id="pricing">
        <div className="landing-section-head">
          <p className="landing-kicker">Pricing</p>
          <h2>Start free. Stay free if one league is enough.</h2>
          <p className="landing-section-sub">
            No trial. No credit card. The free tier is fully featured — every
            tool available from day one for your first league.
          </p>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <header>
              <p>Starter</p>
              <strong>£0</strong>
              <span>One active league, forever.</span>
            </header>
            <ul>
              <li>Full public league website</li>
              <li>Automated fixture generation</li>
              <li>EA result verification</li>
              <li>Live player leaderboards</li>
              <li>Discord bot operations</li>
            </ul>
            <Link className="landing-button landing-button-outline" href="/admin">
              Create a league
            </Link>
          </article>

          <article className="pricing-card is-featured">
            <header>
              <p>Premium</p>
              <strong>
                £8<small>/mo</small>
              </strong>
              <span>Unlimited leagues, one account.</span>
            </header>
            <ul>
              <li>Everything in Starter</li>
              <li>Unlimited active leagues</li>
              <li>Single account across all leagues</li>
              <li>Priority platform support</li>
            </ul>
            <Link className="landing-button landing-button-primary" href="/upgrade">
              Upgrade to Premium
            </Link>
          </article>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="landing-final-cta">
        <div className="final-cta-inner">
          <p className="landing-kicker">Ready when you are</p>
          <h2>Your league deserves better than a spreadsheet.</h2>
          <div className="landing-actions">
            <Link className="landing-button landing-button-primary" href="/admin">
              Start your league free
            </Link>
            <a
              className="landing-button landing-button-ghost"
              href={DISCORD_URL}
              rel="noreferrer"
              target="_blank"
            >
              Talk to us on Discord
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <Link className="landing-brand" href="/">
            <span>A</span>
            <strong>atheus</strong>
          </Link>
          <p>League operations for EA FC Pro Clubs communities.</p>
        </div>
        <nav aria-label="Footer navigation">
          <p>Platform</p>
          <a href="#capabilities">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/admin">Dashboard</Link>
        </nav>
        <nav>
          <p>Community</p>
          <a href={DISCORD_URL} rel="noreferrer" target="_blank">Discord server</a>
          <Link href="/upgrade">Premium</Link>
        </nav>
        <small>© Atheus 2026</small>
      </footer>
    </main>
  );
}
