"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, SearchX, X } from "lucide-react";
import { CATEGORIES, GAMES } from "@/data/games";
import { GameCard } from "./GameCard";
import { useSelection } from "@/context/SelectionContext";
import { formatFcfa } from "@/lib/format";

const PRICE_RANGES = [
  { v: "all", label: "Tous les prix", test: () => true },
  { v: "low", label: "Moins de 2 500 FCFA", test: (p: number) => p < 2500 },
  { v: "mid", label: "2 500 – 4 000 FCFA", test: (p: number) => p >= 2500 && p <= 4000 },
  { v: "high", label: "Plus de 4 000 FCFA", test: (p: number) => p > 4000 },
];

const SORTS = [
  { v: "pop", label: "Popularité" },
  { v: "asc", label: "Prix croissant" },
  { v: "desc", label: "Prix décroissant" },
  { v: "name", label: "Nom (A-Z)" },
];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function CatalogueClient() {
  const { count, total } = useSelection();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("pop");

  const results = useMemo(() => {
    const nq = normalize(q.trim());
    const range = PRICE_RANGES.find((r) => r.v === price)!;
    const list = GAMES.filter(
      (g) =>
        (cat === "Tous" || g.category === cat) &&
        range.test(g.price) &&
        (!nq || normalize(`${g.name} ${g.category} ${g.tagline}`).includes(nq)),
    );
    return list.sort((a, b) =>
      sort === "asc" ? a.price - b.price : sort === "desc" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : b.popularity - a.popularity,
    );
  }, [q, cat, price, sort]);

  const filtersActive = q || cat !== "Tous" || price !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6">
      {/* Barre d'outils */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-line/70 bg-bg/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Rechercher un jeu</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
            <input
              className="field !pl-10 !pr-10"
              placeholder="Rechercher un jeu (ex. GTA, foot, course…)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-mute hover:text-white" aria-label="Effacer">
                <X className="size-4" />
              </button>
            )}
          </label>
          <label>
            <span className="sr-only">Filtrer par prix</span>
            <select className="field" value={price} onChange={(e) => setPrice(e.target.value)}>
              {PRICE_RANGES.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Trier</span>
            <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>
                  Trier : {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Catégories">
          {["Tous", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                cat === c ? "border-violet bg-violet text-white" : "border-line bg-surface text-mute hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-mute" aria-live="polite">
        {results.length} jeu{results.length > 1 ? "x" : ""} {filtersActive && "correspondant à votre recherche"}
        <span className="ml-2 rounded bg-raised px-2 py-0.5 text-xs">Tarifs de démonstration</span>
      </p>

      <motion.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {results.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </AnimatePresence>
      </motion.div>

      {results.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <SearchX className="size-12 text-mute" aria-hidden />
          <p className="font-display text-xl font-semibold">Aucun jeu trouvé</p>
          <p className="max-w-sm text-mute">Un jeu manque au catalogue ? Demandez-le directement au technicien sur WhatsApp.</p>
          <button
            onClick={() => {
              setQ("");
              setCat("Tous");
              setPrice("all");
            }}
            className="mt-2 rounded-xl bg-violet px-5 py-3 font-semibold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Barre de sélection flottante */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-x-3 bottom-4 z-30 mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-violet/50 bg-raised/95 p-3 pl-5 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:pr-24"
          >
            <p className="text-sm">
              <strong className="font-display text-lg">{count}</strong> jeu{count > 1 ? "x" : ""} ·{" "}
              <span className="font-semibold text-lime">{formatFcfa(total)}</span>
            </p>
            <Link href="/selection" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-violet px-4 text-sm font-semibold">
              Voir ma sélection <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
