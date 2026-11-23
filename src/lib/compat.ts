import type { Game, PcSpecs } from "./types";

export type Verdict = "ok" | "limite" | "non" | "inconnu";

export interface CompatResult {
  verdict: Verdict;
  reasons: string[];
}

/** Vérification INDICATIVE uniquement : la validation finale revient au technicien. */
export function checkGame(game: Game, pc: PcSpecs): CompatResult {
  const reasons: string[] = [];
  let bad = false;
  let warn = false;
  let known = 0;

  const ram = parseFloat(pc.ramGb);
  if (!isNaN(ram)) {
    known++;
    if (ram < game.minRamGb) {
      bad = true;
      reasons.push(`RAM insuffisante (${ram} Go, ${game.minRamGb} Go requis)`);
    } else if (ram === game.minRamGb && game.minRamGb >= 8) {
      warn = true;
      reasons.push("RAM au minimum : jeu possible mais peu confortable");
    }
  }

  if (pc.gpuTier !== "") {
    known++;
    const tier = parseInt(pc.gpuTier, 10);
    if (tier < game.minGpuTier) {
      bad = true;
      reasons.push(`Carte graphique trop faible (${game.minGpu} requis)`);
    } else if (tier === game.minGpuTier && game.minGpuTier >= 2) {
      warn = true;
      reasons.push("Carte graphique au niveau minimum");
    }
  }

  const storage = parseFloat(pc.storageGb);
  if (!isNaN(storage)) {
    known++;
    if (storage < game.sizeGb) {
      bad = true;
      reasons.push(`Espace disque insuffisant (${game.sizeGb} Go nécessaires)`);
    } else if (storage < game.sizeGb * 1.2) {
      warn = true;
      reasons.push("Espace disque très juste");
    }
  }

  if (pc.windows) {
    known++;
    if (pc.windows === "7/8") {
      bad = true;
      reasons.push("Windows 10 ou 11 requis");
    }
  }

  if (known === 0) return { verdict: "inconnu", reasons: ["Renseignez votre PC pour une première estimation"] };
  if (bad) return { verdict: "non", reasons };
  if (warn) return { verdict: "limite", reasons };
  return { verdict: "ok", reasons: ["Compatible selon les informations fournies"] };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  ok: "Compatible",
  limite: "Limite",
  non: "Non compatible",
  inconnu: "À vérifier",
};
