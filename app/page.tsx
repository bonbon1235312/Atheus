import Link from "next/link";

import { HomeExperience } from "./home-experience";

const operatingLayers = [
  {
    index: "01",
    label: "Infrastructure",
    title: "One source of truth",
    text: "League identity, seasons, competitions, clubs and Discord guilds resolve through one tenant-safe operating layer.",
    status: "Connected",
  },
  {
    index: "02",
    label: "Fixtures",
    title: "The calendar drives the system",
    text: "Local match windows become UTC fixtures. Every collector run starts from the schedule rather than a blind search.",
    status: "Scheduled",
  },
  {
    index: "03",
    label: "Verification",
    title: "Nothing public by accident",
    text: "EA packages enter a review queue with confidence, score mapping and player rows before affecting public records.",
    status: "Controlled",
  },
  {
    index: "04",
    label: "Operations",
    title: "Discord stays in league context",
    text: "The bot resolves the guild, league and linked team before it reads fixtures, rosters, graphics or statistics.",
    status: "Scoped",
  },
];

const liveMetrics = [
  { value: 1, suffix: "", label: "Canonical data layer" },
  { value: 6, suffix: "", label: "Operational surfaces" },
  { value: 60, suffix: "s", label: "Minimum collector interval" },
  { value: 0, suffix: "", label: "Blind match imports" },
];

const timeline = [
  ["18:40", "Window opens", "Scheduled clubs become eligible for collection."],
  ["20:00", "Kickoff", "Exact club pairs are checked against the fixture."],
  ["20:18", "Package found", "Score and player rows enter the review queue."],
  ["20:24", "Approved", "Table, results, profiles and Discord views update."],
];

const verificationRows = [
  {
    signal: "Club pair",
    state: "Exact",
    detail:
      "Both historical EA club IDs match the two scheduled teams, regardless of home and away order.",
  },
  {
    signal: "Match window",
    state: "Inside",
    detail:
      "Played time sits inside the league's configured local collection window after timezone conversion.",
  },
  {
    signal: "Score mapping",
    state: "Verified",
    detail:
      "The score follows the resolved team IDs rather than trusting EA's presentation order.",
  },
  {
    signal: "Player rows",
    state: "18 found",
    detail:
      "Every imported player maps to one of the two fixture teams before approval is allowed.",
  },
];

export default function Home() {
  return (
    <HomeExperience>
      <main className="landing-page">
        <div className="site-grid" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

        <header className="site-header">
          <Link className="wordmark" href="/" aria-label="Atheus home">
            <span className="wordmark-mark">A</span>
            <span>ATHEUS</span>
          </Link>
          <div className="header-system-state">
            <span className="system-pulse" />
            <span>League network operational</span>
          </div>
          <Link className="header-link" href="/admin">
            League access
          </Link>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="hero-index reveal" data-reveal>
              <span>SYS / 001</span>
              <span>EA FC league infrastructure</span>
            </div>
            <h1 className="hero-title reveal" data-reveal>
              The operating system behind the league.
            </h1>
            <div className="hero-lower">
              <p className="hero-summary reveal" data-reveal>
                Fixtures, Discord operations and verified match statistics,
                engineered as one connected control system.
              </p>
              <div className="hero-actions reveal" data-reveal>
                <Link className="button button-primary" href="/admin">
                  Open platform
                </Link>
                <a className="text-link" href="#infrastructure">
                  Inspect the system <span aria-hidden="true">v</span>
                </a>
              </div>
            </div>
          </div>

          <aside className="hero-status" aria-label="Platform foundation">
            <div className="foundation-topline">
              <p className="status-label">Foundation / 01</p>
              <span className="status-live">
                <i />
                Live
              </span>
            </div>
            <strong>League control</strong>
            <p className="foundation-copy">
              A single operational boundary for every league, guild, club,
              fixture and approved statistic.
            </p>
            <div className="status-rule" />
            <dl>
              <div>
                <dt>Website</dt>
                <dd>Public + admin</dd>
              </div>
              <div>
                <dt>Operations</dt>
                <dd>Discord bot</dd>
              </div>
              <div>
                <dt>Data authority</dt>
                <dd>Supabase</dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>Fixture aware</dd>
              </div>
            </dl>
            <div className="foundation-coordinate">
              <span>52.4862 N</span>
              <span>01.8904 W</span>
            </div>
          </aside>
        </section>

        <section className="system-section" id="infrastructure">
          <header className="section-heading reveal" data-reveal>
            <div>
              <p className="eyebrow">01 / Infrastructure</p>
              <span className="section-status">
                <i />
                Canonical
              </span>
            </div>
            <h2>Built around matchday. Not disconnected tools.</h2>
          </header>

          <div className="operating-layers">
            {operatingLayers.map((layer) => (
              <article
                className="operating-layer reveal"
                data-reveal
                key={layer.index}
              >
                <span className="layer-index">{layer.index}</span>
                <div>
                  <p>{layer.label}</p>
                  <h3>{layer.title}</h3>
                </div>
                <p className="layer-copy">{layer.text}</p>
                <span className="layer-state">{layer.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="operations-story" id="fixtures">
          <div className="operations-copy">
            <div className="operations-copy-inner">
              <p className="eyebrow reveal" data-reveal>
                02 / Fixtures
              </p>
              <h2 className="reveal" data-reveal>
                The fixture is the instruction.
              </h2>
              <p className="reveal" data-reveal>
                Match automation begins with who should play, when they should
                play and which EA identities belong to them at that moment.
              </p>
              <ol className="operation-steps">
                {operatingLayers.map((layer, index) => (
                  <li
                    data-operation-step={index}
                    key={layer.index}
                    className={index === 0 ? "is-current" : undefined}
                  >
                    <span>{layer.index}</span>
                    <strong>{layer.label}</strong>
                    <small>{layer.status}</small>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="operations-panel" aria-label="Live fixture workflow">
            <div className="panel-toolbar">
              <span>Match operations / Sunday</span>
              <span className="panel-time">20:18:42</span>
            </div>
            <div className="fixture-signal">
              <span>Gameday 06</span>
              <strong>OSCR</strong>
              <b>2 - 1</b>
              <strong>LYX</strong>
              <small>Exact pair</small>
            </div>
            <div className="operations-readout">
              <div>
                <span>Fixture window</span>
                <strong>18:40-21:15</strong>
              </div>
              <div>
                <span>EA source</span>
                <strong>leagueMatch</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>Definite</strong>
              </div>
              <div>
                <span>Players</span>
                <strong>18 rows</strong>
              </div>
            </div>
            <div className="signal-track" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <span />
            </div>
            <div className="panel-log">
              <span>20:18:39</span>
              <p>Two-club identity set resolved.</p>
              <span>20:18:40</span>
              <p>Home and away score mapping verified.</p>
              <span>20:18:42</span>
              <p>Pending package written for review.</p>
            </div>
          </div>
        </section>

        <section className="metrics-section" id="statistics">
          <header className="metrics-heading reveal" data-reveal>
            <p className="eyebrow">03 / Statistics</p>
            <h2>Approved data moves everywhere at once.</h2>
          </header>
          <div className="metric-rail">
            {liveMetrics.map((metric) => (
              <article className="metric" key={metric.label}>
                <strong
                  data-counter={metric.value}
                  data-counter-suffix={metric.suffix}
                >
                  0{metric.suffix}
                </strong>
                <p>{metric.label}</p>
              </article>
            ))}
          </div>
          <div className="data-route reveal" data-reveal>
            <span>Approved match</span>
            <i />
            <span>League table</span>
            <i />
            <span>Player totals</span>
            <i />
            <span>Discord graphics</span>
          </div>
        </section>

        <section className="verification-section" id="verification">
          <header className="section-heading reveal" data-reveal>
            <div>
              <p className="eyebrow">04 / Verification</p>
              <span className="section-status">
                <i />
                Human approval
              </span>
            </div>
            <h2>Trust is visible. Every signal can be inspected.</h2>
          </header>

          <div className="verification-table reveal" data-reveal>
            <div className="verification-header">
              <span>Signal</span>
              <span>State</span>
              <span>Inspection</span>
            </div>
            {verificationRows.map((row) => (
              <details key={row.signal}>
                <summary>
                  <strong>{row.signal}</strong>
                  <span>{row.state}</span>
                  <b>Expand</b>
                </summary>
                <p>{row.detail}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="timeline-section" id="operations">
          <div className="timeline-intro reveal" data-reveal>
            <p className="eyebrow">05 / Operations</p>
            <h2>A matchnight leaves an audit trail.</h2>
          </div>
          <div className="timeline">
            {timeline.map(([time, title, text], index) => (
              <article className="timeline-event reveal" data-reveal key={time}>
                <div>
                  <span>0{index + 1}</span>
                  <time>{time}</time>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="architecture-section">
          <div className="architecture-title reveal" data-reveal>
            <p className="eyebrow">System architecture</p>
            <h2>Every surface knows which league it belongs to.</h2>
          </div>
          <div className="architecture-map reveal" data-reveal>
            <svg viewBox="0 0 1200 420" role="img" aria-label="Atheus system map">
              <path d="M120 210H1080" />
              <path d="M300 70V350" />
              <path d="M600 70V350" />
              <path d="M900 70V350" />
              <circle cx="120" cy="210" r="8" />
              <circle cx="300" cy="210" r="8" />
              <circle cx="600" cy="210" r="8" />
              <circle cx="900" cy="210" r="8" />
              <circle cx="1080" cy="210" r="8" />
            </svg>
            <span className="map-node map-node-1">League owner</span>
            <span className="map-node map-node-2">Atheus web</span>
            <span className="map-node map-node-3">Canonical data</span>
            <span className="map-node map-node-4">Atheus bot</span>
            <span className="map-node map-node-5">League public</span>
          </div>
        </section>

        <section className="access-section" id="access">
          <div className="access-number" aria-hidden="true">
            06
          </div>
          <div className="access-copy reveal" data-reveal>
            <p className="eyebrow">06 / League access</p>
            <h2>Bring the league into one system.</h2>
            <p>
              Select the Discord server, define the identity, set match windows
              and link clubs. The operating boundary is created from there.
            </p>
            <Link className="button button-primary" href="/admin">
              Enter league control
            </Link>
          </div>
        </section>

        <footer>
          <span>ATHEUS / LEAGUE PLATFORM</span>
          <span>Infrastructure for EA FC leagues</span>
          <span>System 01 / Operational</span>
        </footer>
      </main>
    </HomeExperience>
  );
}
