"use client";

import { motion } from "framer-motion";
import { Check, Cpu, HardDrive, MemoryStick, Plus } from "lucide-react";
import type { Game } from "@/lib/types";
import { formatFcfa } from "@/lib/format";
import { useSelection } from "@/context/SelectionContext";
import { checkGame, VERDICT_LABEL } from "@/lib/compat";
import { GameImage } from "./GameImage";

const BADGE_STYLE: Record<string, string> = {
  Populaire: "bg-violet/90 text-white",
  Nouveau: "bg-cyan text-black",
  Léger: "bg-lime text-black",
};

export function GameCard({ game }: { game: Game }) {
  const { has, toggle, pc } = useSelection();
  const compat = pc.cpu || pc.gpu || pc.ramGb ? checkGame(game, pc) : null;
  const selected = has(game.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className={`card-border group flex flex-col overflow-hidden rounded-2xl border bg-surface transition-colors ${
        selected ? "border-violet/70 shadow-[0_0_0_1px_rgb(139_92_246/0.4),0_10px_40px_-12px_rgb(139_92_246/0.5)]" : "border-line"
      }`}
    >
      <div className="relative aspect-[5/3] overflow-hidden">
        <GameImage game={game} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        {game.badge && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${BADGE_STYLE[game.badge]}`}>
            {game.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {game.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{game.name}</h3>
          <p className="mt-0.5 text-sm text-mute">{game.tagline}</p>
        </div>

        <ul className="grid grid-cols-1 gap-1.5 text-xs text-mute">
          <li className="flex items-center gap-2">
            <Cpu className="size-3.5 shrink-0 text-cyan" aria-hidden /> <span className="truncate">{game.minCpu}</span>
          </li>
          <li className="flex items-center gap-2">
            <MemoryStick className="size-3.5 shrink-0 text-cyan" aria-hidden /> RAM {game.minRamGb} Go · {game.minGpu}
          </li>
          <li className="flex items-center gap-2">
            <HardDrive className="size-3.5 shrink-0 text-cyan" aria-hidden /> {game.sizeGb} Go d&apos;espace · Windows {game.minWindows}+
          </li>
        </ul>

        {compat && compat.verdict !== "inconnu" && (
          <p
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              compat.verdict === "ok" ? "bg-lime/15 text-lime" : compat.verdict === "limite" ? "bg-amber-400/15 text-amber-300" : "bg-danger/15 text-danger"
            }`}
          >
            {compat.verdict === "ok" ? "✔" : compat.verdict === "limite" ? "⚠" : "✖"} {VERDICT_LABEL[compat.verdict]}
            {compat.verdict === "non" && compat.blockers[0] ? ` — ${compat.blockers[0]}` : ""}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-mute">Installation</p>
            <p className="font-display text-xl font-bold text-lime">{formatFcfa(game.price)}</p>
          </div>
          <button
            onClick={() => toggle(game.id)}
            aria-pressed={selected}
            className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold transition active:scale-95 ${
              selected ? "bg-violet/20 text-violet ring-1 ring-violet/60" : "bg-violet text-white hover:bg-violet/85"
            }`}
          >
            {selected ? (
              <>
                <Check className="size-4" /> Ajouté
              </>
            ) : (
              <>
                <Plus className="size-4" /> Ajouter à ma sélection
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
