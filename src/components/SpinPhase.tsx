"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { POOL } from "@/data/pool";
import { canPick, type ShopDraw } from "@/lib/shop";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { TIER_HEX, tierForPrice } from "@/lib/tiers";
import { SLOTS, SLOT_LABELS, type PoolEntry, type Price, type SlotId } from "@/lib/types";

type PackState = "sealed" | "ripping" | "open";

function PriceTag({ price }: { price: number }) {
  return <span className="inline-flex h-6 w-9 items-center justify-center rounded-[4px] font-display text-[13px] text-ink" style={{ background: TIER_HEX[tierForPrice(price as Price)] }}>${price}</span>;
}

function StatStrip({ stats }: { stats: string[] }) {
  return (
    <span className="mt-auto grid grid-cols-2 border-t border-line pt-2 font-mono text-[9px] font-bold uppercase leading-tight text-paper/75">
      {stats.map((stat) => <span key={stat}>{stat}</span>)}
    </span>
  );
}

function PlayerCard({ entry, locked, knowledge, index, onPick }: { entry: PoolEntry; locked: boolean; knowledge: boolean; index: number; onPick: () => void }) {
  const hex = TIER_HEX[tierForPrice(entry.price)];
  return (
    <div className="pack-card shrink-0 snap-center" style={{ animationDelay: `${index * 65}ms`, "--tier": hex } as React.CSSProperties}>
      <button type="button" onClick={onPick} className={`relative flex min-h-[150px] w-[138px] flex-col gap-2 overflow-hidden rounded-xl border bg-panel p-3 pt-4 text-left transition-transform active:scale-[0.98] ${locked ? "border-line opacity-40" : "border-line hover:border-dim"}`}>
        <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: hex }} />
        <span className="flex items-center justify-between"><PriceTag price={entry.price} />{locked ? <span className="text-[9px] font-bold tracking-widest text-loss">LOCKED</span> : null}</span>
        <span className="font-display text-[15px] uppercase leading-none tracking-wide text-paper">{entry.name}</span>
        {!knowledge ? <StatStrip stats={entry.stats} /> : null}
      </button>
    </div>
  );
}

export function SpinPhase({ draw, picks, rerolled, spend, budget, knowledge, shakeNonce, onPick, onReroll, onRevise, onComplete }: {
  draw: ShopDraw;
  picks: Partial<Record<SlotId, number>>;
  rerolled: SlotId[];
  spend: number;
  budget: number;
  knowledge: boolean;
  shakeNonce: number;
  onPick: (slot: SlotId, poolIdx: number) => void;
  onReroll: (slot: SlotId) => void;
  onRevise: (slot: SlotId) => void;
  onComplete: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const filled = SLOTS.filter((slot) => picks[slot] !== undefined).length;
  const cursor = SLOTS.find((slot) => picks[slot] === undefined) ?? null;
  const [pack, setPack] = useState<PackState>("sealed");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const header = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setPack("sealed");
    if (timer.current) clearTimeout(timer.current);
  }, [cursor, rerolled.length]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!shakeNonce || !header.current) return;
    header.current.classList.remove("shake");
    void header.current.offsetWidth;
    header.current.classList.add("shake");
  }, [shakeNonce]);

  const rip = () => {
    if (pack !== "sealed") return;
    if (reduced) return setPack("open");
    setPack("ripping");
    timer.current = setTimeout(() => setPack("open"), 480);
  };

  return (
    <div>
      <div ref={header} className="sticky top-0 z-30 -mx-4 border-b border-line bg-ink/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-end justify-between gap-3">
          <div><span className="block text-[9px] font-bold tracking-[0.22em] text-dim">BUDGET LEFT</span><span className={`font-display text-4xl leading-none ${budget - spend ? "text-gold" : "text-dim"}`}>${budget - spend}</span></div>
          <div className="flex items-center gap-1 pb-1" aria-label={`${filled} of 8 slots filled`}>
            {SLOTS.map((slot) => <span key={slot} className={`h-2 w-2 rounded-full ${picks[slot] !== undefined ? "bg-gold" : slot === cursor ? "border-2 border-gold pulse-soft" : "bg-line"}`} />)}
          </div>
        </div>
        {filled ? <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto">{SLOTS.filter((slot) => picks[slot] !== undefined).map((slot) => <button key={slot} type="button" onClick={() => onRevise(slot)} className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-paper hover:border-gold">{POOL[slot][picks[slot]!].name}</button>)}</div> : null}
      </div>

      {!cursor ? (
        <div className="flex min-h-[52vh] flex-col justify-center text-center">
          <span className="text-[10px] font-bold tracking-[0.28em] text-dim">BUILD COMPLETE</span>
          <h2 className="mt-1 font-display text-4xl uppercase text-paper">Eight slots locked</h2>
          <p className="mt-2 text-[12px] text-dim">{budget - spend ? `$${budget - spend} left on the table.` : "Every dollar spent."}</p>
          <button type="button" onClick={onComplete} className="mt-8 w-full rounded-xl bg-gold py-4 font-display text-2xl uppercase tracking-wide text-ink">Run the gauntlet</button>
        </div>
      ) : (
        <section className="flex min-h-[64vh] flex-col pt-5">
          <div className="text-center"><span className="text-[10px] font-bold tracking-[0.3em] text-gold/80">PACK {SLOTS.indexOf(cursor) + 1} / 8 · {SLOT_LABELS[cursor].toUpperCase()}</span><h2 className="mt-1 font-display text-[40px] uppercase leading-none text-paper">{pack === "open" ? "Draft one" : SLOT_LABELS[cursor]}</h2></div>
          <div className="flex flex-1 items-center justify-center py-8">
            {pack === "open" ? <p className="fade-up text-center text-[12px] text-dim">Five cards revealed. Pick your price.</p> : (
              <button type="button" onClick={rip} disabled={pack === "ripping"} aria-label={`Rip ${SLOT_LABELS[cursor]} pack`} className={`pack-shell relative h-52 w-40 rounded-xl border-2 border-gold bg-panel2 shadow-[0_14px_40px_rgba(242,185,75,.2)] ${pack === "ripping" ? "is-ripping" : ""}`}>
                <span className="absolute inset-2 rounded-lg border border-dashed border-gold/50" />
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-display text-4xl uppercase text-gold">99<br />OVR</span>
                <span className="absolute inset-x-0 bottom-4 text-[9px] font-bold tracking-[.25em] text-dim">5-CARD PACK</span>
              </button>
            )}
          </div>
          <div className="mt-auto pb-2">
            {pack === "open" ? <>
              <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1">
                {draw[cursor].map((poolIdx, index) => <PlayerCard key={POOL[cursor][poolIdx].id} entry={POOL[cursor][poolIdx]} locked={!canPick(picks, cursor, POOL[cursor][poolIdx].price, budget).ok} knowledge={knowledge} index={index} onPick={() => onPick(cursor, poolIdx)} />)}
              </div>
              <div className="mt-3 text-center">{rerolled.includes(cursor) ? <span className="text-[11px] font-semibold tracking-widest text-dim">NEW PACK USED</span> : <button type="button" onClick={() => onReroll(cursor)} className="rounded-full border border-line px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-dim hover:border-gold hover:text-gold">NEW PACK (1 LEFT)</button>}</div>
            </> : <button type="button" onClick={rip} disabled={pack === "ripping"} className="w-full rounded-xl bg-gold py-4 font-display text-3xl uppercase tracking-[0.1em] text-ink">{pack === "ripping" ? "Ripping…" : "Rip pack"}</button>}
          </div>
        </section>
      )}
    </div>
  );
}
