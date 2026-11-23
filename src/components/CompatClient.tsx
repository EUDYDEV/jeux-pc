"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ImagePlus, Info, TriangleAlert, XCircle, HelpCircle, X } from "lucide-react";
import { useSelection } from "@/context/SelectionContext";
import { GAMES } from "@/data/games";
import { GPU_TIERS } from "@/lib/config";
import { VERDICT_LABEL, checkGame, type Verdict } from "@/lib/compat";
import type { PcSpecs } from "@/lib/types";

const ICON: Record<Verdict, React.ReactNode> = {
  ok: <CheckCircle2 className="size-5 text-lime" />,
  limite: <TriangleAlert className="size-5 text-amber-400" />,
  non: <XCircle className="size-5 text-danger" />,
  inconnu: <HelpCircle className="size-5 text-mute" />,
};

const RAM_OPTIONS = ["2", "4", "6", "8", "12", "16", "32"];

export function CompatClient() {
  const { ready, pc, setPc, games } = useSelection();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");

  const set = (k: keyof PcSpecs, v: string) => setPc({ ...pc, [k]: v });

  const filled = [pc.ramGb, pc.gpuTier, pc.storageGb, pc.windows].filter(Boolean).length;
  const results = useMemo(() => games.map(({ game }) => ({ game, res: checkGame(game, pc) })), [games, pc]);
  const catalogueOk = useMemo(
    () => (filled ? GAMES.filter((g) => ["ok", "limite"].includes(checkGame(g, pc).verdict)).length : 0),
    [pc, filled],
  );

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) return setFileError("Merci de choisir une image (PNG, JPG…).");
    if (f.size > 8 * 1024 * 1024) return setFileError("Image trop lourde (8 Mo maximum).");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    set("screenshotName", f.name);
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPc({ ...pc, screenshotName: undefined });
  }

  if (!ready) return <div className="h-64" aria-busy />;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
      <form className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-7" onSubmit={(e) => e.preventDefault()} noValidate>
        <h2 className="font-display text-xl font-semibold">Les caractéristiques de votre PC</h2>
        <p className="-mt-3 text-sm text-mute">
          Astuce : sous Windows, tapez <kbd className="rounded bg-raised px-1.5">Win + Pause</kbd> ou cherchez « Informations système ».
        </p>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Processeur</span>
          <input className="field" placeholder="ex. Intel Core i5-8250U" value={pc.cpu} onChange={(e) => set("cpu", e.target.value)} autoComplete="off" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Mémoire RAM</span>
            <select className="field" value={pc.ramGb} onChange={(e) => set("ramGb", e.target.value)}>
              <option value="">Choisir…</option>
              {RAM_OPTIONS.map((r) => (
                <option key={r} value={r}>{r} Go</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Stockage disponible (Go)</span>
            <input className="field" type="number" min={0} inputMode="numeric" placeholder="ex. 120" value={pc.storageGb} onChange={(e) => set("storageGb", e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Carte graphique (modèle)</span>
          <input className="field" placeholder="ex. NVIDIA GTX 1050 ou « Intel UHD 620 »" value={pc.gpu} onChange={(e) => set("gpu", e.target.value)} autoComplete="off" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Niveau de la carte graphique</span>
          <select className="field" value={pc.gpuTier} onChange={(e) => set("gpuTier", e.target.value)}>
            <option value="">Je ne sais pas / à vérifier</option>
            {GPU_TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Version de Windows</span>
          <select className="field" value={pc.windows} onChange={(e) => set("windows", e.target.value)}>
            <option value="">Choisir…</option>
            <option value="11">Windows 11</option>
            <option value="10">Windows 10</option>
            <option value="7/8">Windows 7 / 8</option>
          </select>
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-semibold">Capture d&apos;écran des caractéristiques (optionnel)</span>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Capture des caractéristiques du PC" className="max-h-56 w-full object-contain bg-black" />
              <button type="button" onClick={removeFile} className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/70" aria-label="Retirer la capture">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm text-mute transition hover:border-violet/60 hover:text-white">
              <ImagePlus className="size-6" aria-hidden />
              Appuyez pour joindre une capture
              <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
            </label>
          )}
          {fileError && <p className="mt-2 text-sm text-danger" role="alert">{fileError}</p>}
          {pc.screenshotName && (
            <p className="mt-2 text-xs text-mute">
              Dans cette démo, la capture n&apos;est pas envoyée automatiquement : elle sera à joindre dans la conversation WhatsApp.
            </p>
          )}
        </div>
      </form>

      <section aria-live="polite" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-violet/40 bg-surface p-5 sm:p-7">
          <h2 className="font-display text-xl font-semibold">Estimation instantanée</h2>

          {filled > 0 && (
            <p className="mt-2 text-sm text-mute">
              Votre PC semble pouvoir lancer environ <strong className="text-lime">{catalogueOk}</strong> jeux sur {GAMES.length} du catalogue.
            </p>
          )}

          {games.length === 0 ? (
            <div className="mt-5 rounded-xl bg-raised p-4 text-sm text-mute">
              Aucun jeu sélectionné.{" "}
              <Link href="/catalogue" className="font-semibold text-violet hover:underline">Choisir des jeux</Link> pour voir la compatibilité jeu par jeu.
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {results.map(({ game, res }) => (
                <li key={game.id} className="flex gap-3 rounded-xl bg-raised p-3.5">
                  <span className="mt-0.5">{ICON[res.verdict]}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {game.name} <span className="ml-1 text-xs font-medium text-mute">· {VERDICT_LABEL[res.verdict]}</span>
                    </p>
                    <p className="text-xs text-mute">{res.reasons.join(" · ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex gap-3 rounded-xl border border-cyan/30 bg-cyan/5 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
            <p className="text-mute">
              <strong className="text-white">Résultat indicatif.</strong> La compatibilité définitive doit être validée par le technicien avant l&apos;installation.
            </p>
          </div>

          <Link href="/reservation" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet font-semibold transition hover:bg-violet/85 active:scale-[0.98]">
            Passer à la réservation <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
