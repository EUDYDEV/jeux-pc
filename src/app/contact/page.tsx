import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { SITE } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez le technicien sur WhatsApp. Zone d'intervention : Abidjan.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeading eyebrow="Contact" title="Parlons de votre installation" />
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#25d366]/40 bg-surface p-7 md:col-span-2">
          <Phone className="size-6 text-[#25d366]" aria-hidden />
          <p className="mt-3 text-sm text-mute">Numéro WhatsApp</p>
          <p className="font-display text-3xl font-bold sm:text-4xl">{SITE.whatsappDisplay}</p>
          <a
            href={waLink("Bonjour, je souhaite des informations sur l'installation de jeux PC.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#25d366] px-6 font-bold text-black transition active:scale-95"
          >
            <MessageCircle className="size-5" /> Discuter sur WhatsApp
          </a>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-7">
          <Clock className="size-6 text-cyan" aria-hidden />
          <h2 className="font-display mt-3 text-xl font-semibold">Horaires de disponibilité</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {SITE.hours.map((h) => (
              <li key={h.day} className="flex justify-between py-2.5">
                <span className="text-mute">{h.day}</span>
                <span className="rounded bg-raised px-2 py-0.5 text-xs font-medium text-amber-300">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-7">
          <MapPin className="size-6 text-violet" aria-hidden />
          <h2 className="font-display mt-3 text-xl font-semibold">Zone d&apos;intervention : Abidjan</h2>
          <p className="mt-2 text-sm text-mute">Déplacement à domicile dans les communes suivantes (et installation à distance partout avec Wi-Fi).</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SITE.zones.map((z) => (
              <li key={z} className="rounded-full border border-line px-3 py-1 text-sm">{z}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
