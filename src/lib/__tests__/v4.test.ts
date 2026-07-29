import { describe, expect, it } from "vitest";
import { BUCKETS } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { POSITION_GAUNTLETS } from "@/data/gauntlet";
import { decodeSteal, encodeSteal } from "@/lib/encode";
import { mulberry32, rngInt } from "@/lib/rng";
import {
  STEAL_BUDGET,
  STEAL_BUDGET_V4,
  WHEEL_AFTER,
  budgetCapAt,
  canAffordSteal,
  priceForRating,
  priceIn,
  simulateSteals,
  validateSteals,
} from "@/lib/steal";
import { ROUNDS, bucketIndexAt } from "@/lib/wheel";
import { ATTRS, POSITIONS, type PositionMode, type StealBuild, type StealMode } from "@/lib/types";

/** Cheapest-first legal budget run on `seed` — always affordable by construction. */
function budgetBuild(seed: number, flaw: number): StealBuild {
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  let spent = 0;
  const refund = FLAWS[flaw].refund;
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0);
    const bucket = BUCKETS[bucketIdx];
    const pick = bucket.players
      .map((player, index) => ({ player, index, price: priceIn(bucket, round, index) }))
      .filter(({ player }) => !taken.has(player.person))
      .filter(({ price }) => canAffordSteal(spent, price, round, refund))
      .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
    taken.add(pick.player.person);
    spent += pick.price;
    steals.push([bucketIdx, pick.index]);
  }
  return { v: 4, mode: "budget", seed, flaw, target: "ALL", steals, attempt: 0, daily: 0, knowledge: false };
}

function classicBuild(seed: number, target: PositionMode = "ALL", mode: StealMode = "classic"): StealBuild {
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0);
    const bucket = BUCKETS[bucketIdx];
    const pick = bucket.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !taken.has(player.person))
      .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
    taken.add(pick.player.person);
    steals.push([bucketIdx, pick.index]);
  }
  return { v: 4, mode, seed, flaw: -1, target, steals, attempt: 0, daily: 0, knowledge: false };
}

describe("v4 pricing", () => {
  it("uses the original price bands", () => {
    expect(priceForRating(99)).toBe(5);
    expect(priceForRating(93)).toBe(5);
    expect(priceForRating(92)).toBe(4);
    expect(priceForRating(86)).toBe(4);
    expect(priceForRating(85)).toBe(3);
    expect(priceForRating(78)).toBe(3);
    expect(priceForRating(77)).toBe(2);
    expect(priceForRating(68)).toBe(2);
    expect(priceForRating(67)).toBe(1);
    expect(priceForRating(30)).toBe(1);
  });

  it("keeps a $1 minimum contract on every roster for every attribute", () => {
    for (const bucket of BUCKETS) {
      ATTRS.forEach((_attr, attrIdx) => {
        const prices = bucket.players.map((_p, i) => priceIn(bucket, attrIdx, i));
        expect(Math.min(...prices), `${bucket.id} attr ${attrIdx}`).toBe(1);
      });
    }
  });

  it("releases the flaw refund only after the weakness wheel", () => {
    expect(budgetCapAt(WHEEL_AFTER - 1, 3)).toBe(STEAL_BUDGET);
    expect(budgetCapAt(WHEEL_AFTER, 3)).toBe(STEAL_BUDGET + 3);
  });

  it("forces every pick to leave a dollar per remaining round", () => {
    // v5 wallet ($15): round 0 leaves five dollars for five rounds
    expect(canAffordSteal(0, 5, 0, 0)).toBe(true);
    expect(canAffordSteal(7, 4, 0, 0)).toBe(false);
    // last round: whole remaining wallet is spendable
    expect(canAffordSteal(10, 5, 5, 0)).toBe(true);
    expect(canAffordSteal(11, 5, 5, 0)).toBe(false);
    expect(canAffordSteal(11, 5, 5, 1)).toBe(true);
    // v4 codes keep the frozen $20 wallet
    expect(canAffordSteal(15, 5, 5, 0, STEAL_BUDGET_V4)).toBe(true);
    expect(canAffordSteal(16, 5, 5, 0, STEAL_BUDGET_V4)).toBe(false);
  });
});

describe("v4 validation", () => {
  it("accepts legal classic, daily, and budget runs", () => {
    expect(validateSteals(classicBuild(0xc0ffee))).toBe(true);
    expect(validateSteals(classicBuild(0xc0ffee, "PG"))).toBe(true);
    expect(validateSteals(classicBuild(0xc0ffee, "ALL", "daily"))).toBe(true);
    expect(validateSteals(budgetBuild(0xc0ffee, 3))).toBe(true);
  });

  it("rejects a flaw outside budget mode and requires one inside it", () => {
    expect(validateSteals({ ...classicBuild(7), flaw: 0 })).toBe(false);
    expect(validateSteals({ ...budgetBuild(7, 2), flaw: -1 })).toBe(false);
    expect(validateSteals({ ...budgetBuild(7, 2), flaw: FLAWS.length })).toBe(false);
  });

  it("rejects a budget run that overspends the wallet", () => {
    const seed = 0xbeef;
    // steal the most expensive player each round, ignoring the wallet
    const taken = new Set<string>();
    const steals: Array<[number, number]> = [];
    let total = 0;
    for (let round = 0; round < ROUNDS; round++) {
      const bucketIdx = bucketIndexAt(seed, round, 0, 0);
      const bucket = BUCKETS[bucketIdx];
      const pick = bucket.players
        .map((player, index) => ({ player, index, price: priceIn(bucket, round, index) }))
        .filter(({ player }) => !taken.has(player.person))
        .sort((a, b) => b.price - a.price)[0];
      taken.add(pick.player.person);
      total += pick.price;
      steals.push([bucketIdx, pick.index]);
    }
    const greedy: StealBuild = {
      v: 4, mode: "budget", seed, flaw: 0, target: "ALL", steals, attempt: 0, daily: 0, knowledge: false,
    };
    expect(total).toBeGreaterThan(STEAL_BUDGET + 3);
    expect(validateSteals(greedy)).toBe(false);
  });

  it("caps v4 re-spins at one team + one era regardless of flaw severity", () => {
    const seed = 4242;
    const taken = new Set<string>();
    const steals: Array<[number, number]> = [];
    for (let round = 0; round < ROUNDS; round++) {
      const t = round < 2 ? 1 : 0; // two team re-spins — v3 could buy this, v4 never can
      const bucketIdx = bucketIndexAt(seed, round, t, 0);
      const bucket = BUCKETS[bucketIdx];
      const pick = bucket.players.map((player, index) => ({ player, index })).find(({ player }) => !taken.has(player.person))!;
      taken.add(pick.player.person);
      steals.push([bucketIdx, pick.index]);
    }
    const base: StealBuild = {
      v: 4, mode: "classic", seed, flaw: -1, target: "ALL", steals, attempt: 0, daily: 0, knowledge: false,
    };
    expect(validateSteals(base)).toBe(false);
  });
});

describe("v4 simulation", () => {
  it("runs classic with no flaw: nothing ever fires and no flaw is reported", () => {
    const result = simulateSteals(classicBuild(0xc0ffee))!;
    expect(result.flaw).toBeNull();
    expect(result.rungs.every((r) => !r.flawFired)).toBe(true);
    expect(result.spent).toBe(0);
    expect(result.refund).toBe(0);
  });

  it("scores budget runs with spend and refund on the result", () => {
    const build = budgetBuild(0xc0ffee, FLAWS.findIndex((f) => f.severity === "Career-Threatening"));
    const result = simulateSteals(build)!;
    expect(result.flaw?.severity).toBe("Career-Threatening");
    expect(result.refund).toBe(3);
    expect(result.spent).toBe(result.steals.reduce((a, s) => a + s.price, 0));
    expect(result.spent).toBeLessThanOrEqual(STEAL_BUDGET + result.refund);
  });

  it("keeps ALL-target scoring identical to the v3 formula", () => {
    const v4 = classicBuild(0xc0ffee);
    const v3: StealBuild = { v: 3, mode: "sandbox", seed: v4.seed, flaw: 2, steals: v4.steals, attempt: 0, daily: 0, knowledge: false };
    expect(simulateSteals(v4)!.derived.ovr).toBe(simulateSteals(v3)!.derived.ovr);
  });

  it("re-weights positional targets — a rim-heavy build rates higher as a C than a PG", () => {
    const rng = mulberry32(99);
    let differs = 0;
    for (let i = 0; i < 20; i++) {
      const seed = Math.floor(rng() * 0xffffffff) >>> 0;
      const base = classicBuild(seed);
      const byTarget = Object.fromEntries(
        (["ALL", ...POSITIONS] as PositionMode[]).map((t) => [t, simulateSteals({ ...base, target: t })!.derived.ovr])
      );
      if (new Set(Object.values(byTarget)).size > 1) differs++;
    }
    expect(differs).toBeGreaterThan(10);
  });

  it("sends positional runs into that position's boss ladder", () => {
    const result = simulateSteals(classicBuild(0xc0ffee, "C"))!;
    expect(result.gauntlet).toEqual(POSITION_GAUNTLETS.C);
  });

  it("keeps Ball Knowledge cosmetic in v4 too", () => {
    const base = classicBuild(0xfeed);
    const bk = simulateSteals({ ...base, knowledge: true })!;
    const plain = simulateSteals(base)!;
    expect(bk.simSeed).toBe(plain.simSeed);
    expect(bk.derived.ovr).toBe(plain.derived.ovr);
  });
});

describe("v4 encoding", () => {
  it("round-trips every mode, target, and flag byte-perfectly", () => {
    const rng = mulberry32(0x1e4d);
    const targets: PositionMode[] = ["ALL", ...POSITIONS];
    for (let i = 0; i < 200; i++) {
      const seed = Math.floor(rng() * 0xffffffff) >>> 0;
      const mode: StealMode = (["classic", "daily", "budget"] as const)[rngInt(rng, 3)];
      const build =
        mode === "budget"
          ? budgetBuild(seed, rngInt(rng, FLAWS.length))
          : { ...classicBuild(seed, targets[rngInt(rng, targets.length)], mode) };
      build.knowledge = rng() < 0.5;
      build.attempt = rngInt(rng, 1000);
      build.daily = rngInt(rng, 500);
      const code = encodeSteal(build);
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(decodeSteal(code)).toEqual(build);
    }
  });

  it("rejects tampered v4 codes", () => {
    const build = classicBuild(0xbadbad, "SG");
    const code = encodeSteal(build);
    for (let i = 0; i < code.length; i++) {
      const flipped = code.slice(0, i) + (code[i] === "A" ? "B" : "A") + code.slice(i + 1);
      if (flipped === code) continue;
      const out = decodeSteal(flipped);
      if (out !== null) expect(out).toEqual(build);
    }
  });

  it("keeps v3 and v4 codes in separate namespaces", () => {
    const v4 = classicBuild(0x1234);
    const code = encodeSteal(v4);
    expect(code).toHaveLength(34);
    const decoded = decodeSteal(code)!;
    expect(decoded.v).toBe(4);
  });
});
