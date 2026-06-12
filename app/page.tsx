import Link from "next/link";

const capabilities = [
  {
    index: "01",
    title: "Run the league",
    text: "Create seasons, schedule matchdays, manage teams and publish fixtures from one source of truth.",
  },
  {
    index: "02",
    title: "Verify the result",
    text: "Match scheduled clubs against EA data, review the package and approve only the result you trust.",
  },
  {
    index: "03",
    title: "Publish the story",
    text: "Keep tables, player totals, team dashboards and Discord graphics aligned with approved data.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Atheus home">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        <Link className="header-link" href="/admin">
          League access
        </Link>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">EA FC league infrastructure</p>
          <h1>One league system. Every moving part connected.</h1>
          <p className="hero-summary">
            Fixtures, Discord operations and verified match statistics, built to support
            more than one league.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/admin">
              Open platform
            </Link>
            <a className="button button-secondary" href="#system">
              View the system
            </a>
          </div>
        </div>

        <aside className="hero-status" aria-label="Platform status">
          <p className="status-label">Foundation status</p>
          <strong>Greenfield build</strong>
          <div className="status-rule" />
          <dl>
            <div>
              <dt>Website</dt>
              <dd>Atheus</dd>
            </div>
            <div>
              <dt>Operations bot</dt>
              <dd>Atheus</dd>
            </div>
            <div>
              <dt>Data layer</dt>
              <dd>Supabase</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="system" id="system">
        <div className="section-heading">
          <p className="eyebrow">The operating model</p>
          <h2>Built around the matchday, not around disconnected tools.</h2>
        </div>

        <div className="capability-list">
          {capabilities.map((capability) => (
            <article className="capability" key={capability.index}>
              <span>{capability.index}</span>
              <h3>{capability.title}</h3>
              <p>{capability.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <span>ATHEUS / LEAGUE PLATFORM</span>
        <span>Foundation 01</span>
      </footer>
    </main>
  );
}

