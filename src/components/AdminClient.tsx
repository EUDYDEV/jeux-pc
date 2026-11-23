"use client";

import { useEffect, useState } from "react";
import { Check, Inbox, ShieldAlert, X } from "lucide-react";
import { localRepository } from "@/lib/repository";
import { formatDateFr, formatFcfa } from "@/lib/format";
import type { BookingRequest, RequestStatus } from "@/lib/types";

const EMPTY_PC = { cpu: "i5-8250U", ramGb: "8", gpu: "Intel UHD 620", gpuTier: "0", storageGb: "180", windows: "10" };

/** Demandes fictives pour illustrer l'espace admin (non stockées). */
const SAMPLE: BookingRequest[] = [
  {
    id: "PD-DEMO1",
    createdAt: new Date().toISOString(),
    status: "en_attente",
    booking: { fullName: "Koffi Armand", whatsapp: "07 11 22 33 44", installType: "distance", date: "2026-12-02", time: "15:00", zone: "", notes: "Wi-Fi fibre" },
    games: [{ id: "fortnite", name: "Fortnite", price: 2000 }, { id: "minecraft", name: "Minecraft Java", price: 1500 }],
    pc: EMPTY_PC,
    total: 3500,
  },
  {
    id: "PD-DEMO2",
    createdAt: new Date().toISOString(),
    status: "confirmee",
    booking: { fullName: "Yao Mariam", whatsapp: "05 55 66 77 88", installType: "domicile", date: "2026-12-04", time: "10:00", zone: "Cocody Angré", notes: "" },
    games: [{ id: "gta-v", name: "Grand Theft Auto V", price: 3000 }],
    pc: { ...EMPTY_PC, ramGb: "16", gpu: "GTX 1650", gpuTier: "1", storageGb: "300", windows: "11" },
    total: 3000,
  },
];

const STATUS: Record<RequestStatus, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "bg-amber-400/15 text-amber-300" },
  confirmee: { label: "Confirmée", cls: "bg-lime/15 text-lime" },
  refusee: { label: "Refusée", cls: "bg-danger/15 text-danger" },
};

export function AdminClient() {
  const [real, setReal] = useState<BookingRequest[]>([]);
  const [demo, setDemo] = useState<BookingRequest[]>(SAMPLE);

  useEffect(() => {
    localRepository.listRequests().then(setReal);
  }, []);

  const all = [...real, ...demo];

  async function setStatus(r: BookingRequest, s: RequestStatus) {
    if (real.some((x) => x.id === r.id)) {
      await localRepository.updateRequestStatus(r.id, s);
      setReal(await localRepository.listRequests());
    } else setDemo(demo.map((x) => (x.id === r.id ? { ...x, status: s } : x)));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
        <p className="text-mute">
          <strong className="text-white">Aperçu de l&apos;espace administrateur.</strong> Dans la version finale : connexion sécurisée, gestion des jeux et tarifs, disponibilités, et notifications. Ici, les demandes envoyées depuis ce navigateur apparaissent en haut.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {(Object.keys(STATUS) as RequestStatus[]).map((s) => (
          <div key={s} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-display text-3xl font-bold">{all.filter((r) => r.status === s).length}</p>
            <p className="text-xs text-mute">{STATUS[s].label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-8 flex items-center gap-2 text-xl font-semibold"><Inbox className="size-5" /> Demandes de réservation</h2>
      <ul className="mt-4 space-y-3">
        {all.map((r) => (
          <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-lg font-semibold">{r.booking.fullName} <span className="text-sm font-normal text-mute">· {r.id}</span></p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
            </div>
            <p className="mt-1 text-sm capitalize text-mute">
              {formatDateFr(r.booking.date)} · {r.booking.time} · {r.booking.installType === "domicile" ? `Domicile (${r.booking.zone})` : "À distance"}
            </p>
            <p className="mt-2 text-sm">{r.games.map((g) => g.name).join(", ")} — <strong className="text-lime">{formatFcfa(r.total)}</strong></p>
            <p className="mt-1 text-xs text-mute">PC : {r.pc.cpu || "?"} · {r.pc.ramGb || "?"} Go RAM · {r.pc.gpu || "GPU ?"} · {r.pc.storageGb || "?"} Go libres · Windows {r.pc.windows || "?"}</p>
            {r.status === "en_attente" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => setStatus(r, "confirmee")} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-lime px-4 text-sm font-semibold text-black"><Check className="size-4" /> Confirmer</button>
                <button onClick={() => setStatus(r, "refusee")} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-4 text-sm font-semibold hover:border-danger hover:text-danger"><X className="size-4" /> Refuser</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
