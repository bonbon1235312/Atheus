import Image from "next/image";

// The atheus "A" monogram (transparent PNG, white). Single source for the
// in-page logo. Source art lives at public/logo.png.
export function AtheusMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="atheus"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
