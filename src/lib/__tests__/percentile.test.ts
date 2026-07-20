import { describe, expect, it } from "vitest";
import { POOL } from "@/data/pool";
import { dailyNumberFor, dailySeed, formatDailyBlock } from "@/lib/daily";
import { dailyScore, topPercentFrom, validateDailySubmission } from "@/lib/percentile";
import { drawShop, reachablePicks } from "@/lib/shop";
import { SLOTS, type BuildCode, type SimResult } from "@/lib/types";

const DATE = "2026-07-20";

/** A legal official-daily build for DATE, assembled from the actual draw. */
function officialBuild(): BuildCode {
  const seed = dailySeed(DATE);
  const draw = drawShop(seed, []);
  // one per tier is shown $5→$1; take the $2 pick for slot 0 and $1s elsewhere → $7 total
  const picks = SLOTS.map((s, i) => draw[s][i === 0 ? 3 : 4]);
  return {
    v: 1,
    mode: "daily",
    seed,
    picks,
    flaw: 2,
    attempt: 0,
    daily: dailyNumberFor(DATE),
    knowledge: false,
  };
}

describe("dailyScore", () => {
  it("orders by OVR first, gauntlet depth second", () => {
    const mk = (ovr: number, fellAt: number | null) =>
      ({ derived: { ovr }, fellAt }) as unknown as SimResult;
    expect(dailyScore(mk(87, 9))).toBeGreaterThan(dailyScore(mk(87, 3)));
    expect(dailyScore(mk(88, 1))).toBeGreaterThan(dailyScore(mk(87, null)));
    expect(dailyScore(mk(87, null))).toBe(8710);
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
  it("accepts a genuine official daily build", () => {
    expect(validateDailySubmission(officialBuild(), DATE)).toBeNull();
  });

  it("rejects wrong mode, re-sims, stale days, and forged seeds", () => {
    const b = officialBuild();
    expect(validateDailySubmission({ ...b, mode: "sandbox" }, DATE)).toMatch(/daily/);
    expect(validateDailySubmission({ ...b, attempt: 3 }, DATE)).toMatch(/official/);
    expect(validateDailySubmission(b, "2026-07-21")).toMatch(/today/);
    expect(validateDailySubmission({ ...b, seed: 12345 }, DATE)).toMatch(/seed|today/);
  });

  it("rejects picks that today's shop could never offer", () => {
    const b = officialBuild();
    const reachable = reachablePicks(b.seed, SLOTS[0]);
    const unreachable = POOL[SLOTS[0]].map((_, i) => i).find((i) => !reachable.includes(i));
    expect(unreachable).toBeDefined();
    const forged = { ...b, picks: [unreachable!, ...b.picks.slice(1)] };
    expect(validateDailySubmission(forged, DATE)).toMatch(/shop/);
  });

  it("reachablePicks = initial draw plus the re-roll draw", () => {
    const seed = dailySeed(DATE);
    for (const slot of SLOTS) {
      const reach = reachablePicks(seed, slot);
      expect(reach).toHaveLength(10); // 5 tiers × first two of each permutation
      for (const idx of drawShop(seed, [])[slot]) expect(reach).toContain(idx);
      for (const idx of drawShop(seed, [slot])[slot]) expect(reach).toContain(idx);
    }
  });
});

describe("emoji block with percentile", () => {
  it("inserts the Top N% line before the URL, and only when known", () => {
    const result = { derived: { ovr: 87 }, archetype: { name: "Two-Way Demon" }, fellAt: 9 } as unknown as SimResult;
    const withPct = formatDailyBlock(result, 14, 9);
    expect(withPct.split("\n")).toEqual([
      "99OVR Daily #14",
      "🏀 87 OVR · Two-Way Demon",
      "🪜 Fell at Rung 9 (LeBron)",
      "🟩🟩🟩🟩🟩🟩🟩🟩🟥⬛",
      "📊 Top 9% today",
      "99ovr.app/daily",
    ]);
    expect(formatDailyBlock(result, 14)).not.toContain("📊");
    expect(formatDailyBlock(result, 14, null)).not.toContain("📊");
  });
});
