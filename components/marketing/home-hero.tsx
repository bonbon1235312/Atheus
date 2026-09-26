import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="agency-hero" aria-labelledby="agency-hero-title">
      <div className="ax-container">
        <div className="agency-hero-topline">
          <span>Atheus / Independent UK web design studio</span>
          <span>Design & development / UK</span>
        </div>
        <div className="agency-hero-intro">
          <h1 id="agency-hero-title">
            <span className="agency-hero-line">Good websites</span>
            <span className="agency-hero-line">get <em>noticed.</em></span>
            <span className="agency-hero-line">Great ones get</span>
            <span className="agency-hero-line"><span className="agency-hero-underlined">remembered.</span></span>
          </h1>
          <div className="agency-hero-aside agency-reveal">
            <span className="agency-star" aria-hidden="true">✳</span>
            <p>Atheus is an independent digital studio designing and building distinctive websites and software.</p>
            <Link className="agency-arrow-link" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="agency-hero-gallery" aria-label="Website concepts by Atheus">
          <div className="agency-hero-gallery-main">
            <Image src="/brand/sites-hearth.jpg" alt="Hearth & Co cafe website concept with warm interior photography" width={1600} height={900} preload loading="eager" fetchPriority="high" sizes="(max-width: 800px) 100vw, 70vw" />
            <span className="agency-gallery-caption">Hearth & Co / Hospitality</span>
          </div>
          <div className="agency-hero-gallery-side">
            <Image src="/brand/ridgeway-hero.jpg" alt="Ridgeway Civils construction site concept" width={800} height={1050} fetchPriority="low" sizes="(max-width: 800px) 40vw, 25vw" />
            <span className="agency-gallery-caption">Ridgeway / Construction</span>
          </div>
          <Link className="agency-gallery-stamp" href="/work" aria-label="Explore selected work">
            <span>Explore<br />the work</span><span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="agency-hero-bottomline"><span>01 / Design with intent</span><span>Scroll to explore ↓</span></div>
      </div>
    </section>
  );
}
