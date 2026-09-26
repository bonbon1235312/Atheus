import Image from "next/image";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { StructuredData } from "@/components/marketing/structured-data";
import { breadcrumbSchema, marketingMetadata } from "@/lib/seo";
import { kickoffSnapshot as snapshot } from "@/lib/work";

export const metadata = marketingMetadata({
  title: "KickOff Case Study | A Live Digital Platform by Atheus",
  description: "Inside KickOff: a live EA FC Pro Clubs platform connecting automated match tracking, ELO rankings, player records, Discord and the public web. Designed and built by Atheus.",
  path: "/work/kickoff",
  image: "/work/kickoff-desktop.webp",
  imageAlt: "KickOff live platform showing club rankings",
});

const flow = [
  ["01", "Match activity", "EA FC Pro Clubs"],
  ["02", "Capture & process", "Match and player records"],
  ["03", "Build the history", "Statistics and rating events"],
  ["04", "Make it useful", "Discord + public website"],
];

export default function KickoffCaseStudy() {
  return (
    <MarketingShell variant="agency">
      <StructuredData data={breadcrumbSchema([{ name: "Atheus", path: "/" }, { name: "Work", path: "/work" }, { name: "KickOff", path: "/work/kickoff" }])} />
      <section className="studio-case-hero ax-container">
        <div className="agency-section-label"><Link href="/work">← Selected work</Link><span>Atheus Original / Live platform</span></div>
        <div className="studio-case-title"><h1>KickOff<span>.</span></h1><p>Every match became<br />part of a bigger story.</p></div>
        <div className="studio-case-meta"><span>Product strategy</span><span>Interface design</span><span>Full-stack development</span><a href="https://www.kickoffproclubs.com/" target="_blank" rel="noreferrer">Visit the platform ↗</a></div>
      </section>
      <figure className="studio-case-cover ax-container"><Image src="/work/kickoff-desktop.webp" alt="KickOff homepage: automatic match tracking alongside a live club ranking table" width={1440} height={1000} sizes="(max-width: 760px) 100vw, 90vw" preload /><figcaption>Live product capture / September 2026. Rankings change as new matches arrive.</figcaption></figure>
      <section className="studio-editorial ax-container">
        <div className="studio-section-side"><span className="studio-eyebrow">01 / The challenge</span><h2>A match ends.<br />Its story shouldn’t.</h2></div>
        <div className="studio-prose"><p className="studio-lead">KickOff is a live platform for EA FC Pro Clubs communities. It turns match activity into persistent club rankings, player statistics and competitive history.</p><p>The challenge was to connect the places where competition happens: the game, the Discord community, and the public web. A result should become useful without someone having to report it again in a spreadsheet or a message.</p><p>Built as an Atheus original product, KickOff brings automated records and a public interface into one experience. Clubs can follow their standing, players can build a record, and communities can discover who is playing.</p></div>
      </section>
      <section className="studio-system">
        <div className="ax-container"><div className="agency-section-label"><span>02 / The product flow</span><span>From activity to identity</span></div><h2>Make the competition<br /><em>persistent.</em></h2><p className="studio-system-intro">A simplified view of the journey: capture a match, preserve the performance, update the competitive record, and bring it back to the community.</p>
          <ol className="studio-flow">{flow.map(([number, title, detail]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p><i aria-hidden="true">→</i></li>)}</ol>
          <p className="studio-system-note">The database holds the history. Discord is where the community operates. The website makes that activity discoverable beyond a server.</p>
        </div>
      </section>
      <section className="studio-interface ax-container">
        <div className="studio-interface-heading"><span className="studio-eyebrow">03 / Designing around data</span><h2>Rank first.<br />Context second.<br /><em>Detail on demand.</em></h2><p>Clubs and players generate a lot of information. The public interface gives that information an order: start with the ranking, compare the headline numbers, then explore the individual record.</p></div>
        <figure className="studio-screen"><Image src="/work/kickoff-leaderboard.webp" alt="KickOff desktop leaderboard with ranking categories and club statistics" width={1440} height={1000} sizes="(max-width: 760px) 100vw, 90vw" /><figcaption>Leaderboard / Desktop capture</figcaption></figure>
        <div className="studio-annotations"><p><span>01</span><strong>A clear entry point</strong> Rank and club identity anchor each row, giving the page an immediate reading order.</p><p><span>02</span><strong>The headline number</strong> ELO is aligned at the right edge so ratings can be compared down the table.</p><p><span>03</span><strong>Context without clutter</strong> Win, draw and loss totals sit beside the rating on desktop, supporting a deeper comparison.</p></div>
      </section>
      <section className="studio-mobile-section">
        <div className="ax-container studio-mobile-grid"><div><span className="studio-eyebrow">04 / The smaller screen</span><h2>Keep the question.<br /><em>Change the frame.</em></h2><p>On a phone, rank, club identity and ELO remain visible. Secondary win, draw and loss totals step out of the row, giving the club name and headline rating room to breathe.</p><p>These are captures of the same live product at desktop and mobile widths, not a separate presentation mock-up.</p><a className="agency-arrow-link" href="https://www.kickoffproclubs.com/leaderboards" target="_blank" rel="noreferrer">Explore the leaderboard ↗</a></div><figure className="studio-mobile-capture"><Image src="/work/kickoff-mobile.webp" alt="KickOff leaderboard at a 390 pixel mobile viewport" width={390} height={844} sizes="(max-width: 760px) 80vw, 390px" /><figcaption>390px viewport / September 2026</figcaption></figure></div>
      </section>
      <section className="studio-evidence ax-container">
        <div className="agency-section-label"><span>05 / A product in use</span><span>Snapshot / 26.09.2026</span></div><h2>Real records.<br /><em>A growing history.</em></h2>
        <dl className="studio-metrics"><div><dt>Matches stored</dt><dd>{snapshot.matches}</dd></div><div><dt>Player-match performances</dt><dd>{snapshot.performances}</dd></div><div><dt>Player identities</dt><dd>{snapshot.players}</dd></div><div><dt>Active club records</dt><dd>{snapshot.activeClubs}</dd></div></dl>
        <p className="studio-source">Source: owner-supplied, read-only database report, {snapshot.date}. These are stored records at that time, not live counters. Player identities are not a count of monthly active users. “Active” is the club lifecycle status; all 53 active clubs had a recorded match within the preceding 30 days.</p>
        <div className="studio-delivery"><h3>Processing a match and delivering a message are different jobs.</h3><div><p>At the snapshot, {snapshot.posted} of {snapshot.matches} matches ({snapshot.postedPercent}) were marked posted to Discord. The remaining {snapshot.failed} had recorded delivery failures.</p><p>That distinction matters: retaining a match record does not guarantee its Discord message was delivered. The percentage describes current delivery status, not platform uptime or a service guarantee.</p></div></div>
      </section>
      <section className="studio-editorial studio-outcome ax-container"><div className="studio-section-side"><span className="studio-eyebrow">06 / The result</span><h2>An interface.<br />An engine.<br /><em>A community.</em></h2></div><div className="studio-prose"><p className="studio-lead">KickOff demonstrates what happens when product thinking, interface design and software development stay connected.</p><p>The work extends beyond the visible pages: match records, player histories, rating events and community delivery all contribute to the same experience. The public website gives that system a clear front door.</p><a className="agency-btn" href="https://www.kickoffproclubs.com/" target="_blank" rel="noreferrer">Visit KickOff ↗</a><p className="studio-source">Independent project. KickOff is not affiliated with or endorsed by EA.</p></div></section>
      <section className="agency-offer"><div className="ax-container agency-offer-grid"><div><div className="agency-section-label"><span>From the idea to the system</span></div><h2>What are you<br /><em>building?</em></h2></div><div className="agency-offer-aside"><p>A distinctive website or a product with deeper functionality. Let’s work out what it needs to become.</p><Link className="agency-btn" href="/contact">Start a project ↗</Link><Link className="agency-arrow-link" href="/work/hearth-and-co">Next / Hearth & Co ↗</Link></div></div></section>
    </MarketingShell>
  );
}
