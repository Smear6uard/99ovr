import { BUCKETS, FRANCHISES } from "@/data/eras";
import { DECADE_BUCKETS, DECADE_FRANCHISES } from "@/data/eras/decades";
import { fnv1a, mulberry32, shuffle } from "@/lib/rng";
import { ATTRS, type EraBucket, type Flaw, type FlawSeverity, type Franchise } from "@/lib/types";

/** One round per attribute. */
export const ROUNDS = ATTRS.length;

/**
 * Which bucket table a build's indices point into. v3/v4 codes address the
 * year-era pool; v5 codes address the decade pool. Both are frozen — a code's
 * pool is part of its meaning.
 */
export type WheelPool = { id: string; buckets: EraBucket[]; franchises: Franchise[] };
export const ERA_POOL: WheelPool = { id: "eras", buckets: BUCKETS, franchises: FRANCHISES };
export const DECADE_POOL: WheelPool = { id: "decades", buckets: DECADE_BUCKETS, franchises: DECADE_FRANCHISES };
export const poolFor = (v: number): WheelPool => (v >= 5 ? DECADE_POOL : ERA_POOL);

/**
 * Franchise slots reserved per round: the base landing plus MAX_TEAM_SPINS
 * alternatives. With 6 rounds that addresses `6 * 4 = 24` franchise slots, and
 * the pool carries 27 — so no two rounds can ever collide on a franchise,
 * whatever the re-spin usage.
 */
const SLOTS_PER_ROUND = 4;
export const MAX_TEAM_SPINS = SLOTS_PER_ROUND - 1;
/** Era re-spins rotate within a franchise, so the cap is just the token cap. */
export const MAX_ERA_SPINS = 3;

const orderCache = new Map<string, number[]>();

/** Seeded permutation of franchise indices. The whole wheel derives from this. */
export function franchiseOrder(seed: number, pool: WheelPool = ERA_POOL): number[] {
  const key = `${pool.id}:${seed}`;
  const hit = orderCache.get(key);
  if (hit) return hit;
  const order = shuffle(
    mulberry32(fnv1a(`wheel:${seed}`)),
    pool.franchises.map((_, index) => index)
  );
  orderCache.set(key, order);
  return order;
}

/** Franchise index for a round after `t` team re-spins. */
export function franchiseAt(seed: number, round: number, t: number, pool: WheelPool = ERA_POOL): number {
  const order = franchiseOrder(seed, pool);
  return order[(round * SLOTS_PER_ROUND + t) % order.length];
}

/** Seeded era rotation within one franchise — this is what the era token walks. */
export function eraOrder(seed: number, franchiseIdx: number, pool: WheelPool = ERA_POOL): number[] {
  const franchise = pool.franchises[franchiseIdx];
  return shuffle(mulberry32(fnv1a(`era:${seed}:${franchise.id}`)), franchise.eras);
}

/** The landed bucket index for (round, team re-spins, era re-spins). Pure. */
export function bucketIndexAt(seed: number, round: number, t: number, e: number, pool: WheelPool = ERA_POOL): number {
  const order = eraOrder(seed, franchiseAt(seed, round, t, pool), pool);
  return order[e % order.length];
}

export function bucketAt(seed: number, round: number, t: number, e: number, pool: WheelPool = ERA_POOL): EraBucket {
  return pool.buckets[bucketIndexAt(seed, round, t, e, pool)];
}

/** How many distinct eras the current franchise has — 1 means the era token is dead here. */
export function eraCountAt(seed: number, round: number, t: number, pool: WheelPool = ERA_POOL): number {
  return pool.franchises[franchiseAt(seed, round, t, pool)].eras.length;
}

/* ------------------------------------------------------------------ */
/* Re-spin tokens                                                      */
/* ------------------------------------------------------------------ */

export type Tokens = { team: number; era: number; wild: number };
export type SpinsUsed = { team: number; era: number };

/** Flaw severity buys wild tokens — spendable as either kind. */
export function wildFor(severity: FlawSeverity): number {
  if (severity === "Career-Threatening") return 2;
  if (severity === "Brutal") return 1;
  return 0;
}

export function tokensFor(flaw: Flaw): Tokens {
  return { team: 1, era: 1, wild: wildFor(flaw.severity) };
}

/**
 * v4 economy: every run gets exactly one team re-spin and one era re-spin.
 * Flaw severity pays cash (Budget) instead of wild re-spins.
 */
export const V4_TOKENS: Tokens = { team: 1, era: 1, wild: 0 };

/** Wild tokens not yet consumed covering overflow on either kind. */
export function wildLeft(tokens: Tokens, used: SpinsUsed): number {
  return tokens.wild - Math.max(0, used.team - tokens.team) - Math.max(0, used.era - tokens.era);
}

export function canRespin(kind: "team" | "era", tokens: Tokens, used: SpinsUsed): boolean {
  if (used[kind] >= (kind === "team" ? MAX_TEAM_SPINS : MAX_ERA_SPINS)) return false;
  return used[kind] < tokens[kind] || wildLeft(tokens, used) > 0;
}

/** Header counter: total re-spins of any kind still affordable. */
export function totalRespinsLeft(tokens: Tokens, used: SpinsUsed): number {
  return (
    Math.max(0, tokens.team - used.team) +
    Math.max(0, tokens.era - used.era) +
    Math.max(0, wildLeft(tokens, used))
  );
}

/** Display counter: how many more re-spins of this kind are affordable. */
export function respinsLeft(kind: "team" | "era", tokens: Tokens, used: SpinsUsed): number {
  const cap = kind === "team" ? MAX_TEAM_SPINS : MAX_ERA_SPINS;
  const dedicated = Math.max(0, tokens[kind] - used[kind]);
  return Math.min(cap - used[kind], dedicated + wildLeft(tokens, used));
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

/**
 * The cheapest (team, era) re-spin pair that lands this round on this bucket,
 * or null if the bucket was unreachable. Server-side anti-cheat starts here.
 */
export function minSpinsFor(seed: number, round: number, bucketIdx: number, pool: WheelPool = ERA_POOL): SpinsUsed | null {
  for (let total = 0; total <= MAX_TEAM_SPINS + MAX_ERA_SPINS; total++) {
    for (let team = 0; team <= Math.min(total, MAX_TEAM_SPINS); team++) {
      const era = total - team;
      if (era > MAX_ERA_SPINS) continue;
      if (bucketIndexAt(seed, round, team, era, pool) === bucketIdx) return { team, era };
    }
  }
  return null;
}

/** Does this set of landings fit inside the run's token budget? */
export function spinsAffordable(used: SpinsUsed, tokens: Tokens): boolean {
  return Math.max(0, used.team - tokens.team) + Math.max(0, used.era - tokens.era) <= tokens.wild;
}

/** Every bucket index a player could legitimately have landed on this round. */
export function reachableBuckets(seed: number, round: number, tokens: Tokens, pool: WheelPool = ERA_POOL): number[] {
  const maxTeam = Math.min(MAX_TEAM_SPINS, tokens.team + tokens.wild);
  const maxEra = Math.min(MAX_ERA_SPINS, tokens.era + tokens.wild);
  const out = new Set<number>();
  for (let team = 0; team <= maxTeam; team++) {
    for (let era = 0; era <= maxEra; era++) {
      if (!spinsAffordable({ team, era }, tokens)) continue;
      out.add(bucketIndexAt(seed, round, team, era, pool));
    }
  }
  return [...out];
}
