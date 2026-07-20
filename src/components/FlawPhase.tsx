"use client";

import { FLAWS } from "@/data/flaws";
import { flawHint } from "@/lib/flawHint";

/** Three flaws offered, one mandatory. The fine print is the fun part. */
export function FlawPhase({
  choices,
  selected,
  onSelect,
  onAccept,
  onBack,
}: {
  choices: number[];
  selected: number | null;
  onSelect: (flawIdx: number) => void;
  onAccept: () => void;
  onBack: () => void;
}) {
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onBack}
        className="text-[12px] font-semibold text-dim transition-colors hover:text-paper"
      >
        ← Back to the shop
      </button>
      <h1 className="mt-3 font-display text-3xl uppercase leading-tight">
        Every legend
        <br />
        has one
      </h1>
      <p className="mt-1 text-[13px] text-dim">Take one flaw. It&apos;s free. It isn&apos;t.</p>

      <div className="mt-5 space-y-3">
        {choices.map((flawIdx) => {
          const flaw = FLAWS[flawIdx];
          const isSel = selected === flawIdx;
          return (
            <button
              key={flaw.id}
              type="button"
              onClick={() => onSelect(flawIdx)}
              aria-pressed={isSel}
              className={`w-full rounded-lg border bg-panel p-4 text-left transition-colors ${
                isSel ? "border-2 border-loss" : "border-line hover:border-dim"
              }`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-xl uppercase leading-tight">{flaw.name}</span>
                {isSel ? <span className="font-display text-loss">✓</span> : null}
              </span>
              <span className="mt-1 block text-[13px] text-dim">{flaw.desc}</span>
              <span className="mt-2 inline-block rounded-sm border border-loss/50 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-loss">
                {flawHint(flaw).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-3 z-30 mt-6" style={{ minHeight: 58 }}>
        {selected !== null ? (
          <button
            type="button"
            onClick={onAccept}
            className="fade-up w-full rounded-lg bg-gold py-3.5 font-display text-xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
          >
            Accept & run the gauntlet
          </button>
        ) : null}
      </div>
    </div>
  );
}
