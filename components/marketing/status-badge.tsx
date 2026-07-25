import { statusLabel, type ProductStatus } from "@/lib/products";

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className="ax-badge" data-tone={status}>
      {statusLabel[status]}
    </span>
  );
}
