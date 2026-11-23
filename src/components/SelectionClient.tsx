"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useSelection } from "@/context/SelectionContext";
import { GameImage } from "./GameImage";
import { formatFcfa } from "@/lib/format";

export function SelectionClient() {
  const { ready, games, total, setQty, remove, clear } = useSelection();

  if (!ready) return <div className="mx-auto h-64 max-w-7xl px-4" aria-busy />;

  if (games.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-14 text-mute" aria-hidden />
        <h2 className="font-display text-2xl font-semibold">Votre sélection est vide</h2>
        <p className="text-mute">Ajoutez des jeux depuis le catalogue pour estimer le coût de votre installation.</p>
        <Link href="/catalogue" className="rounded-xl bg-violet px-6 py-3 font-semibold">
          Explorer les jeux
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {games.map(({ game, qty }) => (
            <motion.li
              key={game.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="flex gap-4 rounded-2xl border border-line bg-surface p-3 sm:p-4"
            >
              <GameImage game={game} className="hidden aspect-[5/3] w-36 shrink-0 rounded-xl sm:block" />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display truncate text-lg font-semibold">{game.name}</h3>
                    <p className="text-sm text-mute">
                      {game.category} · {game.sizeGb} Go · RAM {game.minRamGb} Go min.
                    </p>
                  </div>
                  <button onClick={() => remove(game.id)} className="grid size-10 shrink-0 place-items-center rounded-lg text-mute hover:bg-raised hover:text-danger" aria-label={`Retirer ${game.name}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-xl border border-line" role="group" aria-label={`Quantité pour ${game.name}`}>
                    <button className="grid size-10 place-items-center disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty(game.id, qty - 1)} aria-label="Diminuer">
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
                    <button className="grid size-10 place-items-center disabled:opacity-30" disabled={qty >= 5} onClick={() => setQty(game.id, qty + 1)} aria-label="Augmenter">
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    {qty > 1 && <p className="text-xs text-mute">{formatFcfa(game.price)} × {qty}</p>}
                    <p className="font-display text-lg font-bold text-lime">{formatFcfa(game.price * qty)}</p>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        <li className="flex justify-between pt-2 text-sm">
          <Link href="/catalogue" className="font-semibold text-violet hover:underline">+ Ajouter d&apos;autres jeux</Link>
          <button onClick={clear} className="text-mute hover:text-danger">Vider la sélection</button>
        </li>
      </ul>

      <aside className="h-fit rounded-2xl border border-violet/40 bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Récapitulatif</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-mute">Jeux</dt><dd>{games.length}</dd></div>
          <div className="flex justify-between"><dt className="text-mute">Déplacement</dt><dd>Selon zone</dd></div>
        </dl>
        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <span className="text-mute">Total estimatif</span>
          <span className="font-display text-3xl font-bold text-lime">{formatFcfa(total)}</span>
        </div>
        <p className="mt-3 text-xs text-mute">
          Estimation indicative. Le tarif final est confirmé par le technicien après vérification de compatibilité.
        </p>
        <Link href="/compatibilite" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet font-semibold transition hover:bg-violet/85 active:scale-[0.98]">
          Continuer ma réservation <ArrowRight className="size-4" />
        </Link>
      </aside>
    </div>
  );
}
