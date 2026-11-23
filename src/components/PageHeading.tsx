export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="relative border-b border-line/70">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-5xl">{title}</h1>
        {children && <p className="mt-3 max-w-2xl text-mute">{children}</p>}
      </div>
    </div>
  );
}

const STEPS = ["Choisir les jeux", "Compatibilité", "Réservation"];

export function Steps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="mx-auto mt-6 flex max-w-7xl flex-wrap gap-2 px-4 text-xs sm:px-6" aria-label="Étapes">
      {STEPS.map((s, i) => (
        <li
          key={s}
          className={`rounded-full border px-3 py-1.5 font-semibold ${
            i === current ? "border-violet bg-violet/15 text-white" : i < current ? "border-lime/40 text-lime" : "border-line text-mute"
          }`}
        >
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  );
}
