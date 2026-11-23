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
  inconnu: "À compléter",
};

/**
 * Moteur de compatibilité : compare le PC aux exigences du jeu.
 * Le processeur et la carte graphique sont reconnus par leur modèle (base interne),
 * pas par une simple liste déroulante. Résultat indicatif, validé ensuite par le technicien.
 */
export function checkGame(game: Game, pc: PcSpecs): CompatResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const parts: CompatResult["parts"] = { cpu: "inconnu", gpu: "inconnu", ram: "inconnu", disk: "inconnu", windows: "inconnu" };

  // Processeur
  const cpu = recognizeCpu(pc.cpu);
  if (cpu) {
    if (cpu.score < game.minCpuScore * 0.85) {
      parts.cpu = "non";
      const msg = `Processeur trop lent (${game.minCpu} ou équivalent requis)`;
      reasons.push(msg);
      blockers.push(msg);
    } else if (cpu.score < game.minCpuScore * 1.15) {
      parts.cpu = "limite";
      reasons.push("Processeur juste au niveau minimum");
    } else parts.cpu = "ok";
  } else if (pc.cpu.trim()) reasons.push("Processeur non reconnu : à vérifier par le technicien");

  // Carte graphique
  const gpu = recognizeGpu(pc.gpu);
  if (gpu) {
    if (gpu.score < game.minGpuScore) {
      parts.gpu = "non";
      const msg = `Carte graphique insuffisante (${game.minGpu} requis)`;
      reasons.push(msg);
      blockers.push(msg);
    } else if (gpu.score < game.minGpuScore * 1.5) {
      parts.gpu = "limite";
      reasons.push("Carte graphique proche du minimum : réglages bas conseillés");
    } else parts.gpu = "ok";
  } else if (pc.gpu.trim()) reasons.push("Carte graphique non reconnue : à vérifier par le technicien");

  // RAM
  const ram = parseFloat(pc.ramGb);
  if (!isNaN(ram)) {
    if (ram < game.minRamGb) {
      parts.ram = "non";
      const msg = `RAM insuffisante (${ram} Go, ${game.minRamGb} Go requis)`;
      reasons.push(msg);
      blockers.push(msg);
    } else if (ram === game.minRamGb && game.minRamGb >= 8) {
      parts.ram = "limite";
      reasons.push("RAM au strict minimum");
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
    } else if (storage < game.sizeGb * 1.15) {
      parts.disk = "limite";
      reasons.push("Espace disque très juste");
    } else parts.disk = "ok";
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
  const known = values.filter((v) => v !== "inconnu").length;
  let verdict: Verdict;
  if (known === 0) {
    verdict = "inconnu";
    reasons.unshift("Renseignez votre PC pour obtenir une estimation");
  } else if (values.includes("non")) verdict = "non";
  else if (values.includes("limite")) verdict = "limite";
  else if (parts.cpu === "inconnu" || parts.gpu === "inconnu" || parts.ram === "inconnu") {
    // Les 3 éléments décisifs (processeur, carte graphique, RAM) doivent être connus
    verdict = "inconnu";
    const missing = ([["cpu", "processeur"], ["gpu", "carte graphique"], ["ram", "RAM"]] as const)
      .filter(([k]) => parts[k] === "inconnu")
      .map(([, l]) => l);
    reasons.push(`Aucun blocage détecté pour l'instant. À renseigner : ${missing.join(", ")}`);
  } else {
    verdict = "ok";
    reasons.push("Votre PC répond aux exigences du jeu");
    if (parts.disk === "inconnu") reasons.push("pensez à indiquer l'espace disque libre");
    if (parts.windows === "inconnu") reasons.push("et la version de Windows");
  }
  return { verdict, reasons, blockers, parts };
}
