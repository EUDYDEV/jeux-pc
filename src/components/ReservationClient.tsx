"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Home, MessageCircle, Pencil, Wifi } from "lucide-react";
import { useSelection } from "@/context/SelectionContext";
import { SITE, TIME_SLOTS } from "@/lib/config";
import { formatDateFr, formatFcfa, todayIso } from "@/lib/format";
import { buildBookingMessage, waLink } from "@/lib/whatsapp";
import { localRepository } from "@/lib/repository";
import type { BookingDraft, BookingRequest } from "@/lib/types";

type Errors = Partial<Record<keyof BookingDraft | "games", string>>;

function validate(b: BookingDraft, gamesCount: number): Errors {
  const e: Errors = {};
  if (b.fullName.trim().split(/\s+/).filter(Boolean).length < 2) e.fullName = "Indiquez votre nom et prénom.";
  const digits = b.whatsapp.replace(/[\s.\-()]/g, "");
  if (!/^(\+?225)?\d{10}$/.test(digits)) e.whatsapp = "Numéro invalide (ex. 07 59 08 43 45).";
  if (!b.date) e.date = "Choisissez une date.";
  else if (b.date < todayIso()) e.date = "La date ne peut pas être passée.";
  if (!b.time) e.time = "Choisissez une heure.";
  if (b.installType === "domicile" && b.zone.trim().length < 3) e.zone = "Indiquez votre commune ou adresse.";
  if (gamesCount === 0) e.games = "Sélectionnez au moins un jeu.";
  return e;
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1.5 text-sm text-danger" role="alert">{msg}</p> : null;
}

export function ReservationClient() {
  const { ready, games, total, pc, booking, setBooking, clear } = useSelection();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<{ req: BookingRequest; message: string } | null>(null);

  if (!ready) return <div className="h-64" aria-busy />;

  const set = <K extends keyof BookingDraft>(k: K, v: BookingDraft[K]) => {
    setBooking({ ...booking, [k]: v });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(booking, games.length);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    const ref = "PD-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const req: BookingRequest = {
      id: ref,
      createdAt: new Date().toISOString(),
      status: "en_attente",
      booking,
      games: games.map((x) => ({ id: x.game.id, name: x.game.name, price: x.game.price * x.qty })),
      pc,
      total,
    };
    await localRepository.saveRequest(req);
    setSent({ req, message: buildBookingMessage({ booking, games: games.map((g) => g.game), pc, total, ref }) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ----- Écran récapitulatif ----- */
  if (sent) {
    const { req, message } = sent;
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-lime/40 bg-surface p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-300">
            <Clock3 className="size-3.5" /> En attente de confirmation
          </p>
          <h2 className="font-display mt-4 text-2xl font-bold sm:text-3xl">Votre demande est prête, {req.booking.fullName.split(" ")[0]} !</h2>
          <p className="mt-2 text-mute">
            Dernière étape : envoyez le récapitulatif au technicien sur WhatsApp. <strong className="text-white">Le rendez-vous n&apos;est pas encore confirmé</strong> : il vous répondra pour valider la compatibilité, le tarif et le créneau.
          </p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-raised p-4"><dt className="text-mute">Référence</dt><dd className="font-display text-lg font-bold">{req.id}</dd></div>
            <div className="rounded-xl bg-raised p-4"><dt className="text-mute">Date souhaitée</dt><dd className="font-semibold capitalize">{formatDateFr(req.booking.date)} · {req.booking.time}</dd></div>
            <div className="rounded-xl bg-raised p-4"><dt className="text-mute">Mode</dt><dd className="font-semibold">{req.booking.installType === "domicile" ? `À domicile — ${req.booking.zone}` : "À distance (Wi-Fi)"}</dd></div>
            <div className="rounded-xl bg-raised p-4"><dt className="text-mute">Total estimatif</dt><dd className="font-display text-lg font-bold text-lime">{formatFcfa(req.total)}</dd></div>
          </dl>

          <h3 className="font-display mt-6 text-lg font-semibold">Message qui sera envoyé</h3>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-bg p-4 text-xs leading-relaxed text-mute">{message}</pre>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25d366] px-6 py-3.5 font-bold text-black transition active:scale-[0.98]"
            >
              <MessageCircle className="size-5" /> Envoyer à {SITE.name} sur WhatsApp
            </a>
            <button onClick={() => setSent(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line px-5 font-semibold hover:border-violet/60">
              <Pencil className="size-4" /> Modifier
            </button>
          </div>
          <button
            onClick={() => {
              clear();
              setSent(null);
            }}
            className="mt-4 text-sm text-mute underline-offset-2 hover:underline"
          >
            Nouvelle demande (vider ma sélection)
          </button>
        </div>
      </motion.div>
    );
  }

  /* ----- Formulaire ----- */
  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold">Vos informations</h2>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Nom et prénom</span>
          <input className="field" aria-invalid={!!errors.fullName} value={booking.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" placeholder="ex. Kouassi Aya" />
          <Err msg={errors.fullName} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Numéro WhatsApp</span>
          <input className="field" type="tel" inputMode="tel" aria-invalid={!!errors.whatsapp} value={booking.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} autoComplete="tel" placeholder="07 00 00 00 00" />
          <Err msg={errors.whatsapp} />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Type d&apos;installation</legend>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: "domicile", label: "À domicile", sub: "Le technicien se déplace", Icon: Home },
              { v: "distance", label: "À distance", sub: "Via Wi-Fi", Icon: Wifi },
            ] as const).map(({ v, label, sub, Icon }) => (
              <label key={v} className={`cursor-pointer rounded-xl border p-4 transition ${booking.installType === v ? "border-violet bg-violet/10" : "border-line hover:border-line/80"}`}>
                <input type="radio" name="installType" className="sr-only" checked={booking.installType === v} onChange={() => set("installType", v)} />
                <Icon className="size-5 text-violet" aria-hidden />
                <p className="mt-2 font-semibold">{label}</p>
                <p className="text-xs text-mute">{sub}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Date souhaitée</span>
            <input className="field" type="date" min={todayIso()} aria-invalid={!!errors.date} value={booking.date} onChange={(e) => set("date", e.target.value)} />
            <Err msg={errors.date} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Heure souhaitée</span>
            <select className="field" aria-invalid={!!errors.time} value={booking.time} onChange={(e) => set("time", e.target.value)}>
              <option value="">Choisir…</option>
              {TIME_SLOTS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <Err msg={errors.time} />
          </label>
        </div>

        <AnimatePresence initial={false}>
          {booking.installType === "domicile" && (
            <motion.label initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="block overflow-hidden">
              <span className="mb-1.5 block text-sm font-semibold">Adresse ou zone d&apos;intervention</span>
              <input className="field" list="zones" aria-invalid={!!errors.zone} value={booking.zone} onChange={(e) => set("zone", e.target.value)} placeholder="ex. Cocody, Riviera 2" />
              <datalist id="zones">
                {SITE.zones.map((z) => (
                  <option key={z} value={z} />
                ))}
              </datalist>
              <Err msg={errors.zone} />
            </motion.label>
          )}
        </AnimatePresence>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Informations complémentaires (optionnel)</span>
          <textarea className="field min-h-24" value={booking.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Disque dur externe, connexion, jeux non listés…" />
        </label>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-violet/40 bg-surface p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Jeux sélectionnés</h2>
          {games.length === 0 ? (
            <p className="mt-3 text-sm text-mute">
              Aucun jeu. <Link href="/catalogue" className="font-semibold text-violet hover:underline">Aller au catalogue</Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {games.map(({ game, qty }) => (
                <li key={game.id} className="flex justify-between gap-3">
                  <span>{game.name}{qty > 1 && ` ×${qty}`}</span>
                  <span className="text-mute">{formatFcfa(game.price * qty)}</span>
                </li>
              ))}
            </ul>
          )}
          <Err msg={errors.games} />
          <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
            <span className="text-mute">Total estimatif</span>
            <span className="font-display text-2xl font-bold text-lime">{formatFcfa(total)}</span>
          </div>
          <div className="mt-4 text-xs text-mute">
            PC : {pc.ramGb || pc.cpu ? [pc.cpu, pc.ramGb && `${pc.ramGb} Go RAM`, pc.gpu].filter(Boolean).join(" · ") : "non renseigné"}{" "}
            <Link href="/compatibilite" className="font-semibold text-violet hover:underline">Modifier</Link>
          </div>
        </div>

        <button type="submit" className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-violet px-6 py-3.5 font-bold transition hover:bg-violet/85 active:scale-[0.98]">
          Générer le récapitulatif
        </button>
        <p className="text-center text-xs text-mute">
          Vous enverrez ensuite la demande sur WhatsApp. Elle reste <strong>en attente de confirmation</strong> du prestataire.
        </p>
      </aside>
    </form>
  );
}
