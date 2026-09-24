import Link from "next/link";

export function WowCta({
  title,
  lead,
  primary,
  secondary,
}: {
  title: string;
  lead: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="ax-section" style={{ paddingTop: 0 }}>
      <div className="ax-container">
        <div className="ax-cta ax-sites-cta">
          <h2 className="ax-h2">{title}</h2>
          <p className="ax-lead">{lead}</p>
          <div className="ax-cta-actions">
            <Link className="ax-btn ax-btn-primary" href={primary.href}>
              {primary.label}
            </Link>
            {secondary ? (
              <Link className="ax-btn ax-btn-secondary" href={secondary.href}>
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
