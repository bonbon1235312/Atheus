import Image from "next/image";
import Link from "next/link";

const tiles = [
  {
    src: "/brand/sites-hearth.jpg",
    label: "Hearth & Co",
    copy: "Warm, sharp, unmistakably theirs.",
    span: "wide",
    href: "/demos/hearth-co",
  },
  {
    src: "/brand/ridgeway-hero.jpg",
    label: "Ridgeway Civils",
    copy: "A contractor site that looks like the work.",
    span: "tall",
    href: "/demos/ridgeway",
  },
  {
    src: "/brand/northline-hero.jpg",
    label: "Northline Electrical",
    copy: "Bright, precise, and built to quote.",
    span: "base",
    href: "/demos/northline",
  },
  {
    src: "/brand/league-product.png",
    label: "Products",
    copy: "Software with the same bar.",
    span: "base",
    href: "/products",
  },
] as const;

export function ProofMosaic() {
  return (
    <section className="ax-section">
      <div className="ax-container">
        <div className="ax-section-head ax-section-head-center">
          <h2 className="ax-h2">Work that travels</h2>
          <p className="ax-lead">
            Live demo sites on their own subdomains. Open them and judge the craft.
          </p>
        </div>

        <div className="ax-proof-mosaic">
          {tiles.map((tile) => (
            <figure
              key={tile.label}
              className="ax-proof-tile"
              data-span={tile.span}
            >
              <Link className="ax-proof-tile-link" href={tile.href} aria-label={`Open ${tile.label}`}>
                <div className="ax-bezel">
                  <div className="ax-bezel-inner">
                    <Image
                      src={tile.src}
                      alt=""
                      width={1400}
                      height={900}
                      sizes="(max-width: 900px) 100vw, 40vw"
                    />
                  </div>
                </div>
              </Link>
              <figcaption>
                <strong>
                  <Link href={tile.href}>{tile.label}</Link>
                </strong>
                <span>{tile.copy}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
