import { SITE } from "./config";
import { formatDateFr, formatFcfa } from "./format";
import { checkGame, VERDICT_LABEL } from "./compat";
import { recognizeCpu, recognizeGpu, gpuTierLabel } from "./hardware";
import type { BookingDraft, Game, PcSpecs } from "./types";

export function waLink(text?: string): string {
  const base = `https://wa.me/${SITE.whatsappIntl}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function buildBookingMessage(opts: {
  booking: BookingDraft;
  games: Game[];
  pc: PcSpecs;
  total: number;
  ref: string;
}): string {
  const { booking, games, pc, total, ref } = opts;
  const gpuInfo = recognizeGpu(pc.gpu);
  const cpuInfo = recognizeCpu(pc.cpu);
  const lines: string[] = [
    `🎮 *DEMANDE D'INSTALLATION* — réf. ${ref}`,
    "",
    `👤 *Client* : ${booking.fullName}`,
    `📱 *WhatsApp* : ${booking.whatsapp}`,
    "",
    `🕹️ *Jeux sélectionnés* (${games.length}) :`,
    ...games.map((g) => `• ${g.name} — ${formatFcfa(g.price)}`),
    `💰 *Total estimatif* : ${formatFcfa(total)}`,
    "",
    "💻 *Caractéristiques du PC* :",
    `• Processeur : ${pc.cpu || "non renseigné"}${cpuInfo ? "" : pc.cpu ? " (non reconnu)" : ""}`,
    `• RAM : ${pc.ramGb ? pc.ramGb + " Go" : "non renseignée"}`,
    `• Carte graphique : ${pc.gpu || "non renseignée"}${gpuInfo ? ` (${gpuTierLabel(gpuInfo.score)})` : ""}`,
    `• Stockage libre : ${pc.storageGb ? pc.storageGb + " Go" : "non renseigné"}`,
    `• Windows : ${pc.windows ? (pc.windows === "7/8" ? "7 / 8" : pc.windows) : "non renseigné"}`,
  ];
  lines.push("", "✅ *Compatibilité estimée par le site (indicatif)* :");
  for (const g of games) lines.push(`• ${g.name} : ${VERDICT_LABEL[checkGame(g, pc).verdict]}`);
  if (pc.screenshotName) lines.push(`• Capture d'écran : à envoyer ensuite dans cette conversation (${pc.screenshotName})`);
  lines.push(
    "",
    `🛠️ *Type* : ${booking.installType === "domicile" ? "À domicile" : "À distance (Wi-Fi)"}`,
    `📅 *Date souhaitée* : ${formatDateFr(booking.date)} à ${booking.time}`,
  );
  if (booking.installType === "domicile" && booking.zone) lines.push(`📍 *Zone / adresse* : ${booking.zone}`);
  if (booking.notes) lines.push(`📝 *Infos complémentaires* : ${booking.notes}`);
  lines.push("", "⏳ Demande en attente de confirmation. Merci de vérifier la compatibilité et de me confirmer le tarif et le créneau.");
  return lines.join("\n");
}
