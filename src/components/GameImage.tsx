"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import { GameCover } from "./GameCover";

/** Visuel officiel du jeu (Steam). Repli sur un visuel généré si l'image est indisponible. */
export function GameImage({ game, className = "" }: { game: Game; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <GameCover game={game} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`}
      alt={`Visuel du jeu ${game.name}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
