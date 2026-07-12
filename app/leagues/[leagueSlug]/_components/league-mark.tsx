import { getWcagOnColour } from "@/lib/accessible-colour";

type LeagueMarkProps = {
  name: string;
  logoUrl?: string | null;
  colour?: string | null;
  compact?: boolean;
};

export function LeagueMark({
  name,
  logoUrl,
  colour,
  compact = false,
}: LeagueMarkProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const backgroundColour = colour || "var(--league-primary)";

  return (
    <span
      aria-label={`${name} crest`}
      className={`league-mark${compact ? " league-mark-compact" : ""}`}
      role="img"
      style={{
        backgroundColor: backgroundColour,
        backgroundImage: logoUrl ? `url("${logoUrl}")` : undefined,
        color: colour
          ? getWcagOnColour(colour)
          : "var(--league-on-primary)",
      }}
    >
      {!logoUrl ? initials : null}
    </span>
  );
}
