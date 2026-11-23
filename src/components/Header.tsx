"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Menu, ShoppingBag, X } from "lucide-react";
import { useSelection } from "@/context/SelectionContext";
import { SITE } from "@/lib/config";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/compatibilite", label: "Compatibilité" },
  { href: "/reservation", label: "Réservation" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { count, ready } = useSelection();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-violet to-cyan text-black">
            <Gamepad2 className="size-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-raised text-white" : "text-mute hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/selection"
            className="relative inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold transition hover:border-violet/60"
            aria-label={`Ma sélection (${ready ? count : 0} jeux)`}
          >
            <ShoppingBag className="size-4 text-violet" aria-hidden />
            <span className="hidden sm:inline">Ma sélection</span>
            <AnimatePresence mode="popLayout">
              {ready && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="grid min-w-5 place-items-center rounded-full bg-lime px-1.5 text-xs font-bold text-black"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            className="grid size-11 place-items-center rounded-xl border border-line lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line lg:hidden"
            aria-label="Navigation mobile"
          >
            <div className="flex flex-col gap-1 p-3">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === n.href ? "bg-raised" : "text-mute"}`}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
