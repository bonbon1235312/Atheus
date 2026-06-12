import Link from "next/link";

const features = [
  {
    mark: "01",
    title: "League setup",
    text: "Create the league, choose its Discord server, set match windows and define the visual identity.",
    meta: "One guided setup",
    wide: true,
  },
  {
    mark: "02",
    title: "Fixture control",
    text: "Generate matchdays, publish fixtures and keep every competition in one calendar.",
    meta: "League + cup",
  },
  {
    mark: "03",
    title: "EA verification",
    text: "Match scheduled clubs against EA data and review each discovered result before it goes public.",
    meta: "Human approved",
  },
  {
    mark: "04",
    title: "Player statistics",
    text: "Turn approved match rows into leaderboards, player profiles and position-aware rankings.",
    meta: "Always current",
  },
  {
    mark: "05",
    title: "Discord operations",
    text: "Keep commands, graphics and team-server data scoped to the correct league automatically.",
    meta: "Guild aware",
  },
  {
    mark: "06",
    title: "Public league site",
    text: "Give the league one home for fixtures, results, tables, teams and player performance.",
    meta: "Ready to share",
    wide: true,
  },
];

const fixtureRows = [
  ["20:00", "Oscroh Dynasty", "LYX Esports", "Scheduled"],
  ["20:00", "Aizen ES", "Goats Remade", "Stats found"],
  ["20:30", "Born 2 Say Wesh", "EliteXII", "Review"],
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
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Pricing</a>
          <Link href="/admin">Dashboard</Link>
        </nav>

        <Link className="landing-nav-action" href="/admin">
          Start a league
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-status">
            <i />
            EA FC league operating system
          </p>
          <h1>Run the whole league from one place.</h1>
          <p className="landing-lead">
            Fixtures, verified EA results, player statistics and Discord
            operations. One connected platform, built for league owners.
          </p>
          <div className="landing-actions">
            <Link className="landing-button landing-button-primary" href="/admin">
              Open dashboard
            </Link>
            <a className="landing-button landing-button-secondary" href="#features">
              See how it works
            </a>
          </div>
        </div>

        <div className="landing-command-panel" aria-label="Atheus match operations preview">
          <div className="command-panel-head">
            <span className="command-brand">
              <i>A</i>
              atheus
            </span>
            <span>Match operations</span>
          </div>
          <div className="command-match">
            <span>Sunday / 20:00</span>
            <div>
              <strong>OSCR</strong>
              <b>2 - 1</b>
              <strong>LYX</strong>
            </div>
          </div>
          <ul className="command-checks">
            <li>
              <i />
              Fixture pair matched
              <span>Exact</span>
            </li>
            <li>
              <i />
              Match window checked
              <span>Inside</span>
            </li>
            <li>
              <i />
              Player rows discovered
              <span>18 rows</span>
            </li>
            <li>
              <i />
              Approval state
              <span className="is-pending">Pending</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="landing-statement">
        <p>Most leagues are held together by</p>
        <div className="statement-tools" aria-label="Replaced tools">
          <s>spreadsheets</s>
          <s>Discord messages</s>
          <s>manual tables</s>
          <s>separate stat tools</s>
        </div>
        <h2>
          Atheus connects <span>all of it.</span>
        </h2>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section-heading">
          <p>Everything the league runs on</p>
          <h2>Less admin. Better matchdays.</h2>
          <span>
            The important systems stay connected without turning league
            management into another full-time job.
          </span>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article
              className={feature.wide ? "landing-feature is-wide" : "landing-feature"}
              key={feature.mark}
            >
              <div className="feature-topline">
                <span className="feature-mark">{feature.mark}</span>
                <small>Live</small>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <b>{feature.meta}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-workflow landing-section" id="workflow">
        <div className="workflow-copy">
          <p className="landing-kicker">League control</p>
          <h2>Set it up in the browser. Let Atheus run the flow.</h2>
          <p>
            Build the season, link each club and publish the fixture list.
            Atheus then knows which games belong to the league and where every
            approved result should appear.
          </p>
          <Link className="landing-button landing-button-secondary" href="/admin">
            Open dashboard
          </Link>
        </div>

        <div className="workflow-window" aria-label="Fixture control preview">
          <div className="window-bar">
            <span>
              <i />
              <i />
              <i />
            </span>
            <small>atheus / fixtures / gameday 06</small>
          </div>
          <div className="window-content">
            <div className="window-title">
              <span>Sunday fixtures</span>
              <b>10 matches</b>
            </div>
            <div className="fixture-table">
              {fixtureRows.map(([time, home, away, state]) => (
                <div key={`${home}-${away}`}>
                  <time>{time}</time>
                  <strong>{home}</strong>
                  <span>vs</span>
                  <strong>{away}</strong>
                  <small>{state}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-pricing" id="pricing">
        <div className="landing-section-heading">
          <p>Pricing</p>
          <h2>Start with one league. Expand when you need to.</h2>
        </div>

        <div className="pricing-grid">
          <article className="pricing-card">
            <div>
              <p>Starter</p>
              <strong>£0</strong>
              <span>For one active league.</span>
            </div>
            <ul>
              <li>Full league website</li>
              <li>Fixture generation</li>
              <li>EA result review</li>
              <li>Discord league bot</li>
            </ul>
            <Link className="landing-button landing-button-secondary" href="/admin">
              Create a league
            </Link>
          </article>

          <article className="pricing-card is-featured">
            <div>
              <p>Premium</p>
              <strong>
                £8<small>/mo</small>
              </strong>
              <span>For unlimited active leagues.</span>
            </div>
            <ul>
              <li>Everything in Starter</li>
              <li>Unlimited leagues</li>
              <li>One account across every league</li>
              <li>Priority platform support</li>
            </ul>
            <Link className="landing-button landing-button-primary" href="/admin">
              Open league control
            </Link>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <p>Ready when your league is.</p>
          <h2>Put matchday on one system.</h2>
          <Link className="landing-button landing-button-primary" href="/admin">
            Start a league
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <Link className="landing-brand" href="/">
            <span>A</span>
            <strong>atheus</strong>
          </Link>
          <p>League operations for EA FC communities.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Pricing</a>
          <Link href="/admin">Dashboard</Link>
        </nav>
        <small>Atheus / 2026</small>
      </footer>
    </main>
  );
}
