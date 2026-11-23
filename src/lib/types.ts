export type GpuTier = 0 | 1 | 2 | 3 | 4;

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
  minRamGb: number;
  minGpu: string;
  minGpuTier: GpuTier;
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
  gpuTier: string; // "" | "0".."4"
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
