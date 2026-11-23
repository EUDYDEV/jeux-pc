/**
 * Base de performances matérielles (estimations).
 * GPU : indice relatif, GTX 1060 6 Go = 100.
 * CPU : indice relatif, Core i5-6600 ≈ 72, Core i5-8400 ≈ 100.
 * Ce sont des ordres de grandeur utiles pour filtrer ; la validation finale reste humaine.
 */

export interface Recognized {
  label: string;
  score: number;
  /** true = modèle seulement estimé (nom générique ou inconnu) : jamais décisif pour refuser un jeu */
  estimated?: boolean;
  /** true = plusieurs modèles saisis dans le même champ */
  ambiguous?: boolean;
}

/** Nettoie un nom de matériel : minuscules, sans marque ni mots parasites */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(r\)|\(tm\)|®|™/g, " ")
    .replace(/nvidia|geforce|amd|radeon|intel|graphics|series|laptop|mobile|max-q|with|gpu|card|edition/g, " ")
    .replace(/[^a-z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
/** Sépare lettres et chiffres pour comparer "gtx1050ti" et "GTX 1050 Ti" */
const spaced = (s: string) =>
  norm(s)
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

/* ------------------------------ CARTES GRAPHIQUES ------------------------------ */

const GPU_LIST: [string, number][] = [
  // Intégrées Intel / AMD
  ["hd 3000", 4], ["hd 4000", 7], ["hd 4400", 9], ["hd 4600", 11], ["hd 5500", 11], ["hd 520", 12], ["hd 530", 13], ["hd 620", 13],
  ["uhd 600", 9], ["uhd 605", 10], ["uhd 610", 10], ["uhd 617", 12], ["uhd 620", 14], ["uhd 630", 17], ["uhd 730", 22], ["uhd 770", 28],
  ["iris plus 640", 18], ["iris plus 655", 22], ["iris plus", 20], ["iris xe", 32], ["iris", 20],
  ["vega 3", 10], ["vega 6", 17], ["vega 7", 22], ["vega 8", 26], ["vega 10", 28], ["vega 11", 32], ["vega", 20],
  ["780m", 55], ["680m", 48], ["610m", 22],
  // NVIDIA GT / GTX anciennes
  ["gt 210", 2], ["gt 430", 5], ["gt 520", 4], ["gt 610", 4], ["gt 620", 5], ["gt 630", 8], ["gt 640", 12], ["gt 710", 6], ["gt 720", 8],
  ["gt 730", 9], ["gt 740", 14], ["gts 450", 15], ["gtx 460", 20], ["gtx 550 ti", 17], ["gtx 560", 24], ["gtx 560 ti", 28],
  ["gtx 570", 32], ["gtx 580", 38], ["mx110", 10], ["mx130", 12], ["mx150", 24], ["mx230", 18], ["mx250", 28], ["mx330", 28], ["mx350", 32], ["mx450", 45],
  ["gtx 650 ti", 20], ["gtx 650", 15], ["gtx 660 ti", 38], ["gtx 660", 30], ["gtx 670", 40], ["gtx 680", 45], ["gtx 690", 70],
  ["gtx 745", 15], ["gtx 750 ti", 27], ["gtx 750", 22], ["gtx 760", 38], ["gtx 770", 45], ["gtx 780 ti", 70], ["gtx 780", 60],
  ["gtx 950", 42], ["gtx 960", 50], ["gtx 970", 80], ["gtx 980 ti", 125], ["gtx 980", 95],
  ["gt 1030", 25], ["gtx 1050 ti", 65], ["gtx 1050", 52], ["gtx 1060 3gb", 90], ["gtx 1060", 100], ["gtx 1070 ti", 170], ["gtx 1070", 150],
  ["gtx 1080 ti", 250], ["gtx 1080", 195],
  ["gtx 1650 super", 120], ["gtx 1650", 90], ["gtx 1660 ti", 150], ["gtx 1660 super", 145], ["gtx 1660", 130],
  ["rtx 2060 super", 210], ["rtx 2060", 185], ["rtx 2070 super", 250], ["rtx 2070", 230], ["rtx 2080 ti", 340], ["rtx 2080 super", 300], ["rtx 2080", 285],
  ["rtx 3050", 155], ["rtx 3060 ti", 270], ["rtx 3060", 210], ["rtx 3070 ti", 350], ["rtx 3070", 330], ["rtx 3080 ti", 460], ["rtx 3080", 430], ["rtx 3090", 480],
  ["rtx 4050", 190], ["rtx 4060 ti", 280], ["rtx 4060", 240], ["rtx 4070 ti", 400], ["rtx 4070", 340], ["rtx 4080", 520], ["rtx 4090", 700],
  // AMD
  ["hd 5450", 2], ["hd 6450", 3], ["hd 6570", 8], ["hd 6670", 10], ["hd 7570", 12], ["hd 7670", 14], ["hd 7750", 20], ["hd 7770", 30], ["hd 7850", 40], ["hd 7870", 50], ["hd 7950", 60], ["hd 7970", 75],
  ["r5 230", 4], ["r5 235", 5], ["r7 240", 8], ["r7 250", 20], ["r7 260x", 32], ["r7 360", 35], ["r9 270x", 55], ["r9 270", 50], ["r9 280x", 85], ["r9 290", 100], ["r9 380", 70], ["r9 390", 120],
  ["rx 460", 50], ["rx 470", 90], ["rx 480", 105], ["rx 550", 40], ["rx 560", 55], ["rx 570", 100], ["rx 580", 115], ["rx 590", 130],
  ["rx 5500 xt", 125], ["rx 5600 xt", 175], ["rx 5700 xt", 240], ["rx 5700", 220],
  ["rx 6400", 85], ["rx 6500 xt", 120], ["rx 6600 xt", 255], ["rx 6600", 235], ["rx 6650 xt", 270], ["rx 6700 xt", 330], ["rx 6750 xt", 350], ["rx 6800", 420], ["rx 6900 xt", 520],
  ["rtx 5090", 800], ["rtx 5080", 600], ["rtx 5070 ti", 480], ["rtx 5070", 420], ["rtx 5060 ti", 330], ["rtx 5060", 290], ["rtx 5050", 220],
  ["rx 9070 xt", 520], ["rx 9070", 450], ["rx 9060 xt", 330],
  ["arc a310", 35], ["arc a380", 60], ["arc a580", 150], ["arc a750", 190], ["arc a770", 210], ["arc b570", 230], ["arc b580", 250],
  ["arc 140v", 50], ["arc 130v", 42], ["arc graphics", 80], ["arc", 80],
  ["890m", 75], ["880m", 68], ["radeon 780m", 55], ["760m", 38], ["740m", 28],
  ["rx 7600", 270], ["rx 7700 xt", 380], ["rx 7800 xt", 450],
  // Portables anciens et séries M / MX
  ["gtx 850m", 30], ["gtx 860m", 40], ["gtx 870m", 70], ["gtx 880m", 90], ["gtx 950m", 28], ["gtx 960m", 40], ["gtx 965m", 55], ["gtx 970m", 70], ["gtx 980m", 95],
  ["820m", 4], ["825m", 5], ["830m", 6], ["840m", 12], ["845m", 18], ["910m", 4], ["920m", 6], ["920mx", 7], ["930m", 9], ["930mx", 9], ["940m", 12], ["940mx", 14], ["950m", 28],
  ["gt 540m", 10], ["gt 550m", 12], ["gt 555m", 14], ["gt 635m", 14], ["gt 650m", 18], ["gt 740m", 12], ["gt 750m", 20], ["gt 755m", 22],
  ["gt 240", 7], ["gt 440", 8], ["gt 520m", 4], ["9400 gt", 4], ["9500 gt", 4], ["9600 gt", 8], ["9800 gt", 12], ["8400 gs", 2], ["8600 gt", 5], ["8800 gt", 10],
  ["gtx 260", 18], ["gtx 275", 24], ["gtx 280", 25], ["gtx 285", 28], ["gtx 295", 40],
  ["gtx 1630", 55], ["rtx 2050", 110], ["gtx 1650 max q", 85],
  // Pro / stations de travail
  ["quadro k620", 22], ["quadro k1200", 40], ["quadro k2200", 55], ["quadro p620", 40], ["quadro p1000", 60], ["quadro p2000", 95], ["quadro t600", 60], ["quadro t1000", 85], ["quadro t2000", 120],
  ["rtx a2000", 150], ["rtx a4000", 270], ["rtx a1000", 100],
  ["pro wx 3200", 40], ["pro wx 5100", 100],
  // AMD portables et récents
  ["rx 6300m", 70], ["rx 6500m", 110], ["rx 6600s", 170], ["rx 6700s", 250], ["rx 6800s", 300], ["rx vega 56", 150], ["rx vega 64", 190], ["vega 56", 150], ["vega 64", 190], ["radeon vii", 270],
  ["hd 4670", 8], ["hd 4850", 18], ["hd 4870", 22], ["hd 5670", 10], ["hd 5770", 20], ["hd 5850", 30], ["hd 5870", 35], ["hd 6850", 30], ["hd 6870", 35],
  ["hd 7640g", 8], ["hd 8670d", 10], ["hd 8470d", 7], ["r5 m330", 10], ["r5 m430", 12], ["r7 m260", 15], ["r7 m340", 20],
  // Intel Arc portables
  ["hd 2000", 3], ["hd 2500", 5], ["hd 4200", 9], ["hd 5000", 16], ["hd 6000", 18], ["iris 5100", 22], ["iris 6100", 24], ["arc a350m", 40], ["arc a370m", 55], ["arc a730m", 130], ["arc a770m", 200],
];

const GPU_SORTED: [string, number, string][] = GPU_LIST.map(([k, v]) => [spaced(k), v, k] as [string, number, string]).sort((a, b) => b[0].length - a[0].length);

export function gpuTierLabel(score: number): string {
  if (score < 15) return "Graphique intégrée (jeux légers)";
  if (score < 45) return "Entrée de gamme";
  if (score < 110) return "Milieu de gamme";
  if (score < 230) return "Haut de gamme";
  return "Très haut de gamme";
}

export function recognizeGpu(input: string): Recognized | null {
  return markAmbiguous(recognizeGpuModel(input), input, "gpu");
}

function recognizeGpuModel(input: string): Recognized | null {
  const lower = input.toLowerCase();
  const n = spaced(input);
  const padded = ` ${n} `;
  for (const [key, score, raw] of GPU_SORTED) {
    if (n && padded.includes(` ${key} `)) return { label: raw.toUpperCase().replace(/ TI$/, " Ti").replace(/ SUPER$/, " Super"), score };
  }

  // Modèle non listé : estimation d'après la classe du modèle. Jamais décisive (estimated).
  const m = n.match(/(gtx|rtx|rx|gts|gt) (\d{3,4})/);
  if (m) {
    const num = parseInt(m[2], 10);
    const cls = Math.floor((num % 1000) / 100);
    let est: number;
    if (m[1] === "gt" || m[1] === "gts") est = Math.min(30, 6 + cls * 4);
    else if (m[1] === "gtx") est = num < 600 ? 25 : num < 1000 ? 45 : num < 1600 ? 100 : 110;
    else if (m[1] === "rx") est = num >= 5000 ? [150, 150, 150, 150, 150, 150, 250, 350, 450, 600][cls] : num >= 400 ? 70 : 20;
    else est = [60, 60, 60, 60, 60, 150, 250, 350, 450, 600][cls];
    return { label: `${m[1].toUpperCase()} ${m[2]} (estimé)`, score: est, estimated: true };
  }

  // Noms génériques (aucun numéro de modèle) : on estime la famille
  const generic: [RegExp, string, number][] = [
    [/express chipset|\bg4[15]\b|\b4 series\b|\bgma\b/, "Graphique très ancienne (chipset)", 2],
    [/radeon.*\br[2-7]\b.*graphics|\br[2-7] graphics/, "Radeon R (intégrée ancienne)", 12],
    [/radeon.*\bhd\b\s*\d{4}/, "Radeon HD (ancienne)", 10],
    [/\b(8|9)\d{2}\s?m(x)?\b/, "GeForce M (portable ancien)", 12],
    [/geforce.*\b(8|9)\d{3}\b/, "GeForce série 8/9 (très ancienne)", 5],
    [/\buhd\b/, "Intel UHD (intégrée)", 14],
    [/\biris\b/, "Intel Iris (intégrée)", 22],
    [/intel.*\bhd\b|\bhd graphics\b/, "Intel HD (intégrée)", 9],
    [/intel\W*(\(r\)\W*)?\s*graphics/, "Intel Graphics (intégrée)", 12],
    [/radeon\W*(\(tm\)\W*)?\s*graphics|amd.*graphics/, "Radeon Graphics (intégrée Ryzen)", 30],
    [/\bquadro\b|\brtx a\d{3,4}\b|\bradeon pro\b/, "Carte professionnelle", 60],
  ];
  for (const [re, label, score] of generic) if (re.test(lower) || re.test(n)) return { label, score, estimated: true };
  return null;
}

/* -------------------------------- PROCESSEURS --------------------------------- */

const INTEL_TIER: Record<string, number> = { "3": 60, "5": 80, "7": 100, "9": 120 };
const INTEL_GEN: Record<number, number> = {
  1: 0.45, 2: 0.55, 3: 0.65, 4: 0.75, 5: 0.82, 6: 0.9, 7: 1.0, 8: 1.25, 9: 1.35, 10: 1.45, 11: 1.6, 12: 2.0, 13: 2.3, 14: 2.4,
};
const RYZEN_TIER: Record<string, number> = { "3": 75, "5": 95, "7": 115, "9": 140 };
const RYZEN_GEN: Record<number, number> = { 1: 1.0, 2: 1.1, 3: 1.3, 4: 1.3, 5: 1.55, 6: 1.6, 7: 1.9, 8: 1.9, 9: 2.2 };

export function cpuTierLabel(score: number): string {
  if (score < 40) return "Processeur d'entrée de gamme";
  if (score < 75) return "Processeur milieu de gamme";
  if (score < 120) return "Bon processeur";
  return "Processeur performant";
}

/** Plusieurs modèles dans un même champ (« Phenom, A10 », « GTX 1050 / 1650 ») : on ne peut pas trancher. */
const CPU_WORDS = /\b(i[3579]|ryzen|core|celeron|pentium|athlon|phenom|fx|xeon|a(4|6|8|9|10|12)|atom)\b/;
const GPU_WORDS = /\b(gtx|rtx|rx|gts|gt|geforce|radeon|uhd|hd|iris|vega|arc|quadro|mx\d*|\d{3,4}\s?(ti|m|mx|s|xt)?)\b/;

function isAmbiguous(text: string, kind: "cpu" | "gpu"): boolean {
  const t = text
    .toLowerCase()
    .replace(/\bw\/.*$/, "")
    .replace(/\bwith\b.*$/, "");
  const words = kind === "cpu" ? CPU_WORDS : GPU_WORDS;
  const segments = t.split(/[,;/+&|]|\bet\b|\bou\b|\band\b/).map((x) => x.trim()).filter((x) => x.length >= 2);
  return segments.length >= 2 && segments.filter((x) => words.test(x)).length >= 2;
}

function markAmbiguous(r: Recognized | null, input: string, kind: "cpu" | "gpu"): Recognized | null {
  return r && isAmbiguous(input, kind) ? { ...r, estimated: true, ambiguous: true } : r;
}

export function recognizeCpu(input: string): Recognized | null {
  return markAmbiguous(recognizeCpuModel(input), input, "cpu");
}

function recognizeCpuModel(input: string): Recognized | null {
  const s = input
    .toLowerCase()
    .replace(/\(r\)|\(tm\)|®|™/g, " ")
    .replace(/\bpro\b|\bwith\b.*$|\bw\/.*$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;

  // Core Ultra (séries 1 et 2)
  let m = s.match(/core\s*ultra\s*([3579])\s*(\d{3})\s*([a-z]{0,2})/);
  const ULTRA: Record<string, number> = { "3": 110, "5": 165, "7": 210, "9": 250 };
  if (m) {
    let score = ULTRA[m[1]] * (m[2][0] === "2" ? 1.25 : 1);
    if (/^(u|v)/.test(m[3])) score *= 0.65;
    return { label: `Core Ultra ${m[1]} ${m[2]}${m[3].toUpperCase()}`, score: Math.round(score) };
  }
  m = s.match(/core\s*ultra\s*([3579])/);
  if (m) return { label: `Core Ultra ${m[1]}`, score: ULTRA[m[1]], estimated: true };

  // Intel Core iN-XXXX(suffixe)
  m = s.match(/i([3579])[\s-]*(\d{4,5})([a-z]{0,2})/);
  if (m) {
    const digits = m[2];
    const gen = digits.length === 5 || digits[0] === "1" ? parseInt(digits.slice(0, 2), 10) : parseInt(digits[0], 10);
    const suffix = m[3];
    let score = INTEL_TIER[m[1]] * (INTEL_GEN[gen] ?? (gen > 14 ? 2.5 : 0.7));
    if (/^(u|g\d?|y)$/.test(suffix) || suffix.startsWith("u")) score *= gen >= 8 ? 0.8 : 0.6;
    if (suffix.startsWith("y")) score *= 0.6;
    return { label: `Core i${m[1]}-${digits}${suffix.toUpperCase()}`, score: Math.round(score) };
  }
  // 1re génération (3 chiffres) : i5-750, i7-920, i3-530
  m = s.match(/i([3579])[\s-]*(\d{3})\b/);
  if (m) return { label: `Core i${m[1]}-${m[2]}`, score: Math.round(INTEL_TIER[m[1]] * 0.45) };

  // "i5 8ème génération" / "i7 10th gen" : génération donnée sans numéro de modèle
  m = s.match(/i([3579])\D{0,12}?(\d{1,2})\s*(?:st|nd|rd|th|e|è|ème|eme|ieme|ième)\b/);
  if (m) {
    const gen = parseInt(m[2], 10);
    return { label: `Core i${m[1]} génération ${gen}`, score: Math.round(INTEL_TIER[m[1]] * (INTEL_GEN[gen] ?? 0.8)), estimated: true };
  }

  // Intel Core m3/m5/m7 (très basse consommation)
  if (/\bm[357][\s-]*\d/.test(s)) return { label: "Core m (basse conso)", score: 25, estimated: true };

  // AMD Ryzen
  m = s.match(/ryzen\s*([3579])\s*(\d{4})([a-z]{0,2})/);
  if (m) {
    const gen = parseInt(m[2][0], 10);
    let score = RYZEN_TIER[m[1]] * (RYZEN_GEN[gen] ?? 1);
    if (/^u/.test(m[3])) score *= 0.75;
    return { label: `Ryzen ${m[1]} ${m[2]}${m[3].toUpperCase()}`, score: Math.round(score) };
  }
  m = s.match(/ryzen\s*ai\s*(?:max\+?\s*)?([3579])\s*(?:hx\s*)?(\d{3})/);
  if (m) return { label: `Ryzen AI ${m[1]} ${m[2]}`, score: { "3": 150, "5": 190, "7": 230, "9": 270 }[m[1]] ?? 200 };
  m = s.match(/ryzen\s*([3579])\b/);
  if (m) return { label: `Ryzen ${m[1]}`, score: RYZEN_TIER[m[1]], estimated: true };

  // Familles anciennes ou d'entrée de gamme
  const legacy: [RegExp, string, number, boolean?][] = [
    [/core\s*2\s*quad/, "Core 2 Quad", 35],
    [/core\s*2\s*duo/, "Core 2 Duo", 25],
    [/celeron\s*(n|j)\d{4}/, "Celeron (basse conso)", 14],
    [/celeron/, "Celeron", 20, true],
    [/pentium\s*(silver|gold)/, "Pentium Silver/Gold", 25],
    [/pentium/, "Pentium", 28, true],
    [/\batom\b/, "Atom (très basse conso)", 10],
    [/athlon/, "Athlon", 30, true],
    [/phenom.*x4/, "Phenom II X4", 45, true],
    [/phenom/, "Phenom", 30, true],
    [/\bfx[\s-]*[4]\d{3}/, "AMD FX-4xxx", 38],
    [/\bfx[\s-]*[68]\d{3}/, "AMD FX", 58],
    [/\ba(4|6)[\s-]\d/, "AMD A4/A6", 22],
    [/\ba(8|9)[\s-]\d/, "AMD A8/A9", 32],
    [/\ba(10|12)[\s-]\d/, "AMD A10/A12", 45],
    [/xeon.*e5[\s-]*26\d{2}\s*v[34]/, "Xeon E5 v3/v4", 130],
    [/xeon.*e3/, "Xeon E3", 90],
    [/xeon/, "Xeon", 90, true],
    [/\bi3\b/, "Core i3", 55, true],
    [/\bi5\b/, "Core i5", 70, true],
    [/\bi7\b/, "Core i7", 90, true],
    [/\bi9\b/, "Core i9", 150, true],
  ];
  for (const [re, label, score, est] of legacy) if (re.test(s)) return { label, score, estimated: est };
  return null;
}

export const SUGGESTIONS = {
  cpu: [
    "Intel Core i3-4005U", "Intel Core i3-6006U", "Intel Core i3-8130U", "Intel Core i5-3320M", "Intel Core i5-4200U",
    "Intel Core i5-6200U", "Intel Core i5-7200U", "Intel Core i5-8250U", "Intel Core i5-8400", "Intel Core i5-10210U",
    "Intel Core i5-1135G7", "Intel Core i5-12400", "Intel Core i7-4770", "Intel Core i7-7700HQ", "Intel Core i7-8750H",
    "Intel Core i7-10750H", "Intel Core i7-12700H", "Intel Celeron N4000", "Intel Pentium N5000", "AMD Ryzen 3 3200G",
    "AMD Ryzen 5 3500U", "AMD Ryzen 5 3600", "AMD Ryzen 5 5600X", "AMD Ryzen 7 5800H", "AMD FX-6300", "AMD A8-7410",
  ],
  gpu: [
    "Intel HD Graphics 4000", "Intel HD Graphics 620", "Intel UHD Graphics 620", "Intel UHD Graphics 630", "Intel Iris Xe",
    "AMD Radeon Vega 8", "NVIDIA GeForce MX150", "NVIDIA GeForce MX250", "NVIDIA GeForce GT 730", "NVIDIA GeForce GTX 650",
    "NVIDIA GeForce GTX 750 Ti", "NVIDIA GeForce GTX 960", "NVIDIA GeForce GTX 1050", "NVIDIA GeForce GTX 1050 Ti",
    "NVIDIA GeForce GTX 1060", "NVIDIA GeForce GTX 1650", "NVIDIA GeForce GTX 1660 Super", "NVIDIA GeForce RTX 2060",
    "NVIDIA GeForce RTX 3050", "NVIDIA GeForce RTX 3060", "NVIDIA GeForce RTX 4060", "AMD Radeon RX 560", "AMD Radeon RX 580",
    "AMD Radeon RX 6600",
  ],
};

/* --------------------- Détection automatique (navigateur) --------------------- */

export interface Detected {
  gpu?: string;
  windows?: "10" | "11";
  isWindows: boolean;
  ramHint?: number; // Chrome plafonne à 8
  threads?: number;
}

export async function detectHardware(): Promise<Detected> {
  const out: Detected = { isWindows: /Windows/i.test(navigator.userAgent) };
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    if (gl && ext) {
      const raw = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
      const angle = raw.match(/ANGLE \([^,]*,\s*([^,]+?)(?:\s+Direct3D|\s+OpenGL|,|\))/i);
      out.gpu = (angle ? angle[1] : raw).replace(/\(0x[0-9a-f]+\)/gi, "").trim();
    }
  } catch {
    /* indisponible */
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    userAgentData?: { getHighEntropyValues: (k: string[]) => Promise<{ platformVersion?: string }> };
  };
  if (nav.deviceMemory) out.ramHint = nav.deviceMemory;
  out.threads = navigator.hardwareConcurrency;
  try {
    if (out.isWindows && nav.userAgentData) {
      const v = await nav.userAgentData.getHighEntropyValues(["platformVersion"]);
      const major = parseInt(v.platformVersion ?? "0", 10);
      out.windows = major >= 13 ? "11" : "10";
    } else if (out.isWindows) out.windows = "10";
  } catch {
    if (out.isWindows) out.windows = "10";
  }
  return out;
}

/** Commande PowerShell à coller dans Windows : affiche toutes les infos sur une ligne. */
export const POWERSHELL_CMD =
  '$c=(Get-CimInstance Win32_Processor|Select -First 1).Name.Trim();$g=(Get-CimInstance Win32_VideoController|%{$_.Name}) -join "|";$r=[math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB);$d=[math]::Round((Get-PSDrive C).Free/1GB);$w=(Get-CimInstance Win32_OperatingSystem).Caption;"$c;$g;$r;$d;$w"';

export function parsePowerShellOutput(text: string): { cpu: string; gpu: string; ramGb: string; storageGb: string; windows: string } | null {
  const parts = text.trim().split(";").map((p) => p.trim());
  if (parts.length < 5) return null;
  const [cpu, gpus, ram, disk, win] = parts;
  // plusieurs cartes : on garde la plus puissante
  const best = gpus
    .split("|")
    .map((g) => ({ g: g.trim(), s: recognizeGpu(g)?.score ?? 0 }))
    .sort((a, b) => b.s - a.s)[0];
  const ramNum = parseInt(ram, 10);
  const standardRam = [2, 4, 6, 8, 12, 16, 24, 32, 64].reduce((p, c) => (Math.abs(c - ramNum) < Math.abs(p - ramNum) ? c : p), 2);
  const windows = /11/.test(win) ? "11" : /10/.test(win) ? "10" : "7/8";
  return { cpu, gpu: best?.g ?? gpus, ramGb: String(standardRam), storageGb: String(parseInt(disk, 10) || ""), windows };
}
