import { describe, expect, it } from "vitest";
import { BUCKETS } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { mulberry32 } from "@/lib/rng";
import { GRADES, gradeFor, gradeScore, gradeEmoji } from "@/lib/grade";
import { deriveSteals, simulateSteals, stealsFor, validateSteals } from "@/lib/steal";
import { tierFor } from "@/lib/tiers";
import { ROUNDS, bucketIndexAt, minSpinsFor, tokensFor } from "@/lib/wheel";
import { ATTRS, type StealBuild } from "@/lib/types";

/** A legal run on `seed` that takes the nth-best player at each attribute. */
function buildFor(seed: number, pick: (ratings: number[]) => number, flaw = 2): StealBuild {
  const steals: Array<[number, number]> = [];
  const taken = new Set<string>();
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0);
    const bucket = BUCKETS[bucketIdx];
    const ordered = bucket.players
      .map((player, index) => ({ index, rating: player.r[round], person: player.person }))
      .filter((entry) => !taken.has(entry.person))
      .sort((a, b) => b.rating - a.rating);
    const chosen = ordered[pick(ordered.map((o) => o.rating))] ?? ordered[0];
    taken.add(chosen.person);
    steals.push([bucketIdx, chosen.index]);
  }
  return { v: 3, mode: "sandbox", seed, flaw, steals, attempt: 0, daily: 0, knowledge: false };
}

const best = buildFor(0xc0ffee, () => 0);
const worst = buildFor(0xc0ffee, (r) => r.length - 1);

describe("grading", () => {
  it("gives A+ only to the roster's best and F only near the bottom", () => {
    expect(gradeFor(0, 12)).toBe("A+");
    expect(gradeFor(11, 12)).toBe("F");
    expect(gradeFor(1, 12)).toBe("A");
  });

  it("stays monotone — a worse rank never grades better", () => {
    for (let n = 10; n <= 14; n++) {
      let previous = Infinity;
      for (let rank = 0; rank < n; rank++) {
        const score = gradeScore(gradeFor(rank, n));
        expect(score).toBeLessThanOrEqual(previous);
        previous = score;
      }
    }
  });

  it("grades the decision, not the number — best-on-a-bad-roster is still A+", () => {
    const rough = BUCKETS.find((b) => b.vibe === "rough")!;
    const attrIdx = 1;
    const top = Math.max(...rough.players.map((p) => p.r[attrIdx]));
    expect(top).toBeLessThan(95);
    expect(gradeFor(0, rough.players.length)).toBe("A+");
  });

  it("colors A green, B/C yellow, D/F red", () => {
    expect(GRADES.filter((g) => gradeEmoji(g) === "🟢")).toEqual(["A+", "A", "A-"]);
    expect(gradeEmoji("B")).toBe("🟡");
    expect(gradeEmoji("C-")).toBe("🟡");
    expect(gradeEmoji("D")).toBe("🔴");
    expect(gradeEmoji("F")).toBe("🔴");
  });
});

describe("validation", () => {
  it("accepts a run that only takes what the wheel offered", () => {
    expect(validateSteals(best)).toBe(true);
  });

  it("rejects stealing from the same person twice", () => {
    // Ray Allen is on both celtics-08 and sonics-96; any repeat must be refused.
    const bucketIdx = best.steals[0][0];
    const dup: StealBuild = {
      ...best,
      steals: best.steals.map((pair, i) => (i === 1 ? [bucketIdx, best.steals[0][1]] : pair)) as Array<[number, number]>,
    };
    expect(validateSteals(dup)).toBe(false);
  });

  it("rejects a bucket the wheel never offered on that round", () => {
    const offered = new Set([0, 1, 2, 3].flatMap((t) => [0, 1, 2, 3].map((e) => bucketIndexAt(best.seed, 0, t, e))));
    const alien = BUCKETS.findIndex((_b, i) => !offered.has(i));
    const cheat: StealBuild = { ...best, steals: [[alien, 0], ...best.steals.slice(1)] as Array<[number, number]> };
    expect(validateSteals(cheat)).toBe(false);
  });

  it("rejects more re-spins than the flaw paid for", () => {
    const mild = FLAWS.findIndex((f) => f.severity === "Mild");
    const seed = 4242;
    // three re-spun rounds on a flaw that grants no wild tokens
    const steals: Array<[number, number]> = [];
    for (let round = 0; round < ROUNDS; round++) {
      const t = round < 3 ? 1 : 0;
      steals.push([bucketIndexAt(seed, round, t, 0), 0]);
    }
    const greedy: StealBuild = { v: 3, mode: "sandbox", seed, flaw: mild, steals, attempt: 0, daily: 0, knowledge: false };
    const used = steals.reduce(
      (acc, [bucketIdx], round) => {
        const spins = minSpinsFor(seed, round, bucketIdx)!;
        return { team: acc.team + spins.team, era: acc.era + spins.era };
      },
      { team: 0, era: 0 }
    );
    expect(used.team).toBeGreaterThan(tokensFor(FLAWS[mild]).team);
    expect(validateSteals(greedy)).toBe(false);
  });

  it("lets a Career-Threatening flaw afford re-spins a Mild flaw cannot", () => {
    const mild = FLAWS.findIndex((f) => f.severity === "Mild");
    const ct = FLAWS.findIndex((f) => f.severity === "Career-Threatening");
    const seed = 555;
    const steals: Array<[number, number]> = [];
    for (let round = 0; round < ROUNDS; round++) {
      steals.push([bucketIndexAt(seed, round, round < 2 ? 1 : 0, round === 2 ? 1 : 0), 0]);
    }
    const base = { v: 3 as const, mode: "sandbox" as const, seed, steals, attempt: 0, daily: 0, knowledge: false };
    expect(validateSteals({ ...base, flaw: mild })).toBe(false);
    expect(validateSteals({ ...base, flaw: ct })).toBe(true);
  });
});

describe("rating tuning", () => {
  it("puts perfect roster-reading in GOAT and leaves 99 unreachable", () => {
    const derived = deriveSteals(stealsFor(best)!);
    expect(derived.ovr).toBeGreaterThanOrEqual(88);
    expect(derived.ovr).toBeLessThanOrEqual(98);

    // the absolute ceiling: the best rating in the entire pool for every attribute
    const ceiling = {} as Record<string, number>;
    ATTRS.forEach((attr, index) => {
      ceiling[attr] = Math.max(...BUCKETS.flatMap((b) => b.players.map((p) => p.r[index])));
    });
    const topSteals = stealsFor(best)!.map((steal, index) => ({
      ...steal,
      rating: ceiling[ATTRS[index]],
    }));
    const max = deriveSteals(topSteals).ovr;
    expect(max).toBeGreaterThanOrEqual(96); // GOAT is reachable...
    expect(max).toBeLessThanOrEqual(98); // ...99 is not
  });

  it("puts worst-available roster-reading in the basement", () => {
    const derived = deriveSteals(stealsFor(worst)!);
    expect(derived.ovr).toBeGreaterThanOrEqual(40);
    expect(derived.ovr).toBeLessThan(62);
  });

  it("keeps a random-ish run in the middle of the tier ladder", () => {
    const rng = mulberry32(31337);
    const scores: number[] = [];
    for (let i = 0; i < 200; i++) {
      const seed = Math.floor(rng() * 0xffffffff) >>> 0;
      const build = buildFor(seed, (ratings) => Math.floor(rng() * ratings.length));
      const result = simulateSteals(build);
      if (result) scores.push(result.derived.ovr);
    }
    const median = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
    expect(median).toBeGreaterThanOrEqual(58);
    expect(median).toBeLessThanOrEqual(82);
  });

  it("rewards better roster-reading with a better number, every time", () => {
    const rng = mulberry32(777);
    for (let i = 0; i < 40; i++) {
      const seed = Math.floor(rng() * 0xffffffff) >>> 0;
      const good = simulateSteals(buildFor(seed, () => 0));
      const bad = simulateSteals(buildFor(seed, (r) => r.length - 1));
      if (!good || !bad) continue;
      expect(good.derived.ovr).toBeGreaterThan(bad.derived.ovr);
    }
  });

  it("uses the published tier ladder", () => {
    expect([54, 55, 65, 75, 83, 90, 96].map(tierFor)).toEqual([
      "bench", "role", "starter", "allstar", "superstar", "hof", "goat",
    ]);
  });
});

describe("determinism and replay", () => {
  it("returns a byte-identical story for the same build", () => {
    expect(JSON.stringify(simulateSteals(best))).toBe(JSON.stringify(simulateSteals(best)));
  });

  it("changes the story when the attempt changes, but never the rating", () => {
    const again = simulateSteals({ ...best, attempt: 1 })!;
    const first = simulateSteals(best)!;
    expect(again.derived.ovr).toBe(first.derived.ovr);
    expect(again.simSeed).not.toBe(first.simSeed);
  });

  it("never lets Ball Knowledge touch the simulation", () => {
    const plain = simulateSteals(best)!;
    const bk = simulateSteals({ ...best, knowledge: true })!;
    expect(bk.simSeed).toBe(plain.simSeed);
    expect(bk.derived.ovr).toBe(plain.derived.ovr);
    expect(bk.fellAt).toBe(plain.fellAt);
  });

  it("grades all six rounds and names a best steal and a reach", () => {
    const result = simulateSteals(best)!;
    expect(result.steals).toHaveLength(ROUNDS);
    expect(result.steals.map((s) => s.attr)).toEqual([...ATTRS]);
    expect(gradeScore(result.bestSteal.grade)).toBeGreaterThanOrEqual(gradeScore(result.reach.grade));
    for (const steal of result.steals) {
      expect(steal.verdict.length).toBeGreaterThan(5);
      expect(steal.best.r[ATTRS.indexOf(steal.attr)]).toBeGreaterThanOrEqual(steal.rating);
    }
  });

  it("runs a full 10-rung gauntlet or stops at the loss", () => {
    const rng = mulberry32(2024);
    for (let i = 0; i < 50; i++) {
      const seed = Math.floor(rng() * 0xffffffff) >>> 0;
      const result = simulateSteals(buildFor(seed, (r) => Math.floor(rng() * r.length)));
      if (!result) continue;
      expect(result.rungs.length).toBe(result.fellAt ?? 10);
      expect(result.gauntlet).toHaveLength(10);
    }
  });
});
