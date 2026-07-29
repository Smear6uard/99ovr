import { decadeTag } from "@/data/eras/authoring";
import { POSITION_POOLS, POS_DECADES } from "@/data/positions";
import { fnv1a, mulberry32, shuffle, type Rng } from "@/lib/rng";
import {
  POSITION_LABELS,
  type EraBucket,
  type EraPlayer,
  type EraVibe,
  type Position,
} from "@/lib/types";

/**
 * The positional wheel (v5, target ≠ ALL): no franchises — each round lands on
 * a DECADE of the build's position ("90s CENTERS") and deals a seeded 12 from
 * that decade's position pool. The two re-spin skips become decade re-spins.
 * Everything here is pure and seeded; validation replays it byte-for-byte.
 */

/** The two skips, as decade re-spins. */
export const POS_TOKENS = 2;
/** Per-round slots: the landing plus up to two re-spins. */
export const MAX_POS_SPINS = 2;
/** Every landing deals this many players. */
export const POS_DRAW = 12;

/** "90s CENTERS" */
export function posPoolLabel(decade: number, pos: Position): string {
  return `${decadeTag(decade)} ${POSITION_LABELS[pos]}S`;
}

/**
 * Landing weights: the 60s and 70s together land ~20% of the time — the
 * hard-mode spins. Everything 80s+ splits the rest evenly.
 */
const DECADE_WEIGHTS: ReadonlyArray<readonly [number, number]> = [
  [1960, 10],
  [1970, 10],
  [1980, 16],
  [1990, 16],
  [2000, 16],
  [2010, 16],
  [2020, 16],
];
const WEIGHT_TOTAL = DECADE_WEIGHTS.reduce((acc, [, w]) => acc + w, 0);

function weightedDecade(rng: Rng): number {
  let roll = rng() * WEIGHT_TOTAL;
  for (const [decade, weight] of DECADE_WEIGHTS) {
    roll -= weight;
    if (roll < 0) return decade;
  }
  return DECADE_WEIGHTS[DECADE_WEIGHTS.length - 1][0];
}

const slotsCache = new Map<string, [number, number, number]>();

/** One round's decade sequence — landing plus two re-spins, never back-to-back repeats. */
export function posDecadeSlots(seed: number, round: number): [number, number, number] {
  const key = `${seed}:${round}`;
  const hit = slotsCache.get(key);
  if (hit) return hit;
  const rng = mulberry32(fnv1a(`poswheel:${seed}:${round}`));
  const slots: number[] = [];
  while (slots.length < 3) {
    const decade = weightedDecade(rng);
    if (decade !== slots[slots.length - 1]) slots.push(decade);
  }
  const out = slots as [number, number, number];
  slotsCache.set(key, out);
  return out;
}

export function posDecadeAt(seed: number, round: number, t: number): number {
  return posDecadeSlots(seed, round)[Math.min(t, MAX_POS_SPINS)];
}

/** Cheapest re-spin count that lands this round on this decade, or null. */
export function minSpinsForPosDecade(seed: number, round: number, decade: number): number | null {
  const slots = posDecadeSlots(seed, round);
  const at = slots.indexOf(decade);
  return at === -1 ? null : at;
}

/** The seeded 12 dealt for one landing. Depends on the frozen pool order. */
export function drawnPosPool(seed: number, round: number, decade: number, pos: Position): EraPlayer[] {
  const pool = POSITION_POOLS[decade]?.[pos] ?? [];
  const rng = mulberry32(fnv1a(`posdraw:${seed}:${round}:${decade}:${pos}`));
  return shuffle(rng, pool).slice(0, POS_DRAW);
}

/**
 * The groan/jackpot read: how strong this dozen actually is at the round's
 * attribute. Landing a bad decade for the current skill is the intended womp.
 */
export function posVibe(players: EraPlayer[], attrIdx: number): EraVibe {
  if (players.length === 0) return "solid";
  const avg = players.reduce((acc, p) => acc + p.r[attrIdx], 0) / players.length;
  if (avg >= 72) return "iconic";
  if (avg <= 58) return "rough";
  return "solid";
}

const POS_TAGS: Record<number, string> = {
  1960: "Set shots and sky hooks. Hard mode — respect your elders.",
  1970: "The ABA blood transfusion. Hard mode — afros and fundamentals.",
  1980: "Showtime pace, midrange gold, no three-point line worth mentioning.",
  1990: "Hand-check era. Buckets were a contact sport.",
  2000: "Iso midrange and defense-first bigs.",
  2010: "Pace and space. Everyone on the perimeter can shoot.",
  2020: "Peak skill. Even the seven-footers have a pull-up.",
};

/** The synthesized bucket for one positional landing — same shape the rest of the game eats. */
export function posBucketAt(seed: number, round: number, t: number, pos: Position): EraBucket {
  const decade = posDecadeAt(seed, round, t);
  return posBucketFor(seed, round, decade, pos);
}

export function posBucketFor(seed: number, round: number, decade: number, pos: Position): EraBucket {
  const players = drawnPosPool(seed, round, decade, pos);
  return {
    id: `pos:${decade}:${pos}:${round}`,
    franchise: `pos-${pos}`,
    team: `${POSITION_LABELS[pos]}S`,
    season: decadeTag(decade),
    label: posPoolLabel(decade, pos),
    decade,
    vibe: posVibe(players, round),
    tag: POS_TAGS[decade] ?? "",
    players,
  };
}
