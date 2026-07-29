"use client";

import { useEffect, useRef, useState } from "react";
import { FLAWS } from "@/data/flaws";
import { flawHint } from "@/lib/flawHint";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { wildFor } from "@/lib/wheel";

type Reel = "idle" | "spinning" | "landed";

/**
 * Fate wheel: a circular dial spins, decelerates and settles with a "clunk" —
 * the shop's reel scrolls names vertically, this one spins in a circle, on
 * purpose. Either way the motion is pure cosmetics: the 3 revealed flaws are
 * always `choices` (the seeded `drawFlaws` result), never derived from where
 * the dial stops.
 */
function FlawWheel({ spinning }: { spinning: boolean }) {
  return (
    <div aria-hidden className="relative h-[196px] w-[196px]">
      {/* Fixed pointer — does not rotate with the dial */}
      <div className="absolute left-1/2 top-[-2px] z-10 -translate-x-1/2">
        <span
          className={`block h-0 w-0 border-x-[7px] border-t-[11px] border-x-transparent border-t-gold drop-shadow-[0_0_5px_rgba(242,185,75,0.55)] ${
            spinning ? "" : "pulse-soft"
          }`}
        />
      </div>

      {/* Spinning dial: alternating wedges + thin red spoke ticks */}
      <div
        className={`h-full w-full rounded-full border-2 border-line shadow-[inset_0_0_0_5px_rgba(11,18,32,0.5),0_10px_28px_rgba(0,0,0,0.35)] ${
          spinning ? "wheel-spin" : ""
        }`}
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg, var(--color-loss) 0deg 0.5deg, transparent 0.5deg 30deg), repeating-conic-gradient(from 0deg, var(--color-panel) 0deg 30deg, var(--color-panel2) 30deg 60deg)",
        }}
      >
        {/* Hub */}
        <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink shadow-[0_0_0_4px_rgba(11,18,32,0.85)]">
          <span className="font-display text-2xl leading-none text-loss">!</span>
        </div>
      </div>
    </div>
  );
}

/** Six Steals pays severity in re-spins; Budget Ball still pays it in dollars. */
export type FlawEconomy = "steal" | "budget";

function payoff(flawIdx: number, economy: FlawEconomy): string {
  const flaw = FLAWS[flawIdx];
  if (economy === "budget") return ` · +$${flaw.refund} BUDGET`;
  const wild = wildFor(flaw.severity);
  return wild ? ` · +${wild} RE-SPIN${wild === 1 ? "" : "S"}` : " · NO RE-SPINS";
}

/** One landed flaw option: name, desc, and its power-mechanics tag. */
function FlawCard({
  flawIdx,
  isSel,
  index,
  economy,
  onPick,
}: {
  flawIdx: number;
  isSel: boolean;
  index: number;
  economy: FlawEconomy;
  onPick: () => void;
}) {
  const flaw = FLAWS[flawIdx];
  return (
    <div className="deal-in" style={{ animationDelay: `${index * 70}ms` }}>
      <button
        type="button"
        onClick={onPick}
        aria-pressed={isSel}
        className={`w-full rounded-lg border bg-panel p-4 text-left transition-colors ${
          isSel ? "border-2 border-loss" : "border-line hover:border-dim"
        }`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-xl uppercase leading-tight text-paper">{flaw.name}</span>
          {isSel ? <span className="font-display text-loss">✓</span> : null}
        </span>
        <span className="mt-1 block text-[13px] text-dim">{flaw.desc}</span>
        <span className="mt-2 inline-block rounded-sm border border-loss/50 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-loss">
          {flawHint(flaw).toUpperCase()}
        </span>
        <span className="ml-2 mt-2 inline-block rounded-sm border border-gold/60 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-gold">
          {flaw.severity.toUpperCase()}
          {payoff(flawIdx, economy)}
        </span>
      </button>
    </div>
  );
}

/**
 * Spin → Choose, for the flaw. Same reel-state machine as SpinPhase (tap SPIN,
 * ~1s of motion, land on the seeded options) but the wheel spins in a circle
 * instead of scrolling vertically — a mandatory, fated draw rather than a shop
 * shelf. Landed always reveals `FLAWS[choices[i]]`; the dial itself never picks.
 */
export function FlawSpin({
  choices,
  selected,
  economy = "steal",
  onSelect,
  onAccept,
}: {
  choices: number[];
  selected: number | null;
  economy?: FlawEconomy;
  onSelect: (flawIdx: number) => void;
  onAccept: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [reel, setReel] = useState<Reel>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const spin = () => {
    if (reel !== "idle") return;
    if (reduced) {
      setReel("landed");
      return;
    }
    setReel("spinning");
    timerRef.current = setTimeout(() => setReel("landed"), 1000);
  };

  return (
    <div className="flex min-h-[64vh] flex-col pt-2">
      <div className="mt-3 text-center">
        <span className="block text-[10px] font-bold tracking-[0.3em] text-loss/80">
          {economy === "budget" ? "MID-RUN BREAK · THE WEAKNESS WHEEL" : "STEP 1 · PICK YOUR POISON"}
        </span>
        <h1 className="mt-1 font-display text-4xl uppercase leading-[0.92] text-paper">
          {reel === "landed" ? (
            "Pick one"
          ) : (
            <>
              Every legend
              <br />
              has one
            </>
          )}
        </h1>
        {economy === "budget" && reel !== "landed" ? (
          <p className="mx-auto mt-2 max-w-[19rem] text-[12px] leading-snug text-dim">
            Three steals down, three to go. Take a weakness — the worse it is, the more budget it refunds for the
            back half.
          </p>
        ) : null}
      </div>

      {/* Stage */}
      <div className="flex flex-1 flex-col items-center justify-center py-6">
        {reel === "landed" ? (
          <p className="fade-up text-center text-[12px] text-dim">
            Landed 3 — tap one to accept it
            <span aria-hidden className="mt-1 block text-loss">
              ↓
            </span>
          </p>
        ) : (
          <FlawWheel spinning={reel === "spinning" && !reduced} />
        )}
      </div>

      {/* Action zone (thumb reach) */}
      <div className="mt-auto pb-2">
        {reel === "landed" ? (
          <>
            <div className="space-y-3">
              {choices.map((flawIdx, i) => (
                <FlawCard
                  key={FLAWS[flawIdx].id}
                  flawIdx={flawIdx}
                  isSel={selected === flawIdx}
                  index={i}
                  economy={economy}
                  onPick={() => onSelect(flawIdx)}
                />
              ))}
            </div>

            <div className="sticky bottom-3 z-30 mt-6" style={{ minHeight: 58 }}>
              {selected !== null ? (
                <button
                  type="button"
                  onClick={onAccept}
                  className="fade-up w-full rounded-lg bg-gold py-3.5 font-display text-xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
                >
                  {economy === "budget" ? "Take the flaw & the cash" : "Take flaw & build"}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={spin}
              disabled={reel === "spinning"}
              className={`w-full rounded-xl py-4 font-display text-3xl uppercase tracking-[0.1em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:scale-[0.98] ${
                reel === "spinning" ? "pulse-soft cursor-default bg-gold/70" : "bg-gold"
              }`}
            >
              {reel === "spinning" ? "Spinning…" : "Spin"}
            </button>
            <p className="mt-2 text-center text-[11px] text-dim">
              {reel === "spinning"
                ? "Three flaws incoming. You still choose."
                : economy === "budget"
                  ? "Worse flaws refund more budget. Risk pays cash."
                  : "Worse flaws buy extra re-spins. Risk buys options."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
