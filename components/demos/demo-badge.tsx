import Link from "next/link";

export function DemoBadge({ brand }: { brand: string }) {
  return (
    <div className="demo-badge">
      <span>
        Demo site · <strong>{brand}</strong>
      </span>
      <Link href="https://atheus.dev/products/sites">Built by Atheus →</Link>
    </div>
  );
}
