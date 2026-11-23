import { recognizeCpu, recognizeGpu } from "./hardware";
import type { Game, PcSpecs } from "./types";

export type Verdict = "ok" | "limite" | "non" | "inconnu";
export type PartStatus = "ok" | "limite" | "non" | "inconnu";

export interface CompatResult {
  verdict: Verdict;
  reasons: string[];
  /** Raisons qui rendent le jeu non compatible (sous-ensemble de reasons) */
  blockers: string[];
  parts: { cpu: PartStatus; gpu: PartStatus; ram: PartStatus; disk: PartStatus; windows: PartStatus };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  ok: "Vous êtes compatible",
  limite: "Jouable en qualité réduite",
  non: "Non compatible",
  inconnu: "À vérifier",
};

/**
 * Seuils réglables (rapport = performance du PC / performance minimale du jeu).
 * À calibrer avec l'expérience du technicien.
 *  - au-dessus de `ok`   : compatible
 *  - entre `non` et `ok` : jouable en qualité réduite, risque de ralentissements
 *  - en dessous de `non` : non compatible
 * Un matériel seulement ESTIMÉ (nom générique / modèle inconnu) ne peut jamais être jugé « non compatible ».
 */
export const THRESHOLDS = {
  gpu: { ok: 1.4, non: 0.45 },
  cpu: { ok: 1.2, non: 0.7 },
  estimatedOk: 2.5, // un matériel estimé n'est « ok » que s'il dépasse très largement le minimum
  estimatedNon: 0.8, // en dessous : on ne tranche pas, on renvoie vers le technicien
};

function rate(ratio: number, t: { ok: number; non: number }, estimated: boolean, minScore: number): PartStatus {
  // Jeux « légers » (exigence minimale quasi nulle) : il suffit d'atteindre le minimum
  if (!estimated && minScore <= 12 && ratio >= 1) return "ok";
  if (estimated) {
    if (ratio >= THRESHOLDS.estimatedOk) return "ok";
    if (ratio >= THRESHOLDS.estimatedNon) return "limite";
    return "inconnu";
  }
  if (ratio >= t.ok) return "ok";
  if (ratio >= t.non) return "limite";
  return "non";
}

/**
 * Moteur de compatibilité : compare le PC aux exigences du jeu.
 * Le résultat est indicatif : la validation finale revient au technicien.
 */
export function checkGame(game: Game, pc: PcSpecs): CompatResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const uncertain: string[] = [];
  const notes: string[] = [];
  const parts: CompatResult["parts"] = { cpu: "inconnu", gpu: "inconnu", ram: "inconnu", disk: "inconnu", windows: "inconnu" };

  // Processeur
  const cpu = recognizeCpu(pc.cpu);
  if (cpu) {
    parts.cpu = rate(cpu.score / game.minCpuScore, THRESHOLDS.cpu, !!cpu.estimated, game.minCpuScore);
    if (parts.cpu === "non") {
      const msg = `Processeur trop lent (${game.minCpu} ou équivalent requis)`;
      reasons.push(msg);
      blockers.push(msg);
    } else if (parts.cpu === "limite")
      reasons.push(cpu.estimated ? "Processeur estimé proche du minimum" : "Processeur proche ou légèrement sous le minimum : ralentissements possibles");
    else if (parts.cpu === "inconnu") uncertain.push("processeur");
  } else if (pc.cpu.trim()) uncertain.push("processeur");

  // Carte graphique
  const gpu = recognizeGpu(pc.gpu);
  if (gpu) {
    parts.gpu = rate(gpu.score / game.minGpuScore, THRESHOLDS.gpu, !!gpu.estimated, game.minGpuScore);
    if (parts.gpu === "non") {
      const msg = `Carte graphique insuffisante (${game.minGpu} requis)`;
      reasons.push(msg);
      blockers.push(msg);
    } else if (parts.gpu === "limite")
      reasons.push(gpu.estimated ? "Carte graphique estimée proche du minimum" : "Carte graphique proche ou légèrement sous le minimum : réglages bas conseillés");
    else if (parts.gpu === "inconnu") uncertain.push("carte graphique");
  } else if (pc.gpu.trim()) uncertain.push("carte graphique");

  // RAM (valeur exacte choisie par le client)
  const ram = parseFloat(pc.ramGb);
  if (!isNaN(ram)) {
    if (ram < game.minRamGb) {
      parts.ram = "non";
      const msg = `RAM insuffisante (${ram} Go, ${game.minRamGb} Go requis)`;
      reasons.push(msg);
      blockers.push(msg);
    } else parts.ram = "ok";
  }

  // Disque
  const storage = parseFloat(pc.storageGb);
  if (!isNaN(storage)) {
    if (storage < game.sizeGb) {
      parts.disk = "non";
      const msg = `Espace disque insuffisant (${game.sizeGb} Go nécessaires, ${storage} Go libres)`;
      reasons.push(msg);
      blockers.push(msg);
    } else {
      parts.disk = "ok";
      if (storage < game.sizeGb * 1.15) notes.push("espace disque très juste : prévoyez de libérer de la place");
    }
  }

  // Windows
  if (pc.windows) {
    if (pc.windows === "7/8") {
      parts.windows = "non";
      const msg = `Windows ${game.minWindows} ou plus requis`;
      reasons.push(msg);
      blockers.push(msg);
    } else parts.windows = "ok";
  }

  const values = Object.values(parts);
  const missing: string[] = [];
  if (!pc.cpu.trim()) missing.push("processeur");
  if (!pc.gpu.trim()) missing.push("carte graphique");
  if (isNaN(ram)) missing.push("RAM");

  let verdict: Verdict;
  if (values.every((v) => v === "inconnu") && uncertain.length === 0) {
    verdict = "inconnu";
    reasons.unshift("Renseignez votre PC pour obtenir une estimation");
  } else if (values.includes("non")) verdict = "non";
  else if (values.includes("limite")) verdict = "limite";
  else if (missing.length || uncertain.length) {
    verdict = "inconnu";
    if (missing.length) reasons.push(`À renseigner : ${missing.join(", ")}`);
    if (uncertain.length) reasons.push(`À vérifier par le technicien : ${uncertain.join(", ")} (modèle non identifié avec certitude)`);
  } else {
    verdict = "ok";
    reasons.push("Votre PC répond aux exigences du jeu");
    reasons.push(...notes);
    if (parts.disk === "inconnu") reasons.push("pensez à indiquer l'espace disque libre");
    if (parts.windows === "inconnu") reasons.push("et la version de Windows");
  }
  return { verdict, reasons, blockers, parts };
}
