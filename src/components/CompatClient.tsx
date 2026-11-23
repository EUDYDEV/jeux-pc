"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Copy, HelpCircle, ImagePlus, Info, ScanSearch, TriangleAlert, X, XCircle } from "lucide-react";
import { useSelection } from "@/context/SelectionContext";
import { GAMES } from "@/data/games";
import { VERDICT_LABEL, checkGame, type PartStatus, type Verdict } from "@/lib/compat";
import {
  POWERSHELL_CMD,
  SUGGESTIONS,
  cpuTierLabel,
  detectHardware,
  gpuTierLabel,
  parsePowerShellOutput,
  recognizeCpu,
  recognizeGpu,
} from "@/lib/hardware";
import type { PcSpecs } from "@/lib/types";

const ICON: Record<Verdict, React.ReactNode> = {
  ok: <CheckCircle2 className="size-5 text-lime" />,
  limite: <TriangleAlert className="size-5 text-amber-400" />,
  non: <XCircle className="size-5 text-danger" />,
  inconnu: <HelpCircle className="size-5 text-mute" />,
};
const DOT: Record<PartStatus, string> = { ok: "bg-lime", limite: "bg-amber-400", non: "bg-danger", inconnu: "bg-line" };
const PART_LABEL = { cpu: "CPU", gpu: "GPU", ram: "RAM", disk: "Disque", windows: "Windows" } as const;
const RAM_OPTIONS = ["2", "4", "6", "8", "12", "16", "24", "32"];

export function CompatClient() {
  const { ready, pc, setPc, games, has, toggle } = useSelection();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [detectMsg, setDetectMsg] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteMsg, setPasteMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k: keyof PcSpecs, v: string) => setPc({ ...pc, [k]: v });

  const cpuInfo = useMemo(() => recognizeCpu(pc.cpu), [pc.cpu]);
  const gpuInfo = useMemo(() => recognizeGpu(pc.gpu), [pc.gpu]);
  const anyFilled = !!(pc.cpu || pc.gpu || pc.ramGb || pc.storageGb || pc.windows);
  const noSelection = games.length === 0;
  const results = useMemo(() => {
    const list = (noSelection ? GAMES : games.map((x) => x.game)).map((game) => ({ game, res: checkGame(game, pc) }));
    const order: Record<Verdict, number> = { ok: 0, limite: 1, inconnu: 2, non: 3 };
    // Sans sélection : on montre tout le catalogue, les jeux compatibles en premier
    return noSelection ? list.sort((a, b) => order[a.res.verdict] - order[b.res.verdict]) : list;
  }, [games, pc, noSelection]);
  const catalogue = useMemo(() => {
    if (!anyFilled) return null;
    const r = GAMES.map((g) => ({ g, v: checkGame(g, pc).verdict }));
    return { ok: r.filter((x) => x.v === "ok" || x.v === "limite").length, no: r.filter((x) => x.v === "non").length };
  }, [pc, anyFilled]);

  async function autoDetect() {
    setDetectMsg("Analyse en cours…");
    const d = await detectHardware();
    const next = { ...pc };
    const found: string[] = [];
    if (d.gpu) {
      next.gpu = d.gpu;
      found.push("carte graphique");
    }
    if (d.windows) {
      next.windows = d.windows;
      found.push("Windows");
    }
    if (d.ramHint && !pc.ramGb && d.ramHint < 8) {
      next.ramGb = String(d.ramHint);
      found.push("RAM");
    }
    setPc(next);
    setDetectMsg(
      found.length
        ? `Détecté : ${found.join(", ")}. Le navigateur ne peut pas lire le processeur ni l'espace disque : complétez-les ou utilisez la commande Windows ci-dessous.`
        : "Rien n'a pu être détecté depuis ce navigateur (téléphone, Mac ou protection activée). Saisissez les informations ou utilisez la commande Windows.",
    );
  }

  function applyPaste() {
    const r = parsePowerShellOutput(pasteText);
    if (!r) return setPasteMsg("Format non reconnu. Collez la ligne complète affichée par la commande.");
    setPc({ ...pc, ...r });
    setPasteMsg("PC renseigné automatiquement ✔");
  }

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(POWERSHELL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* copie manuelle */
    }
  }

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Les caractéristiques de votre PC</h2>
          <button type="button" onClick={autoDetect} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan px-4 text-sm font-bold text-black transition active:scale-95">
            <ScanSearch className="size-4" /> Détecter mon PC
          </button>
        </div>
        {detectMsg && <p className="rounded-lg bg-raised p-3 text-xs text-mute" role="status">{detectMsg}</p>}

        <div className="rounded-xl border border-line p-4">
          <button type="button" onClick={() => setPasteOpen((o) => !o)} className="w-full text-left text-sm font-semibold text-violet" aria-expanded={pasteOpen}>
            {pasteOpen ? "▾" : "▸"} Remplir tout automatiquement avec Windows (30 secondes)
          </button>
          {pasteOpen && (
            <div className="mt-3 space-y-3 text-sm text-mute">
              <ol className="list-decimal space-y-1 pl-5">
                <li>Ouvrez <strong className="text-white">PowerShell</strong> (touche Windows, tapez « powershell »).</li>
                <li>
                  Copiez cette commande, collez-la et appuyez sur Entrée :{" "}
                  <button type="button" onClick={copyCmd} className="ml-1 inline-flex items-center gap-1 rounded bg-raised px-2 py-1 text-xs font-semibold text-white">
                    <Copy className="size-3" /> {copied ? "Copié ✔" : "Copier la commande"}
                  </button>
                </li>
                <li>Copiez la ligne affichée et collez-la ici :</li>
              </ol>
              <textarea className="field min-h-20 text-xs" value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz;Intel(R) UHD Graphics 620;8;120;Microsoft Windows 10 Home" />
              <button type="button" onClick={applyPaste} className="rounded-lg bg-violet px-4 py-2 font-semibold text-white">Analyser</button>
              {pasteMsg && <p className="text-xs" role="status">{pasteMsg}</p>}
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Processeur</span>
          <input className="field" list="cpus" placeholder="ex. Intel Core i5-8250U" value={pc.cpu} onChange={(e) => set("cpu", e.target.value)} autoComplete="off" />
          <datalist id="cpus">{SUGGESTIONS.cpu.map((c) => <option key={c} value={c} />)}</datalist>
          {pc.cpu && (
            <p className={`mt-1.5 text-xs ${cpuInfo ? "text-lime" : "text-amber-300"}`}>
              {cpuInfo ? `✔ Reconnu : ${cpuInfo.label} — ${cpuTierLabel(cpuInfo.score)}` : "Modèle non reconnu : le technicien le vérifiera."}
            </p>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Carte graphique</span>
          <input className="field" list="gpus" placeholder="ex. NVIDIA GTX 1050 ou Intel UHD 620" value={pc.gpu} onChange={(e) => set("gpu", e.target.value)} autoComplete="off" />
          <datalist id="gpus">{SUGGESTIONS.gpu.map((c) => <option key={c} value={c} />)}</datalist>
          {pc.gpu && (
            <p className={`mt-1.5 text-xs ${gpuInfo ? "text-lime" : "text-amber-300"}`}>
              {gpuInfo ? `✔ Reconnue : ${gpuInfo.label} — ${gpuTierLabel(gpuInfo.score)}` : "Modèle non reconnu : le technicien le vérifiera."}
            </p>
          )}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Mémoire RAM</span>
            <select className="field" value={pc.ramGb} onChange={(e) => set("ramGb", e.target.value)}>
              <option value="">Choisir…</option>
              {RAM_OPTIONS.map((r) => <option key={r} value={r}>{r} Go</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Stockage disponible (Go)</span>
            <input className="field" type="number" min={0} inputMode="numeric" placeholder="ex. 120" value={pc.storageGb} onChange={(e) => set("storageGb", e.target.value)} />
          </label>
        </div>

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
              <img src={preview} alt="Capture des caractéristiques du PC" className="max-h-56 w-full bg-black object-contain" />
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
          {pc.screenshotName && <p className="mt-2 text-xs text-mute">La capture sera à joindre dans la conversation WhatsApp.</p>}
        </div>
      </form>

      <section aria-live="polite" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-violet/40 bg-surface p-5 sm:p-7">
          <h2 className="font-display text-xl font-semibold">Analyse de compatibilité</h2>

          {catalogue && (
            <p className="mt-2 text-sm text-mute">
              Sur {GAMES.length} jeux du catalogue : <strong className="text-lime">{catalogue.ok} jouables</strong>, <strong className="text-danger">{catalogue.no} non compatibles</strong>.
            </p>
          )}

          {noSelection && (
            <p className="mt-4 rounded-xl bg-raised p-3 text-sm text-mute">
              Vous n&apos;avez pas encore choisi de jeu : voici la compatibilité de <strong className="text-white">tout le catalogue</strong> avec votre PC. Ajoutez ceux qui vous intéressent.
            </p>
          )}
          <ul className="mt-5 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
            {results.map(({ game, res }) => (
              <li key={game.id} className="rounded-xl bg-raised p-3.5">
                <div className="flex gap-3">
                  <span className="mt-0.5">{ICON[res.verdict]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{game.name}</p>
                    <p className={`text-sm font-semibold ${res.verdict === "ok" ? "text-lime" : res.verdict === "limite" ? "text-amber-300" : res.verdict === "non" ? "text-danger" : "text-mute"}`}>
                      {VERDICT_LABEL[res.verdict]}
                    </p>
                    <p className="text-xs text-mute">{res.reasons.join(" · ")}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-mute">
                        {(Object.keys(PART_LABEL) as (keyof typeof PART_LABEL)[]).map((k) => (
                          <span key={k} className="inline-flex items-center gap-1">
                            <span className={`size-2 rounded-full ${DOT[res.parts[k]]}`} /> {PART_LABEL[k]}
                          </span>
                        ))}
                      </p>
                      {noSelection || !has(game.id) ? (
                        <button type="button" onClick={() => toggle(game.id)} className="min-h-9 rounded-lg bg-violet px-3 text-xs font-semibold">+ Ajouter</button>
                      ) : (
                        <span className="text-xs font-semibold text-violet">✔ Dans ma sélection</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-3 rounded-xl border border-cyan/30 bg-cyan/5 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
            <p className="text-mute">
              <strong className="text-white">Résultat indicatif.</strong> Un jeu « non compatible » ne fonctionnera pas correctement sur votre PC. Vous restez libre de le commander, <strong className="text-white">mais sans garantie de fonctionnement</strong>. La validation finale est faite par le technicien.</p>
          </div>

          <Link href="/reservation" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet font-semibold transition hover:bg-violet/85 active:scale-[0.98]">
            Réserver maintenant <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
