"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { POOL } from "@/data/pool";
import { canPick, type ShopDraw } from "@/lib/shop";
import { BUDGET } from "@/lib/sim";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { TIER_HEX, tierForPrice } from "@/lib/tiers";
import { SLOTS, SLOT_LABELS, type PoolEntry, type Price, type SlotId } from "@/lib/types";

type Reel = "idle" | "spinning" | "landed";

/** Self-contained price patch (kept local rather than shared, now that the old shop phase is gone). */
function PriceTag({ price }: { price: number }) {
  const hex = TIER_HEX[tierForPrice(price as Price)];
  return (
    <span
      className="inline-flex h-6 w-9 shrink-0 items-center justify-center rounded-[4px] font-display text-[13px] text-ink shadow-[inset_0_0_0_1.5px_rgba(11,18,32,0.25)]"
      style={{ background: hex }}
    >
      ${price}
    </span>
  );
}

/** One landed option. Locked (unaffordable) cards grey out but still fire onPick so
 * GameFlow's reject toast explains why — the reason logic stays in one place. */
function SpinCard({
  entry,
  locked,
  knowledge,
  index,
  onPick,
}: {
  entry: PoolEntry;
  locked: boolean;
  knowledge: boolean;
  index: number;
  onPick: () => void;
}) {
  const hex = TIER_HEX[tierForPrice(entry.price)];
  // The deal-in animation lives on the wrapper (it ends at opacity:1 with `both`
  // fill); the greying opacity stays on the button so a locked card holds ~0.45.
  return (
    <div className="deal-in shrink-0 snap-center" style={{ animationDelay: `${index * 55}ms` }}>
      <button
        type="button"
        onClick={onPick}
        className={`relative flex min-h-[152px] w-[136px] flex-col gap-2 overflow-hidden rounded-xl border border-line bg-panel p-3 pt-4 text-left transition-transform active:scale-[0.98] ${
          locked ? "opacity-45" : "hover:border-dim"
        }`}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: hex }} />
        <span className="flex items-center justify-between gap-1">
          <PriceTag price={entry.price} />
          {locked ? (
            <span className="whitespace-nowrap text-[9px] font-bold tracking-[0.14em] text-loss">LOCKED</span>
          ) : null}
        </span>
        <span className="break-words font-display text-[14px] uppercase leading-[1.03] tracking-wide text-paper">
          {entry.name}
        </span>
        {!knowledge ? (
          <>
            <span className="text-[10.5px] leading-snug text-dim">{entry.blurb}</span>
            {entry.tags?.length ? (
              <span className="mt-auto pt-0.5 text-[8.5px] font-semibold tracking-[0.14em] text-gold/80">
                {entry.tags.map((t) => t.toUpperCase()).join(" · ")}
              </span>
            ) : null}
          </>
        ) : null}
      </button>
    </div>
  );
}

/**
 * Spin → Choose builder. Six slots, played one at a time in SLOTS order. Each slot
 * is a slot-machine reel: tap SPIN, names blur past for ~1s, and it lands on the five
 * seeded options (`draw[slot]`) — one per price tier. The reel is purely cosmetic;
 * the cards are ALWAYS `draw[slot]`, so daily seeding, determinism and re-roll are
 * unchanged. Pick an affordable card to lock it and advance; one re-spin per slot.
 */
export function SpinPhase({
  draw,
  picks,
  rerolled,
  spend,
  knowledge,
  shakeNonce,
  onPick,
  onReroll,
  onRevise,
  onComplete,
}: {
  draw: ShopDraw;
  picks: Partial<Record<SlotId, number>>;
  rerolled: SlotId[];
  spend: number;
  knowledge: boolean;
  shakeNonce: number;
  onPick: (slot: SlotId, poolIdx: number) => void;
  onReroll: (slot: SlotId) => void;
  onRevise: (slot: SlotId) => void;
  onComplete: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const left = BUDGET - spend;
  const filled = SLOTS.filter((s) => picks[s] !== undefined).length;
  const complete = filled === SLOTS.length;
  const cursor = SLOTS.find((s) => picks[s] === undefined) ?? null;

  const [reel, setReel] = useState<Reel>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset the reel to idle whenever the active slot changes (advance) or is re-spun.
  // useLayoutEffect (not useEffect) so this runs pre-paint — otherwise the previous
  // slot's landed cards can flash for one frame before the reset is applied.
  useLayoutEffect(() => {
    setReel("idle");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [cursor, rerolled.length]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const spin = () => {
    if (reel !== "idle") return;
    if (reduced) {
      setReel("landed");
      return;
    }
    setReel("spinning");
    timerRef.current = setTimeout(() => setReel("landed"), 1000);
  };

  // Shake the header on a rejected pick (reuse the .shake class pattern).
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!shakeNonce || !headerRef.current) return;
    const el = headerRef.current;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }, [shakeNonce]);

  return (
    <div>
      {/* Persistent header: budget · 6-dot progress · picked chips */}
      <div
        ref={headerRef}
        className="sticky top-0 z-30 -mx-4 border-b border-line bg-ink/95 px-4 py-2.5 backdrop-blur"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="block text-[9px] font-bold tracking-[0.22em] text-dim">BUDGET LEFT</span>
            <span className={`font-display text-4xl leading-none ${left === 0 ? "text-dim" : "text-gold"}`}>
              ${left}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pb-1" aria-label={`${filled} of 6 slots filled`}>
            {SLOTS.map((s) => {
              const isFilled = picks[s] !== undefined;
              const isCurrent = s === cursor;
              return (
                <span
                  key={s}
                  className={`h-2.5 w-2.5 rounded-full ${
                    isFilled
                      ? "bg-gold"
                      : isCurrent
                        ? "border-2 border-gold pulse-soft"
                        : "bg-line"
                  }`}
                />
              );
            })}
          </div>
        </div>
        {filled > 0 ? (
          <div className="mt-2">
            <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
              {SLOTS.filter((s) => picks[s] !== undefined).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onRevise(s)}
                  aria-label={`Change ${SLOT_LABELS[s]} pick — currently ${POOL[s][picks[s]!].name}`}
                  className="shrink-0 rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] font-semibold text-paper/90 transition-colors hover:border-gold hover:text-gold active:scale-[0.97]"
                >
                  {POOL[s][picks[s]!].name}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.08em] text-dim/60">
              Tap a pick to change it
            </p>
          </div>
        ) : null}
      </div>

      {complete ? (
        /* All six locked in → head to the flaw */
        <div className="flex min-h-[52vh] flex-col justify-center">
          <div className="fade-up text-center">
            <span className="block text-[10px] font-bold tracking-[0.28em] text-dim">SQUAD ASSEMBLED</span>
            <h2 className="mt-1 font-display text-4xl uppercase leading-none text-paper">Six slots locked</h2>
            <p className="mt-2 text-[12px] text-dim">
              {left > 0 ? (
                <>
                  ${left} left on the table — it doesn&apos;t roll over.
                </>
              ) : (
                <>Every last dollar spent.</>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="fade-up mt-8 w-full rounded-xl bg-gold py-4 font-display text-2xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
          >
            Choose your flaw →
          </button>
        </div>
      ) : (
        cursor && (
          <ActiveSlot
            slot={cursor}
            slotNo={SLOTS.indexOf(cursor) + 1}
            draw={draw}
            picks={picks}
            rerolled={rerolled}
            knowledge={knowledge}
            reel={reel}
            reduced={reduced}
            onSpin={spin}
            onPick={onPick}
            onReroll={onReroll}
          />
        )
      )}
    </div>
  );
}

function ActiveSlot({
  slot,
  slotNo,
  draw,
  picks,
  rerolled,
  knowledge,
  reel,
  reduced,
  onSpin,
  onPick,
  onReroll,
}: {
  slot: SlotId;
  slotNo: number;
  draw: ShopDraw;
  picks: Partial<Record<SlotId, number>>;
  rerolled: SlotId[];
  knowledge: boolean;
  reel: Reel;
  reduced: boolean;
  onSpin: () => void;
  onPick: (slot: SlotId, poolIdx: number) => void;
  onReroll: (slot: SlotId) => void;
}) {
  // Reel flavor: every name in the slot's pool blurring past. Cosmetic only.
  const reelNames = POOL[slot].map((e) => e.name);
  const strip = [...reelNames, ...reelNames, ...reelNames];
  const idleNames = reelNames.slice(0, 3);

  // The real result: always the seeded draw.
  const cards = draw[slot].map((poolIdx) => ({ poolIdx, entry: POOL[slot][poolIdx] }));
  const rerollUsed = rerolled.includes(slot);
  const fadeMask =
    "linear-gradient(180deg, transparent 0%, #000 24%, #000 76%, transparent 100%)";

  return (
    <div className="flex min-h-[60vh] flex-col pt-5">
      {/* Slot heading */}
      <div className="text-center">
        <span className="block text-[10px] font-bold tracking-[0.3em] text-gold/80">
          SLOT {slotNo} / 6 · {SLOT_LABELS[slot].toUpperCase()}
        </span>
        <h2 className="mt-1 font-display text-[40px] uppercase leading-[0.92] text-paper">
          {reel === "landed" ? "Pick one" : SLOT_LABELS[slot]}
        </h2>
      </div>

      {/* Stage */}
      <div className="flex flex-1 flex-col items-center justify-center py-5">
        {reel === "landed" ? (
          <p className="fade-up text-center text-[12px] text-dim">
            Landed 5 — tap a card to lock it in
            <span aria-hidden className="mt-1 block text-gold">↓</span>
          </p>
        ) : (
          <div className="relative h-[188px] w-full max-w-[300px] overflow-hidden rounded-xl border border-line bg-panel2">
            {/* Names layer (edge-faded) */}
            <div className="absolute inset-0" style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}>
              {reel === "spinning" && !reduced ? (
                <div
                  className="reel-spin will-change-transform"
                  style={{ "--reel-travel": "-1040px" } as React.CSSProperties}
                >
                  {strip.map((name, i) => (
                    <div
                      key={i}
                      className="flex h-[46px] items-center justify-center px-3 font-display text-xl uppercase tracking-wide text-paper/85"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  {idleNames.map((name, i) => (
                    <div
                      key={i}
                      className={`flex h-[46px] items-center justify-center px-3 font-display text-xl uppercase tracking-wide ${
                        i === 1 ? "text-paper" : "text-dim/40"
                      }`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Payline reticle */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center">
              <span aria-hidden className="h-0 w-0 border-y-[6px] border-l-[8px] border-y-transparent border-l-gold" />
              <span
                aria-hidden
                className={`h-[2px] flex-1 bg-gold/70 ${reel === "idle" ? "pulse-soft" : ""}`}
              />
              <span aria-hidden className="h-0 w-0 border-y-[6px] border-r-[8px] border-y-transparent border-r-gold" />
            </div>
          </div>
        )}
      </div>

      {/* Action zone (lower-half thumb reach) */}
      <div className="mt-auto pb-2">
        {reel === "landed" ? (
          <>
            <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1">
              {cards.map(({ poolIdx, entry }, i) => (
                <SpinCard
                  key={entry.id}
                  entry={entry}
                  locked={!canPick(picks, slot, entry.price).ok}
                  knowledge={knowledge}
                  index={i}
                  onPick={() => onPick(slot, poolIdx)}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-center">
              {rerollUsed ? (
                <span className="text-[11px] font-semibold tracking-[0.14em] text-dim/70">
                  RE-SPIN USED
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onReroll(slot)}
                  className="rounded-full border border-line px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-dim transition-colors hover:border-gold hover:text-gold"
                >
                  ↻ RE-SPIN (1 left)
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSpin}
              disabled={reel === "spinning"}
              className={`w-full rounded-xl py-4 font-display text-3xl uppercase tracking-[0.1em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:scale-[0.98] ${
                reel === "spinning" ? "pulse-soft cursor-default bg-gold/70" : "bg-gold"
              }`}
            >
              {reel === "spinning" ? "Spinning…" : "Spin"}
            </button>
            <p className="mt-2 text-center text-[11px] text-dim">
              {reel === "spinning" ? "Reeling in 5 cards…" : "One tap · lands 5 cards, pick one"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
