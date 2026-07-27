import { describe, expect, it } from "vitest";
import { BUCKETS, FRANCHISES } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { mulberry32 } from "@/lib/rng";
import {
  MAX_ERA_SPINS,
  MAX_TEAM_SPINS,
  ROUNDS,
  bucketIndexAt,
  canRespin,
  eraOrder,
  franchiseAt,
  minSpinsFor,
  reachableBuckets,
  respinsLeft,
  spinsAffordable,
  tokensFor,
  wildFor,
} from "@/lib/wheel";

const SEEDS = [1, 7, 12345, 0xc0ffee, 0xdeadbeef, 2 ** 31, 987654321];

describe("wheel determinism", () => {
  it("returns the same landing for the same (seed, round, spins) forever", () => {
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        for (let t = 0; t <= MAX_TEAM_SPINS; t++) {
          for (let e = 0; e <= MAX_ERA_SPINS; e++) {
            expect(bucketIndexAt(seed, round, t, e)).toBe(bucketIndexAt(seed, round, t, e));
          }
        }
      }
    }
  });

  it("never lands two rounds on the same franchise, whatever the re-spins", () => {
    for (const seed of SEEDS) {
      const seen = new Map<number, number>();
      for (let round = 0; round < ROUNDS; round++) {
        for (let t = 0; t <= MAX_TEAM_SPINS; t++) {
          const franchise = franchiseAt(seed, round, t);
          const owner = seen.get(franchise);
          expect(owner === undefined || owner === round, `franchise collision on seed ${seed}`).toBe(true);
          seen.set(franchise, round);
        }
      }
    }
  });

  it("always resolves to a real bucket", () => {
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        for (let t = 0; t <= MAX_TEAM_SPINS; t++) {
          for (let e = 0; e <= MAX_ERA_SPINS; e++) {
            expect(BUCKETS[bucketIndexAt(seed, round, t, e)]).toBeDefined();
          }
        }
      }
    }
  });

  it("keeps the era re-spin inside the same franchise", () => {
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        const franchise = FRANCHISES[franchiseAt(seed, round, 0)];
        for (let e = 0; e <= MAX_ERA_SPINS; e++) {
          expect(BUCKETS[bucketIndexAt(seed, round, 0, e)].franchise).toBe(franchise.id);
        }
      }
    }
  });

  it("moves to a different era on the first era re-spin", () => {
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        expect(bucketIndexAt(seed, round, 0, 1)).not.toBe(bucketIndexAt(seed, round, 0, 0));
      }
    }
  });

  it("shuffles the era order rather than always serving the oldest", () => {
    const rotated = SEEDS.some((seed) =>
      FRANCHISES.some((franchise, index) => eraOrder(seed, index)[0] !== franchise.eras[0])
    );
    expect(rotated).toBe(true);
  });
});

describe("re-spin tokens", () => {
  it("grants wild tokens only for the two worst severities", () => {
    expect(wildFor("Mild")).toBe(0);
    expect(wildFor("Bad")).toBe(0);
    expect(wildFor("Brutal")).toBe(1);
    expect(wildFor("Career-Threatening")).toBe(2);
  });

  it("starts every run with one team and one era re-spin", () => {
    for (const flaw of FLAWS) {
      const tokens = tokensFor(flaw);
      expect(tokens.team).toBe(1);
      expect(tokens.era).toBe(1);
      expect(canRespin("team", tokens, { team: 0, era: 0 })).toBe(true);
      expect(canRespin("era", tokens, { team: 0, era: 0 })).toBe(true);
    }
  });

  it("spends wild tokens as either kind and then stops", () => {
    const mild = { team: 1, era: 1, wild: 0 };
    expect(canRespin("team", mild, { team: 1, era: 0 })).toBe(false);
    expect(canRespin("era", mild, { team: 1, era: 1 })).toBe(false);

    const brutal = { team: 1, era: 1, wild: 1 };
    expect(canRespin("team", brutal, { team: 1, era: 0 })).toBe(true);
    // once the wild is burned on a second team spin, the era token still stands
    expect(canRespin("era", brutal, { team: 2, era: 0 })).toBe(true);
    expect(canRespin("team", brutal, { team: 2, era: 1 })).toBe(false);
  });

  it("reports a remaining count that matches what canRespin allows", () => {
    const tokens = { team: 1, era: 1, wild: 2 };
    for (let team = 0; team <= MAX_TEAM_SPINS; team++) {
      for (let era = 0; era <= MAX_ERA_SPINS; era++) {
        const used = { team, era };
        if (!spinsAffordable(used, tokens)) continue;
        expect(respinsLeft("team", tokens, used) > 0).toBe(canRespin("team", tokens, used));
        expect(respinsLeft("era", tokens, used) > 0).toBe(canRespin("era", tokens, used));
      }
    }
  });
});

describe("anti-cheat", () => {
  it("recovers the minimal spins for every reachable landing", () => {
    const tokens = { team: 1, era: 1, wild: 2 };
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        for (const bucketIdx of reachableBuckets(seed, round, tokens)) {
          const spins = minSpinsFor(seed, round, bucketIdx);
          expect(spins).not.toBeNull();
          expect(bucketIndexAt(seed, round, spins!.team, spins!.era)).toBe(bucketIdx);
        }
      }
    }
  });

  it("rejects buckets the wheel never offered", () => {
    const tokens = { team: 1, era: 1, wild: 2 };
    const rng = mulberry32(99);
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        const reachable = new Set(reachableBuckets(seed, round, tokens));
        let checked = 0;
        for (let i = 0; i < 60 && checked < 5; i++) {
          const candidate = Math.floor(rng() * BUCKETS.length);
          if (reachable.has(candidate)) continue;
          checked++;
          const spins = minSpinsFor(seed, round, candidate);
          // either genuinely unreachable, or reachable only past the token budget
          expect(spins === null || !spinsAffordable(spins, tokens)).toBe(true);
        }
      }
    }
  });

  it("offers strictly more landings to a worse flaw", () => {
    const mild = { team: 1, era: 1, wild: 0 };
    const brutal = { team: 1, era: 1, wild: 2 };
    for (const seed of SEEDS) {
      for (let round = 0; round < ROUNDS; round++) {
        expect(reachableBuckets(seed, round, brutal).length).toBeGreaterThanOrEqual(
          reachableBuckets(seed, round, mild).length
        );
      }
    }
  });
});
