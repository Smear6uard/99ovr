"use client";

import { useEffect, useRef } from "react";
import { POOL } from "@/data/pool";
import { canPick, type ShopDraw } from "@/lib/shop";
import { BUDGET } from "@/lib/sim";
import { TIER_HEX, tierForPrice } from "@/lib/tiers";
import { SLOTS, SLOT_LABELS, type PoolEntry, type SlotId } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function PricePatch({ price, size = "md" }: { price: number; size?: "sm" | "md" }) {
  const hex = TIER_HEX[tierForPrice(price as 1 | 2 | 3 | 4 | 5)];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] font-display text-ink shadow-[inset_0_0_0_1.5px_rgba(11,18,32,0.25)] ${
        size === "md" ? "h-6 w-9 text-[13px]" : "h-5 w-7 text-[11px]"
      }`}
      style={{ background: hex }}
    >
      ${price}
    </span>
  );
}

function OptionCard({
  entry,
  selected,
  affordable,
  onPick,
}: {
  entry: PoolEntry;
  selected: boolean;
  affordable: boolean;
  onPick: () => void;
}) {
  const hex = TIER_HEX[tierForPrice(entry.price)];
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={`flex w-[132px] shrink-0 snap-start flex-col gap-1.5 rounded-lg border bg-panel p-2.5 text-left transition-[border-color,opacity] ${
        selected ? "border-2" : "border-line hover:border-dim"
      } ${affordable || selected ? "" : "opacity-45"}`}
      style={selected ? { borderColor: hex } : undefined}
    >
      <span className="flex items-center justify-between">
        <PricePatch price={entry.price} />
        {selected ? (
          <span className="font-display text-[12px]" style={{ color: hex }}>
            ✓
          </span>
        ) : null}
      </span>
      <span className="text-[13px] font-bold leading-tight">{entry.name}</span>
      <span className="text-[10.5px] leading-snug text-dim">{entry.blurb}</span>
      {entry.tags?.length ? (
        <span className="mt-auto pt-0.5 text-[8.5px] font-semibold tracking-[0.14em] text-gold/80">
          {entry.tags.map((t) => t.toUpperCase()).join(" · ")}
        </span>
      ) : null}
    </button>
  );
}

/**
 * The shop: six slots, five options each (one per price tier), one re-roll
 * per slot, $15 to spend. Budget bar stays sticky; a pick that would strand
 * a slot below $1 shakes the bar instead of opening anything.
 */
export function ShopPhase({
  draw,
  picks,
  rerolled,
  spend,
  shakeNonce,
  onPick,
  onReroll,
  onComplete,
}: {
  draw: ShopDraw;
  picks: Partial<Record<SlotId, number>>;
  rerolled: SlotId[];
  spend: number;
  shakeNonce: number;
  onPick: (slot: SlotId, poolIdx: number) => void;
  onReroll: (slot: SlotId) => void;
  onComplete: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const left = BUDGET - spend;
  const filled = SLOTS.filter((s) => picks[s] !== undefined).length;
  const complete = filled === SLOTS.length;
  const barRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<SlotId, HTMLElement>());
  const prevFilled = useRef(filled);

  // shake the budget bar on rejected picks
  useEffect(() => {
    if (!shakeNonce || !barRef.current) return;
    const el = barRef.current;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }, [shakeNonce]);

  // auto-advance to the next unfilled slot after a successful pick
  useEffect(() => {
    if (filled <= prevFilled.current) {
      prevFilled.current = filled;
      return;
    }
    prevFilled.current = filled;
    const next = SLOTS.find((s) => picks[s] === undefined);
    if (!next) return;
    const t = setTimeout(() => {
      sectionRefs.current.get(next)?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    }, 140);
    return () => clearTimeout(t);
  }, [filled, picks, reduced]);

  return (
    <div>
      {/* Sticky budget bar */}
      <div ref={barRef} className="sticky top-0 z-30 -mx-4 border-b border-line bg-ink/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[9px] font-bold tracking-[0.22em] text-dim">BUDGET LEFT</span>
            <span className={`font-display text-4xl leading-none ${left === 0 ? "text-dim" : "text-gold"}`}>
              ${left}
            </span>
          </div>
          <div className="pb-0.5 text-right">
            <span className="block text-[9px] font-bold tracking-[0.22em] text-dim">SLOTS</span>
            <span className="font-display text-2xl leading-none text-paper">
              {filled}
              <span className="text-dim">/6</span>
            </span>
          </div>
        </div>
        <div className="mt-2 flex gap-[3px]" aria-hidden>
          {Array.from({ length: BUDGET }, (_, i) => (
            <span
              key={i}
              className="h-[5px] flex-1 rounded-full"
              style={{ background: i < spend ? "#f2b94b" : "#26314b" }}
            />
          ))}
        </div>
      </div>

      {/* Slots */}
      <div className="mt-4 space-y-6">
        {SLOTS.map((slot) => {
          const pickedIdx = picks[slot];
          const picked = pickedIdx !== undefined ? POOL[slot][pickedIdx] : null;
          const used = rerolled.includes(slot);
          return (
            <section
              key={slot}
              ref={(el) => {
                if (el) sectionRefs.current.set(slot, el);
              }}
              className="scroll-mt-24"
              aria-label={SLOT_LABELS[slot]}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg uppercase tracking-wide">
                  {SLOT_LABELS[slot]}
                  {picked ? (
                    <span className="ml-2 text-[13px] normal-case tracking-normal text-gold">{picked.name}</span>
                  ) : null}
                </h2>
                <button
                  type="button"
                  onClick={() => onReroll(slot)}
                  disabled={used}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] transition-colors ${
                    used
                      ? "cursor-not-allowed border-line/60 text-dim/60"
                      : "border-line text-dim hover:border-gold hover:text-gold"
                  }`}
                >
                  {used ? "REROLLED" : "↻ REROLL"}
                </button>
              </div>
              <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
                {draw[slot].map((poolIdx) => {
                  const entry = POOL[slot][poolIdx];
                  const selected = pickedIdx === poolIdx;
                  const affordable = canPick(picks, slot, entry.price).ok;
                  return (
                    <OptionCard
                      key={entry.id}
                      entry={entry}
                      selected={selected}
                      affordable={affordable}
                      onPick={() => onPick(slot, poolIdx)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      {complete ? (
        <div className="fade-up sticky bottom-3 z-30 mt-6">
          {left > 0 ? (
            <p className="mb-1.5 text-center text-[11px] text-dim">
              ${left} unspent — it doesn&apos;t roll over.
            </p>
          ) : null}
          <button
            type="button"
            onClick={onComplete}
            className="w-full rounded-lg bg-gold py-3.5 font-display text-xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
          >
            Choose your flaw →
          </button>
        </div>
      ) : (
        <div className="mt-6 h-[52px]" aria-hidden />
      )}
    </div>
  );
}
