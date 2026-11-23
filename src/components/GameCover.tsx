import type { Game } from "@/lib/types";

/** Visuel représentatif généré (pas d'image officielle protégée). Remplaçable par `game.image` plus tard. */
export function GameCover({ game, className = "" }: { game: Game; className?: string }) {
  const h = game.hue;
  const h2 = (h + 55) % 360;
  const uid = `c-${game.id}`;
  const initials = game.name
    .replace(/[:]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 || /\d/.test(w))
    .map((w) => (/\d/.test(w) ? w : w[0]))
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return (
    <svg viewBox="0 0 400 240" className={className} role="img" aria-label={`Visuel du jeu ${game.name}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 85% 42%)`} />
          <stop offset="0.55" stopColor={`hsl(${h2} 75% 22%)`} />
          <stop offset="1" stopColor={`hsl(${h2} 60% 8%)`} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.75" cy="0.2" r="0.6">
          <stop offset="0" stopColor={`hsl(${h} 100% 75%)`} stopOpacity="0.55" />
          <stop offset="1" stopColor={`hsl(${h} 100% 60%)`} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${uid}-st`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="2" height="14" fill="white" opacity="0.07" />
        </pattern>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-bg)`} />
      <rect width="400" height="240" fill={`url(#${uid}-st)`} />
      <rect width="400" height="240" fill={`url(#${uid}-glow)`} />
      <polygon points="230,240 400,60 400,240" fill="black" opacity="0.28" />
      <polygon points="-20,240 120,110 210,240" fill={`hsl(${h2} 70% 12%)`} opacity="0.55" />
      <circle cx="318" cy="76" r="44" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="318" cy="76" r="26" fill={`hsl(${h} 100% 80%)`} opacity="0.22" />
      <text
        x="22"
        y="196"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontWeight="700"
        fontSize={initials.length > 3 ? 82 : 104}
        fill="white"
        opacity="0.92"
        style={{ letterSpacing: "-4px" }}
      >
        {initials}
      </text>
    </svg>
  );
}
