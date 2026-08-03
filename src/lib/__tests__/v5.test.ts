import { describe, expect, it } from "vitest";
import { BUCKETS, FRANCHISES } from "@/data/eras";
import { DECADE_BUCKETS, DECADE_FRANCHISES } from "@/data/eras/decades";
import { DECADE_ROSTER_SUPPLEMENTS } from "@/data/eras/decade-rosters.generated";
import { FLAWS } from "@/data/flaws";
import { POSITION_POOLS, POS_DECADES } from "@/data/positions";
import { dailyNumberFor, dailySeed, dailyTargetFor, utcDateString } from "@/lib/daily";
import { decodeSteal, encodeSteal } from "@/lib/encode";
import { validateDailySubmission } from "@/lib/leaderboard";
import {
  LEGACY_POS_TOKENS,
  POS_DRAW,
  POS_TOKENS,
  drawnPosPool,
  minSpinsForPosDecade,
  posBucketFor,
  posDecadeSlots,
  posTokensFor,
} from "@/lib/poswheel";
import { mulberry32 } from "@/lib/rng";
import {
  STEAL_BUDGET,
  STEAL_BUDGET_V4,
  canAffordSteal,
  flawRefundFor,
  isPositional,
  priceIn,
  simulateSteals,
  stealBudgetFor,
  validateSteals,
} from "@/lib/steal";
import { DECADE_POOL, ROUNDS, bucketIndexAt, respinBucketIndex } from "@/lib/wheel";
import { ATTRS, POSITIONS, type Position, type StealBuild } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* The decade pool (v5 classic wheel)                                  */
/* ------------------------------------------------------------------ */

describe("decade pool", () => {
  it("keeps every franchise and enough of them for the wheel", () => {
    expect(DECADE_FRANCHISES.length).toBe(FRANCHISES.length);
    expect(DECADE_FRANCHISES.length).toBeGreaterThanOrEqual(24);
  });

  it("merges each franchise-decade once, players deduped by person", () => {
    const keys = new Set(DECADE_BUCKETS.map((b) => `${b.franchise}:${b.decade}`));
    expect(keys.size).toBe(DECADE_BUCKETS.length);
    for (const bucket of DECADE_BUCKETS) {
      const people = bucket.players.map((p) => p.person);
      expect(new Set(people).size, bucket.id).toBe(people.length);
      expect(bucket.players.length, bucket.id).toBeGreaterThanOrEqual(10);
      expect(bucket.players.length, bucket.id).toBeLessThanOrEqual(256);
    }
  });

  it("covers every era-pool player-person inside its decade bucket", () => {
    for (const era of BUCKETS) {
      const merged = DECADE_BUCKETS.find((b) => b.franchise === era.franchise && b.decade === era.decade)!;
      const people = new Set(merged.players.map((p) => p.person));
      for (const player of era.players) expect(people.has(player.person), `${era.id}:${player.person}`).toBe(true);
    }
  });

  it("covers every historical player-person in each published franchise-decade", () => {
    for (const [key, sourcePlayers] of Object.entries(DECADE_ROSTER_SUPPLEMENTS)) {
      const [franchise, decadeText] = key.split(":");
      const bucket = DECADE_BUCKETS.find(
        (candidate) => candidate.franchise === franchise && candidate.decade === Number(decadeText)
      );
      expect(bucket, key).toBeTruthy();
      const people = new Set(bucket!.players.map((player) => player.person));
      for (const player of sourcePlayers) {
        expect(people.has(player.person), `${key}:${player.name}`).toBe(true);
      }
    }
  });

  it("makes the 00s Nuggets an all-decade roster instead of the 2003 snapshot", () => {
    const nuggets = DECADE_BUCKETS.find((bucket) => bucket.franchise === "nuggets" && bucket.decade === 2000)!;
    const names = new Set(nuggets.players.map((player) => player.name));
    for (const name of ["Carmelo Anthony", "Andre Miller", "Kenyon Martin", "Allen Iverson", "Chauncey Billups"]) {
      expect(names.has(name), name).toBe(true);
    }
    expect(nuggets.players.length).toBeGreaterThan(50);
    expect(nuggets.tag).toMatch(/every nuggets player/i);
  });

  it("keeps the $1 minimum contract on every decade roster", () => {
    for (const bucket of DECADE_BUCKETS) {
      ATTRS.forEach((_a, attrIdx) => {
        const prices = bucket.players.map((_p, i) => priceIn(bucket, attrIdx, i));
        expect(Math.min(...prices), `${bucket.id} attr ${attrIdx}`).toBe(1);
      });
    }
  });

  it("labels buckets by decade, not year", () => {
    for (const bucket of DECADE_BUCKETS) expect(bucket.label).toMatch(/^\d0s /);
  });
});

/* ------------------------------------------------------------------ */
/* v5 economy                                                          */
/* ------------------------------------------------------------------ */

describe("v5 budget economy", () => {
  it("drops the wallet to $15 while v4 codes keep $20", () => {
    expect(STEAL_BUDGET).toBe(15);
    expect(stealBudgetFor(5)).toBe(15);
    expect(stealBudgetFor(4)).toBe(STEAL_BUDGET_V4);
    expect(stealBudgetFor(3)).toBe(20);
  });

  it("pays $1–$3 by severity, worse always paying at least as much", () => {
    const bySeverity = { Mild: 1, Bad: 2, Brutal: 3, "Career-Threatening": 3 } as const;
    for (const flaw of FLAWS) expect(flaw.refund, flaw.id).toBe(bySeverity[flaw.severity]);
  });

  it("freezes the old refund scale for v4 codes", () => {
    const v4Scale = { Mild: 0, Bad: 1, Brutal: 2, "Career-Threatening": 3 } as const;
    for (const flaw of FLAWS) {
      expect(flawRefundFor(flaw, 4), flaw.id).toBe(v4Scale[flaw.severity]);
      expect(flawRefundFor(flaw, 5), flaw.id).toBe(flaw.refund);
    }
  });
});

/* ------------------------------------------------------------------ */
/* v5 classic builds                                                   */
/* ------------------------------------------------------------------ */

function v5Classic(seed: number): StealBuild {
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0, DECADE_POOL);
    const bucket = DECADE_POOL.buckets[bucketIdx];
    const pick = bucket.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !taken.has(player.person))
      .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
    taken.add(pick.player.person);
    steals.push([bucketIdx, pick.index]);
  }
  return { v: 5, mode: "classic", seed, flaw: -1, target: "ALL", steals, attempt: 0, daily: 0, knowledge: false };
}

describe("v5 classic", () => {
  it("re-spins exactly one visible axis", () => {
    for (let seed = 1; seed <= 100; seed++) {
      for (let round = 0; round < ROUNDS; round++) {
        const initialIdx = bucketIndexAt(seed, round, 0, 0, DECADE_POOL);
        const initial = DECADE_POOL.buckets[initialIdx];
        const team = DECADE_POOL.buckets[respinBucketIndex(seed, round, initialIdx, "team", DECADE_POOL)];
        expect(team.franchise).not.toBe(initial.franchise);
        expect(team.decade).toBe(initial.decade);

        const decadeIdx = respinBucketIndex(seed, round, initialIdx, "era", DECADE_POOL);
        const decade = DECADE_POOL.buckets[decadeIdx];
        if (decadeIdx !== initialIdx) {
          expect(decade.franchise).toBe(initial.franchise);
          expect(decade.decade).not.toBe(initial.decade);
        }
      }
    }
  });

  it("validates, simulates, and round-trips through the code", () => {
    const build = v5Classic(0xdecade);
    expect(validateSteals(build)).toBe(true);
    const result = simulateSteals(build)!;
    expect(result.derived.ovr).toBeGreaterThanOrEqual(40);
    const code = encodeSteal(build);
    const decoded = decodeSteal(code)!;
    expect(decoded.v).toBe(5);
    expect(decoded).toEqual(build);
  });

  it("keeps v5 and v4 in separate namespaces — same bytes, different pools", () => {
    const build = v5Classic(0xdecade);
    const asV4: StealBuild = { ...build, v: 4 };
    // the steal indices target the decade pool; on the era pool they mean
    // something else entirely, so at minimum the two decode as distinct builds
    expect(decodeSteal(encodeSteal(build))!.v).toBe(5);
    expect(encodeSteal(build)).not.toBe(encodeSteal(asV4));
  });
});

/* ------------------------------------------------------------------ */
/* Positional decade wheel                                             */
/* ------------------------------------------------------------------ */

describe("position pools", () => {
  it("carries a full pool for every decade and position", () => {
    for (const decade of POS_DECADES) {
      for (const pos of POSITIONS) {
        const pool = POSITION_POOLS[decade][pos];
        const floor = decade <= 1970 ? 12 : 25;
        expect(pool.length, `${decade} ${pos}`).toBeGreaterThanOrEqual(floor);
        const people = pool.map((p) => p.person);
        expect(new Set(people).size, `${decade} ${pos}`).toBe(people.length);
        for (const p of pool) for (const r of p.r) expect(r, `${p.id}`).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("has era texture — old bigs can't shoot, modern ones can", () => {
    const avgJumper = (decade: number) => {
      const pool = POSITION_POOLS[decade].C;
      return pool.reduce((a, p) => a + p.r[0], 0) / pool.length;
    };
    expect(avgJumper(1960)).toBeLessThan(avgJumper(2020) - 8);
    // the 70s had genuine shooting bigs (McAdoo, Cowens, Issel) — smaller gap
    expect(avgJumper(1970)).toBeLessThan(avgJumper(2020) - 3);
  });
});

describe("positional wheel", () => {
  it("lands the 60s and 70s roughly a fifth of the time", () => {
    let old = 0;
    let total = 0;
    for (let seed = 1; seed <= 120; seed++) {
      for (let round = 0; round < ROUNDS; round++) {
        const slots = posDecadeSlots(seed, round);
        for (const d of slots) {
          total++;
          if (d <= 1970) old++;
        }
      }
    }
    const share = old / total;
    expect(share).toBeGreaterThan(0.1);
    expect(share).toBeLessThan(0.32);
  });

  it("never repeats a decade back-to-back within a round's slots", () => {
    for (let seed = 1; seed <= 60; seed++) {
      for (let round = 0; round < ROUNDS; round++) {
        const [a, b, c] = posDecadeSlots(seed, round);
        expect(a).not.toBe(b);
        expect(b).not.toBe(c);
        expect(minSpinsForPosDecade(seed, round, a)).toBe(0);
      }
    }
  });

  it("deals a deterministic twelve", () => {
    const a = drawnPosPool(777, 2, 1990, "C");
    const b = drawnPosPool(777, 2, 1990, "C");
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(a.length).toBe(POS_DRAW);
    const bucket = posBucketFor(777, 2, 1990, "C");
    expect(bucket.players.map((p) => p.id)).toEqual(a.map((p) => p.id));
    expect(bucket.label).toBe("90s CENTERS");
  });
});

function v5Positional(seed: number, target: Position, opts: Partial<StealBuild> = {}): StealBuild {
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    const decade = posDecadeSlots(seed, round)[0];
    const drawn = drawnPosPool(seed, round, decade, target);
    const pick = drawn
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !taken.has(player.person))
      .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
    taken.add(pick.player.person);
    steals.push([POS_DECADES.indexOf(decade as (typeof POS_DECADES)[number]), pick.index]);
  }
  return {
    v: 5, mode: "classic", seed, flaw: -1, target, steals, attempt: 0, daily: 0, knowledge: false,
    ...opts,
  };
}

describe("positional runs", () => {
  it("validates, simulates against the dealt twelve, and round-trips", () => {
    const rng = mulberry32(0x505);
    for (const target of POSITIONS) {
      const seed = Math.floor(rng() * 0xffffffff) >>> 0;
      const build = v5Positional(seed, target);
      expect(isPositional(build)).toBe(true);
      expect(validateSteals(build), `${target} seed ${seed}`).toBe(true);
      const result = simulateSteals(build)!;
      expect(result.steals.every((s) => s.bucket.players.length === POS_DRAW)).toBe(true);
      expect(result.steals.every((s) => s.bucket.label.endsWith("S"))).toBe(true);
      expect(decodeSteal(encodeSteal(build))).toEqual(build);
    }
  });

  it("gives v6 one positional re-spin without invalidating v5 two-spin codes", () => {
    expect(POS_TOKENS).toBe(1);
    expect(LEGACY_POS_TOKENS).toBe(2);
    expect(posTokensFor(5)).toBe(2);
    expect(posTokensFor(6)).toBe(1);

    const seed = 0x606;
    const build = v5Positional(seed, "PG");
    const respun: StealBuild = { ...build, steals: build.steals.map((pair) => [...pair] as [number, number]) };
    const personAt = (candidate: StealBuild, round: number) =>
      drawnPosPool(candidate.seed, round, POS_DECADES[candidate.steals[round][0]], "PG")[candidate.steals[round][1]].person;
    for (const round of [0, 1]) {
      const decade = posDecadeSlots(seed, round)[1];
      const otherPeople = new Set(respun.steals.map((_pair, otherRound) =>
        otherRound === round ? "" : personAt(respun, otherRound)
      ));
      const drawn = drawnPosPool(seed, round, decade, "PG");
      const playerIdx = drawn.findIndex((player) => !otherPeople.has(player.person));
      respun.steals[round] = [POS_DECADES.indexOf(decade as (typeof POS_DECADES)[number]), playerIdx];
    }

    expect(validateSteals(respun)).toBe(true);
    const current: StealBuild = { ...respun, v: 6 };
    expect(validateSteals(current)).toBe(false);

    const legalCurrent: StealBuild = { ...v5Positional(seed, "PG"), v: 6 };
    expect(validateSteals(legalCurrent)).toBe(true);
    expect(decodeSteal(encodeSteal(legalCurrent))).toEqual(legalCurrent);
  });

  it("rejects out-of-draw picks, unreachable decades, and over-budget re-spins", () => {
    const build = v5Positional(0xabc, "PG");
    expect(validateSteals({ ...build, steals: build.steals.map((s, i) => (i === 0 ? [s[0], POS_DRAW] : s)) as Array<[number, number]> })).toBe(false);
    // a decade today's three slots never offered
    const slots = posDecadeSlots(0xabc, 0);
    const outside = POS_DECADES.findIndex((d) => !slots.includes(d));
    expect(outside).toBeGreaterThanOrEqual(0);
    expect(validateSteals({ ...build, steals: build.steals.map((s, i) => (i === 0 ? [outside, 0] : s)) as Array<[number, number]> })).toBe(false);
    // spending three re-spins when the game grants two: move rounds 0-2 to slot 1
    const personAt = (b: StealBuild, round: number) =>
      drawnPosPool(b.seed, round, POS_DECADES[b.steals[round][0]], "PG")[b.steals[round][1]].person;
    const overspent: StealBuild = { ...build, steals: build.steals.map((s) => [...s] as [number, number]) };
    for (const round of [0, 1, 2]) {
      const decade = posDecadeSlots(0xabc, round)[1];
      const others = new Set(overspent.steals.map((_s, r) => (r === round ? "" : personAt(overspent, r))));
      const drawn = drawnPosPool(0xabc, round, decade, "PG");
      const idx = drawn.findIndex((p) => !others.has(p.person));
      expect(idx).toBeGreaterThanOrEqual(0);
      overspent.steals[round] = [POS_DECADES.indexOf(decade as (typeof POS_DECADES)[number]), idx];
    }
    expect(validateSteals(overspent)).toBe(false);
  });

  it("supports budget positional runs with the $15 wallet", () => {
    const seed = 0x7e57;
    const target: Position = "C";
    const taken = new Set<string>();
    const steals: Array<[number, number]> = [];
    let spent = 0;
    const flaw = 0;
    const refund = FLAWS[flaw].refund;
    for (let round = 0; round < ROUNDS; round++) {
      const decade = posDecadeSlots(seed, round)[0];
      const bucket = posBucketFor(seed, round, decade, target);
      const pick = bucket.players
        .map((player, index) => ({ player, index, price: priceIn(bucket, round, index) }))
        .filter(({ player }) => !taken.has(player.person))
        .filter(({ price }) => canAffordSteal(spent, price, round, refund))
        .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
      taken.add(pick.player.person);
      spent += pick.price;
      steals.push([POS_DECADES.indexOf(decade as (typeof POS_DECADES)[number]), pick.index]);
    }
    const build: StealBuild = { v: 5, mode: "budget", seed, flaw, target, steals, attempt: 0, daily: 0, knowledge: false };
    expect(validateSteals(build)).toBe(true);
    const result = simulateSteals(build)!;
    expect(result.spent).toBe(spent);
    expect(result.spent).toBeLessThanOrEqual(STEAL_BUDGET + result.refund);
  });
});

/* ------------------------------------------------------------------ */
/* Positional dailies                                                  */
/* ------------------------------------------------------------------ */

describe("positional dailies", () => {
  it("decides the target from the date, deterministically, mostly ALL", () => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 300; i++) {
      const d = new Date(Date.UTC(2026, 7, 1) + i * 86_400_000).toISOString().slice(0, 10);
      const t = dailyTargetFor(d);
      expect(dailyTargetFor(d)).toBe(t);
      counts[t] = (counts[t] ?? 0) + 1;
    }
    expect(counts.ALL).toBeGreaterThan(150);
    expect(Object.keys(counts).length).toBeGreaterThan(3);
  });

  it("gates the leaderboard on the day's target", () => {
    // find one ALL day and one positional day
    let allDay = "";
    let posDay = "";
    for (let i = 0; i < 60 && (!allDay || !posDay); i++) {
      const d = new Date(Date.UTC(2026, 7, 1) + i * 86_400_000).toISOString().slice(0, 10);
      if (dailyTargetFor(d) === "ALL") allDay = allDay || d;
      else posDay = posDay || d;
    }
    expect(allDay && posDay).toBeTruthy();

    const posTarget = dailyTargetFor(posDay) as Position;
    const official = v5Positional(dailySeed(posDay), posTarget, {
      mode: "daily",
      daily: dailyNumberFor(posDay),
    });
    expect(validateDailySubmission(official, posDay)).toBeNull();
    // an ALL run submitted on a positional day is refused
    const wrong = { ...official, target: "ALL" } as StealBuild;
    expect(validateDailySubmission(wrong, posDay)).toBeTruthy();
    expect(utcDateString(new Date(Date.UTC(2026, 7, 1)))).toBe("2026-08-01");
  });
});
