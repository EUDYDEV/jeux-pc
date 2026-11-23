export type Category =
  | "Action"
  | "Aventure"
  | "Course"
  | "FPS"
  | "Sport"
  | "Stratégie"
  | "Survie"
  | "Simulation";

export interface Game {
  id: string;
  name: string;
  category: Category;
  /** Prix d'installation en FCFA (données de démonstration) */
  price: number;
  popularity: number; // 0-100
  sizeGb: number;
  /** Configuration minimale lisible */
  minCpu: string;
  /** Indice de performance minimale du processeur (voir src/lib/hardware.ts) */
  minCpuScore: number;
  minRamGb: number;
  minGpu: string;
  /** Indice de performance minimale de la carte graphique (GTX 1060 6 Go = 100) */
  minGpuScore: number;
  /** Identifiant Steam : sert à afficher le visuel officiel du jeu */
  steamAppId: number;
  minWindows: 10 | 11;
  /** Teinte (0-360) utilisée pour générer le visuel */
  hue: number;
  tagline: string;
  badge?: "Populaire" | "Nouveau" | "Léger";
}

export interface PcSpecs {
  cpu: string;
  ramGb: string;
  gpu: string;
  storageGb: string;
  windows: string; // "" | "10" | "11" | "7/8"
  screenshotName?: string;
}

export type InstallType = "domicile" | "distance";

export interface BookingDraft {
  fullName: string;
  whatsapp: string;
  installType: InstallType;
  date: string;
  time: string;
  zone: string;
  notes: string;
}

export type RequestStatus = "en_attente" | "confirmee" | "refusee";

export interface BookingRequest {
  id: string;
  createdAt: string;
  status: RequestStatus;
  booking: BookingDraft;
  games: { id: string; name: string; price: number }[];
  pc: PcSpecs;
  total: number;
}
