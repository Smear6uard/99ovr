import { POOL } from "@/data/pool";
import { FLAWS } from "@/data/flaws";
import { fnv1a, mulberry32, shuffle } from "@/lib/rng";
import { SLOTS, type Price, type SlotId } from "@/lib/types";
import { BUDGET } from "@/lib/sim";

export const PRICE_ORDER: Price[] = [5, 4, 3, 2, 1];

/** Pool indices of the 5 options (one per tier, $5→$1) shown for a slot. */
export type ShopDraw = Record<SlotId, number[]>;

/** Seeded per-tier permutations for a slot — the whole draw derives from these. */
function tierPerms(seed: number, slot: SlotId): number[][] {
  const rng = mulberry32(fnv1a(`shop:${seed}:${slot}`));
  return PRICE_ORDER.map((price) => {
    const tier = POOL[slot].map((_, i) => i).filter((i) => POOL[slot][i].price === price);
    return shuffle(rng, tier);
  });
}

/**
 * Seeded shop draw: one option per price tier per slot. A re-rolled slot
 * takes the *next* entry in each tier's seeded permutation, so a re-roll
 * always yields five fresh options and stays fully deterministic.
 */
export function drawShop(seed: number, rerolled: SlotId[]): ShopDraw {
  const draw = {} as ShopDraw;
  for (const slot of SLOTS) {
    const perms = tierPerms(seed, slot);
    const take = rerolled.includes(slot) ? 1 : 0;
    draw[slot] = perms.map((perm) => perm[Math.min(take, perm.length - 1)]);
  }
  return draw;
}

/**
 * Every pool index a player could legitimately have picked for this slot on
 * this seed (initial draw + the one re-roll). Server-side anti-cheat for
 * daily submissions: codes with unreachable picks are rejected.
 */
export function reachablePicks(seed: number, slot: SlotId): number[] {
  return tierPerms(seed, slot).flatMap((perm) => perm.slice(0, 2));
}

/** The 3 flaw options (indices into FLAWS) offered for a given shop seed. */
export function drawFlaws(seed: number): number[] {
  const rng = mulberry32(fnv1a(`flaws:${seed}`));
  return shuffle(rng, FLAWS.map((_, i) => i)).slice(0, 3);
}

/**
 * Budget guard: a pick is legal only if, after buying it, every unfilled
 * slot can still afford at least $1. Replacing a pick refunds it first.
 */
export function canPick(
  picks: Partial<Record<SlotId, number>>,
  slot: SlotId,
  price: number
): { ok: boolean; reason?: string } {
  let spent = 0;
  let filled = 0;
  for (const s of SLOTS) {
    if (s === slot) continue;
    const idx = picks[s];
    if (idx !== undefined) {
      spent += POOL[s][idx].price;
      filled++;
    }
  }
  const unfilledOthers = SLOTS.length - 1 - filled;
  const left = BUDGET - spent - price;
  if (left < 0) return { ok: false, reason: "Over budget." };
  if (left < unfilledOthers) return { ok: false, reason: `That leaves you short — ${unfilledOthers} more slot${unfilledOthers === 1 ? "" : "s"} need at least $1 each.` };
  return { ok: true };
}

export function spendOf(picks: Partial<Record<SlotId, number>>): number {
  let spent = 0;
  for (const s of SLOTS) {
    const idx = picks[s];
    if (idx !== undefined) spent += POOL[s][idx].price;
  }
  return spent;
}
