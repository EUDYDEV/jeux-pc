"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GAMES } from "@/data/games";
import type { BookingDraft, Game, PcSpecs } from "@/lib/types";

export const EMPTY_PC: PcSpecs = { cpu: "", ramGb: "", gpu: "", gpuTier: "", storageGb: "", windows: "" };
export const EMPTY_BOOKING: BookingDraft = {
  fullName: "",
  whatsapp: "",
  installType: "domicile",
  date: "",
  time: "",
  zone: "",
  notes: "",
};

interface Ctx {
  ready: boolean;
  quantities: Record<string, number>;
  games: { game: Game; qty: number }[];
  count: number;
  total: number;
  has: (id: string) => boolean;
  add: (id: string) => void;
  toggle: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  pc: PcSpecs;
  setPc: (p: PcSpecs) => void;
  booking: BookingDraft;
  setBooking: (b: BookingDraft) => void;
}

const SelectionContext = createContext<Ctx | null>(null);
const STORE = "pixeldock.state.v1";

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pc, setPc] = useState<PcSpecs>(EMPTY_PC);
  const [booking, setBooking] = useState<BookingDraft>(EMPTY_BOOKING);

  // Hydratation depuis localStorage (après le premier rendu pour éviter les écarts SSR)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.quantities) setQuantities(s.quantities);
        if (s.pc) setPc({ ...EMPTY_PC, ...s.pc });
        if (s.booking) setBooking({ ...EMPTY_BOOKING, ...s.booking });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ quantities, pc, booking }));
    } catch {
      /* ignore */
    }
  }, [ready, quantities, pc, booking]);

  const add = useCallback((id: string) => setQuantities((q) => (q[id] ? q : { ...q, [id]: 1 })), []);
  const remove = useCallback(
    (id: string) =>
      setQuantities((q) => {
        const { [id]: _removed, ...rest } = q;
        void _removed;
        return rest;
      }),
    [],
  );
  const toggle = useCallback(
    (id: string) =>
      setQuantities((q) => {
        if (q[id]) {
          const { [id]: _removed, ...rest } = q;
          void _removed;
          return rest;
        }
        return { ...q, [id]: 1 };
      }),
    [],
  );
  const setQty = useCallback(
    (id: string, qty: number) => setQuantities((q) => ({ ...q, [id]: Math.min(5, Math.max(1, qty)) })),
    [],
  );
  const clear = useCallback(() => setQuantities({}), []);

  const value = useMemo<Ctx>(() => {
    const games = GAMES.filter((g) => quantities[g.id]).map((game) => ({ game, qty: quantities[game.id] }));
    return {
      ready,
      quantities,
      games,
      count: games.length,
      total: games.reduce((s, x) => s + x.game.price * x.qty, 0),
      has: (id) => !!quantities[id],
      add,
      toggle,
      setQty,
      remove,
      clear,
      pc,
      setPc,
      booking,
      setBooking,
    };
  }, [ready, quantities, pc, booking, add, toggle, setQty, remove, clear]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection doit être utilisé dans SelectionProvider");
  return ctx;
}
