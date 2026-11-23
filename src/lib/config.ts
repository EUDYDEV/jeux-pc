export const SITE = {
  name: "PixelDock",
  tagline: "Installation de jeux PC à Abidjan",
  whatsappIntl: "2250759084345",
  whatsappDisplay: "+225 07 59 08 43 45",
  whatsappLocal: "0759084345",
  city: "Abidjan, Côte d'Ivoire",
  /** À renseigner par le prestataire */
  hours: [
    { day: "Lundi – Vendredi", time: "À renseigner" },
    { day: "Samedi", time: "À renseigner" },
    { day: "Dimanche", time: "À renseigner" },
  ],
  zones: ["Cocody", "Yopougon", "Marcory", "Plateau", "Abobo", "Koumassi", "Treichville", "Adjamé"],
} as const;

export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export const GPU_TIERS = [
  { value: "0", label: "Intégrée (Intel HD / UHD, AMD Vega)" },
  { value: "1", label: "Entrée de gamme (GTX 650–1050, RX 550)" },
  { value: "2", label: "Milieu de gamme (GTX 1060–1660, RX 570–580)" },
  { value: "3", label: "Haut de gamme (RTX 2060–3060, RX 6600)" },
  { value: "4", label: "Très haut de gamme (RTX 3070+, RX 6700+)" },
];
