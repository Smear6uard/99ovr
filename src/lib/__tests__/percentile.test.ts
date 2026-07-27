import { describe, expect, it } from "vitest";
import { BUCKETS } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { dailyNumberFor, dailySeed, formatDailyBlock } from "@/lib/daily";
import { dailyScore, topPercentFrom, validateDailySubmission } from "@/lib/percentile";
import { ROUNDS, bucketIndexAt } from "@/lib/wheel";
import type { Grade, StealBuild, StealResult } from "@/lib/types";

const DATE = "2026-07-20";

/** A legal official-daily run for DATE, taking the base landing every round. */
function officialBuild(): StealBuild {
  const seed = dailySeed(DATE);
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0);
    const playerIdx = BUCKETS[bucketIdx].players.findIndex((p) => !taken.has(p.person));
    taken.add(BUCKETS[bucketIdx].players[playerIdx].person);
    steals.push([bucketIdx, playerIdx]);
  }
  return {
    v: 3,
    mode: "daily",
    seed,
    flaw: FLAWS.findIndex((f) => f.severity === "Mild"),
    steals,
    attempt: 0,
    daily: dailyNumberFor(DATE),
    knowledge: false,
  };
}

const fakeResult = (ovr: number, fellAt: number | null, grades: Grade[] = ["A", "B", "C", "A-", "F", "B+"]) =>
  ({
    derived: { ovr },
    fellAt,
    steals: grades.map((grade) => ({ grade })),
  }) as unknown as StealResult;

describe("dailyScore", () => {
  it("orders by OVR first, gauntlet depth second", () => {
    expect(dailyScore(fakeResult(87, 9))).toBeGreaterThan(dailyScore(fakeResult(87, 3)));
    expect(dailyScore(fakeResult(88, 1))).toBeGreaterThan(dailyScore(fakeResult(87, null)));
    expect(dailyScore(fakeResult(87, null))).toBe(8710);
  });
});

describe("topPercentFrom", () => {
  it("computes Top N% with the best score reading Top 1%", () => {
    const hist = { "9002": 1, "8705": 6, "8203": 13, "7801": 80 };
    expect(topPercentFrom(hist, 9002)).toBe(1);
    expect(topPercentFrom(hist, 8705)).toBe(1); // 1 of 100 above → 1%
    expect(topPercentFrom(hist, 8203)).toBe(7); // 7 of 100 above
    expect(topPercentFrom(hist, 7801)).toBe(20);
  });

  it("handles empty and malformed histograms", () => {
    expect(topPercentFrom({}, 5000)).toBeNull();
    expect(topPercentFrom({ junk: Number.NaN }, 5000)).toBeNull();
  });
});

describe("validateDailySubmission", () => {
  it("accepts a genuine official daily run", () => {
    expect(validateDailySubmission(officialBuild(), DATE)).toBeNull();
  });

  it("rejects wrong mode, re-sims, stale days, and forged seeds", () => {
    const b = officialBuild();
    expect(validateDailySubmission({ ...b, mode: "sandbox" }, DATE)).toMatch(/daily/);
    expect(validateDailySubmission({ ...b, attempt: 3 }, DATE)).toMatch(/official/);
    expect(validateDailySubmission(b, "2026-07-21")).toMatch(/today/);
    expect(validateDailySubmission({ ...b, seed: 12345 }, DATE)).toMatch(/seed|today/);
  });

  it("rejects a landing today's wheel could never offer", () => {
    const b = officialBuild();
    const offered = new Set(
      [0, 1, 2, 3].flatMap((t) => [0, 1, 2, 3].map((e) => bucketIndexAt(b.seed, 0, t, e)))
    );
    const alien = BUCKETS.findIndex((_bucket, index) => !offered.has(index));
    expect(alien).toBeGreaterThanOrEqual(0);
    const forged: StealBuild = { ...b, steals: [[alien, 0], ...b.steals.slice(1)] as Array<[number, number]> };
    expect(validateDailySubmission(forged, DATE)).toMatch(/wheel/);
  });

  it("rejects more re-spins than the chosen flaw paid for", () => {
    const b = officialBuild();
    const greedy: StealBuild = {
      ...b,
      steals: b.steals.map((pair, round) =>
        round < 3 ? [bucketIndexAt(b.seed, round, 1, 0), 0] : pair
      ) as Array<[number, number]>,
    };
    expect(validateDailySubmission(greedy, DATE)).toMatch(/re-spins/);
  });
});

describe("emoji block with percentile", () => {
  it("inserts the Top N% line last, and only when known", () => {
    const result = fakeResult(87, 9);
    const withPct = formatDailyBlock(result, 14, 9);
    expect(withPct.split("\n")).toEqual([
      "99OVR Daily #14",
      "🟢A 🟡B 🟡C 🟢A- 🔴F 🟡B+ · 87 OVR SUPERSTAR · Round 9 ⟶ 99ovr.app",
      "📊 Top 9% today",
    ]);
    expect(formatDailyBlock(result, 14)).not.toContain("📊");
    expect(formatDailyBlock(result, 14, null)).not.toContain("📊");
  });
});
