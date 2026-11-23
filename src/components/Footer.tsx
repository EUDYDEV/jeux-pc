import Link from "next/link";
import { SITE } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm text-mute">
            {SITE.tagline}. Catalogue, compatibilité et réservation en quelques clics.
          </p>
        </div>
        <nav aria-label="Pied de page" className="grid grid-cols-2 gap-2 text-sm text-mute">
          <Link className="hover:text-white" href="/catalogue">Catalogue</Link>
          <Link className="hover:text-white" href="/selection">Ma sélection</Link>
          <Link className="hover:text-white" href="/compatibilite">Compatibilité</Link>
          <Link className="hover:text-white" href="/reservation">Réservation</Link>
          <Link className="hover:text-white" href="/contact">Contact</Link>
          <Link className="hover:text-white" href="/admin">Espace admin (aperçu)</Link>
        </nav>
        <div className="text-sm text-mute">
          <p>Zone d&apos;intervention : {SITE.city}</p>
          <a href={waLink()} className="mt-2 inline-block font-semibold text-lime hover:underline" target="_blank" rel="noopener noreferrer">
            WhatsApp {SITE.whatsappDisplay}
          </a>
        </div>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-mute">
        Démonstration : tarifs et catalogue fictifs, à titre d&apos;illustration. Les noms de jeux appartiennent à leurs éditeurs respectifs.
      </p>
    </footer>
  );
}
