import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink("Bonjour, j'ai une question sur l'installation de jeux PC.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-black shadow-[0_8px_30px_-6px_rgb(37_211_102/0.7)] transition hover:scale-105 active:scale-95 sm:right-6"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
