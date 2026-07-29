import { BUCKETS, FRANCHISES } from "@/data/eras";
import { fnv1a, mulberry32, shuffle } from "@/lib/rng";
import { ATTRS, type EraBucket, type Flaw, type FlawSeverity } from "@/lib/types";

/** One round per attribute. */
export const ROUNDS = ATTRS.length;

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

const orderCache = new Map<number, number[]>();

/** Seeded permutation of franchise indices. The whole wheel derives from this. */
export function franchiseOrder(seed: number): number[] {
  const hit = orderCache.get(seed);
  if (hit) return hit;
  const order = shuffle(
    mulberry32(fnv1a(`wheel:${seed}`)),
    FRANCHISES.map((_, index) => index)
  );
  orderCache.set(seed, order);
  return order;
}

/** Franchise index for a round after `t` team re-spins. */
export function franchiseAt(seed: number, round: number, t: number): number {
  const order = franchiseOrder(seed);
  return order[(round * SLOTS_PER_ROUND + t) % order.length];
}

/** Seeded era rotation within one franchise — this is what the era token walks. */
export function eraOrder(seed: number, franchiseIdx: number): number[] {
  const franchise = FRANCHISES[franchiseIdx];
  return shuffle(mulberry32(fnv1a(`era:${seed}:${franchise.id}`)), franchise.eras);
}

/** The landed bucket index for (round, team re-spins, era re-spins). Pure. */
export function bucketIndexAt(seed: number, round: number, t: number, e: number): number {
  const order = eraOrder(seed, franchiseAt(seed, round, t));
  return order[e % order.length];
}

export function bucketAt(seed: number, round: number, t: number, e: number): EraBucket {
  return BUCKETS[bucketIndexAt(seed, round, t, e)];
}

/** How many distinct eras the current franchise has — 1 means the era token is dead here. */
export function eraCountAt(seed: number, round: number, t: number): number {
  return FRANCHISES[franchiseAt(seed, round, t)].eras.length;
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
export function minSpinsFor(seed: number, round: number, bucketIdx: number): SpinsUsed | null {
  for (let total = 0; total <= MAX_TEAM_SPINS + MAX_ERA_SPINS; total++) {
    for (let team = 0; team <= Math.min(total, MAX_TEAM_SPINS); team++) {
      const era = total - team;
      if (era > MAX_ERA_SPINS) continue;
      if (bucketIndexAt(seed, round, team, era) === bucketIdx) return { team, era };
    }
  }
  return null;
}

/** Does this set of landings fit inside the run's token budget? */
export function spinsAffordable(used: SpinsUsed, tokens: Tokens): boolean {
  return Math.max(0, used.team - tokens.team) + Math.max(0, used.era - tokens.era) <= tokens.wild;
}

/** Every bucket index a player could legitimately have landed on this round. */
export function reachableBuckets(seed: number, round: number, tokens: Tokens): number[] {
  const maxTeam = Math.min(MAX_TEAM_SPINS, tokens.team + tokens.wild);
  const maxEra = Math.min(MAX_ERA_SPINS, tokens.era + tokens.wild);
  const out = new Set<number>();
  for (let team = 0; team <= maxTeam; team++) {
    for (let era = 0; era <= maxEra; era++) {
      if (!spinsAffordable({ team, era }, tokens)) continue;
      out.add(bucketIndexAt(seed, round, team, era));
    }
  }
  return [...out];
}
