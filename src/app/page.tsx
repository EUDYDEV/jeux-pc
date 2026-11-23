import Link from "next/link";
import { ArrowRight, Cpu, HeadphonesIcon, MonitorCheck, Wifi, Gamepad2, ClipboardCheck, CalendarCheck, MessageCircle } from "lucide-react";
import { GAMES } from "@/data/games";
import { GameCover } from "@/components/GameCover";
import { GameCard } from "@/components/GameCard";
import { Reveal } from "@/components/Reveal";
import { formatFcfa } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

const BENEFITS = [
  { icon: Gamepad2, title: "Installation de jeux PC", text: "Des dizaines de titres installés, configurés et prêts à lancer." },
  { icon: MonitorCheck, title: "Vérification de compatibilité", text: "Votre PC est analysé avant tout paiement : pas de mauvaise surprise." },
  { icon: Wifi, title: "Installation à distance", text: "Vous avez le Wi-Fi ? Le technicien installe depuis chez lui, sans déplacement." },
  { icon: HeadphonesIcon, title: "Assistance personnalisée", text: "Un interlocuteur réel, avant, pendant et après l'installation." },
];

const FLOW = [
  { icon: Gamepad2, t: "Choisissez", d: "Parcourez le catalogue et sélectionnez vos jeux." },
  { icon: Cpu, t: "Vérifiez", d: "Indiquez votre PC : compatibilité instantanée." },
  { icon: CalendarCheck, t: "Réservez", d: "Choisissez date, heure et mode d'installation." },
  { icon: MessageCircle, t: "Confirmez", d: "Envoyez le récapitulatif sur WhatsApp en un clic." },
];

export default function HomePage() {
  const popular = [...GAMES].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const hero = GAMES.filter((g) => ["gta-v", "forza-h5", "cyberpunk", "fc-25"].includes(g.id));
  const cheapest = Math.min(...GAMES.map((g) => g.price));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-violet/25 blur-[140px]" aria-hidden />
        <div className="pointer-events-none absolute right-[-10%] top-40 size-[420px] rounded-full bg-cyan/15 blur-[130px]" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-semibold text-mute">
              <span className="size-2 animate-pulse rounded-full bg-lime" /> Abidjan · À domicile ou à distance
            </p>
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Vos jeux préférés, <span className="glow-text">installés sur votre PC.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mute">
              Découvrez notre catalogue, vérifiez la compatibilité de votre ordinateur et réservez votre installation en quelques clics.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogue"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet px-6 font-semibold text-white shadow-[0_10px_40px_-10px_rgb(139_92_246/0.8)] transition hover:bg-violet/85 active:scale-95"
              >
                Explorer les jeux <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/reservation"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 font-semibold transition hover:border-cyan/60 active:scale-95"
              >
                Réserver une installation
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-xs text-mute">Jeux au catalogue</dt>
                <dd className="font-display text-2xl font-bold">{GAMES.length}+</dd>
              </div>
              <div>
                <dt className="text-xs text-mute">À partir de</dt>
                <dd className="font-display text-2xl font-bold text-lime">{formatFcfa(cheapest)}</dd>
              </div>
              <div>
                <dt className="text-xs text-mute">Mode</dt>
                <dd className="font-display text-2xl font-bold">Distance</dd>
              </div>
            </dl>
          </div>

          {/* Mosaïque de jaquettes */}
          <div className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-4" aria-hidden>
            {hero.map((g, i) => (
              <div
                key={g.id}
                className={`overflow-hidden rounded-2xl border border-line shadow-2xl ${i % 2 ? "translate-y-8" : ""} ${i === 0 ? "-rotate-2" : i === 3 ? "rotate-2" : ""}`}
              >
                <GameCover game={g} className="aspect-[5/3] w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Pourquoi nous</p>
          <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Un service pensé pour les joueurs</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08}>
              <div className="card-border h-full rounded-2xl border border-line bg-surface p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-violet/15 text-violet">
                  <b.icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-mute">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* POPULAIRES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Catalogue</p>
            <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Les plus demandés</h2>
          </div>
          <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:underline">
            Voir tout le catalogue <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      {/* PROCESSUS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">Comment ça marche</p>
          <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">De la sélection à l&apos;installation</h2>
          <p className="mt-3 max-w-2xl text-mute">
            Fini les dizaines de messages : toutes les informations arrivent d&apos;un coup, déjà structurées, directement sur WhatsApp.
          </p>
        </Reveal>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {FLOW.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <li className="relative h-full rounded-2xl border border-line bg-surface p-6">
                <span className="font-display absolute right-5 top-4 text-5xl font-bold text-white/[0.06]">{i + 1}</span>
                <s.icon className="size-6 text-lime" aria-hidden />
                <h3 className="font-display mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-mute">{s.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-violet/40 bg-gradient-to-br from-violet/25 via-surface to-cyan/15 p-8 sm:p-14">
            <ClipboardCheck className="absolute -right-6 -top-6 size-48 text-white/[0.04]" aria-hidden />
            <h2 className="font-display max-w-2xl text-3xl font-bold sm:text-4xl">Prêt à jouer ? Votre PC est peut-être déjà compatible.</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/compatibilite" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-lime px-6 font-semibold text-black transition active:scale-95">
                Tester mon PC
              </Link>
              <a
                href={waLink("Bonjour, je souhaite des informations sur l'installation de jeux.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 font-semibold transition hover:bg-white/5 active:scale-95"
              >
                <MessageCircle className="size-4" /> Écrire sur WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
