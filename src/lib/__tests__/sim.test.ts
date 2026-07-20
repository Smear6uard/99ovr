import { describe, expect, it } from "vitest";
import { POOL, indexOfEntry } from "@/data/pool";
import { BUDGET, curve, deriveBuild, simSeedFor, simulate, validateBuild } from "@/lib/sim";
import { canPick, drawShop } from "@/lib/shop";
import { SLOTS, type BuildCode, type PoolEntry, type SlotId } from "@/lib/types";

/** Every ≤$15 combination, via price-sorted nested loops with pruning. */
function forEachValidCombo(fn: (entries: PoolEntry[]) => void) {
  const sorted = SLOTS.map((s) => [...POOL[s]].sort((a, b) => a.price - b.price));
  const entries: PoolEntry[] = new Array(6);
  const walk = (slotIdx: number, cost: number) => {
    if (slotIdx === 6) {
      fn(entries.slice());
      return;
    }
    const remainingMin = 5 - slotIdx; // later slots cost ≥$1 each
    for (const e of sorted[slotIdx]) {
      if (cost + e.price + remainingMin > BUDGET) break; // sorted → no cheaper option follows
      entries[slotIdx] = e;
      walk(slotIdx + 1, cost + e.price);
    }
  };
  walk(0, 0);
}

describe("rating curve", () => {
  it("is monotone non-decreasing across the whole domain", () => {
    let prev = -Infinity;
    for (let x = 0; x <= 110; x += 0.25) {
      const y = curve(x);
      expect(y).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = y;
    }
  });
});

describe("OVR tuning (acceptance bands)", () => {
  it("best possible $15 build lands 90–94; 99 is unreachable", () => {
    let best = 0;
    let bestEntries: PoolEntry[] = [];
    let count = 0;
    forEachValidCombo((entries) => {
      count++;
      const d = deriveBuild(entries);
      if (d.ovr > best) {
        best = d.ovr;
        bestEntries = entries;
      }
    });
    // eslint-disable-next-line no-console
    console.log(
      `[tuning] ${count} legal builds · max OVR ${best} ·`,
      bestEntries.map((e) => `${e.id}($${e.price})`).join(" ")
    );
    expect(best).toBeGreaterThanOrEqual(90);
    expect(best).toBeLessThanOrEqual(94);
  });

  it("all-$1 builds land roughly 45–55 OVR", () => {
    const ones = SLOTS.map((s) => POOL[s].filter((e) => e.price === 1));
    let min = 99;
    let max = 0;
    const rec = (i: number, acc: PoolEntry[]) => {
      if (i === 6) {
        const d = deriveBuild(acc);
        min = Math.min(min, d.ovr);
        max = Math.max(max, d.ovr);
        return;
      }
      for (const e of ones[i]) rec(i + 1, [...acc, e]);
    };
    rec(0, []);
    // eslint-disable-next-line no-console
    console.log(`[tuning] all-$1 OVR range: ${min}–${max}`);
    expect(min).toBeGreaterThanOrEqual(43);
    expect(max).toBeLessThanOrEqual(57);
  });
});

describe("determinism", () => {
  const fixed: BuildCode = {
    v: 1,
    mode: "sandbox",
    seed: 777,
    picks: [
      indexOfEntry("jumpshot", "js-klay"),
      indexOfEntry("handles", "h-shaq"),
      indexOfEntry("finishing", "f-wade"),
      indexOfEntry("defense", "d-draymond"),
      indexOfEntry("athleticism", "a-cp3"),
      indexOfEntry("iq", "iq-nash"),
    ],
    flaw: 3,
    attempt: 7,
    daily: 0,
  };

  it("same build + same seed ⇒ byte-identical result", () => {
    const a = simulate(fixed);
    const b = simulate(fixed);
    expect(a).not.toBeNull();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("attempt counter changes the sim seed (fresh variance, same build)", () => {
    expect(simSeedFor(fixed)).not.toBe(simSeedFor({ ...fixed, attempt: 8 }));
    expect(simSeedFor(fixed)).not.toBe(simSeedFor({ ...fixed, mode: "daily", daily: 3 }));
  });

  it("shop draw is deterministic and re-roll yields five fresh options", () => {
    const d1 = drawShop(123456, []);
    const d2 = drawShop(123456, []);
    expect(d1).toEqual(d2);
    for (const slot of SLOTS) {
      expect(d1[slot]).toHaveLength(5);
      const prices = d1[slot].map((i) => POOL[slot][i].price);
      expect(prices).toEqual([5, 4, 3, 2, 1]);
      const rerolled = drawShop(123456, [slot])[slot];
      for (let t = 0; t < 5; t++) expect(rerolled[t]).not.toBe(d1[slot][t]);
    }
  });
});

describe("gauntlet feel", () => {
  it("an all-$1 build dies early on average (and gets roasted)", () => {
    const picks = SLOTS.map((s) => {
      const cheapest = POOL[s].filter((e) => e.price === 1)[0];
      return indexOfEntry(s, cheapest.id);
    });
    let total = 0;
    for (let attempt = 0; attempt < 40; attempt++) {
      const r = simulate({ v: 1, mode: "sandbox", seed: 1, picks, flaw: 6, attempt, daily: 0 });
      expect(r).not.toBeNull();
      total += r!.fellAt ?? 10;
      expect(r!.roast.length).toBeGreaterThan(0);
    }
    expect(total / 40).toBeLessThanOrEqual(4);
  });

  it("a strong build regularly gets deep but rarely clears", () => {
    const picks = [
      indexOfEntry("jumpshot", "js-klay"),
      indexOfEntry("handles", "h-shaq"),
      indexOfEntry("finishing", "f-wade"),
      indexOfEntry("defense", "d-draymond"),
      indexOfEntry("athleticism", "a-cp3"),
      indexOfEntry("iq", "iq-nash"),
    ];
    let cleared = 0;
    let deep = 0;
    for (let attempt = 0; attempt < 60; attempt++) {
      const r = simulate({ v: 1, mode: "sandbox", seed: 1, picks, flaw: 0, attempt, daily: 0 })!;
      if (r.fellAt === null) cleared++;
      if ((r.fellAt ?? 11) >= 6) deep++;
    }
    // eslint-disable-next-line no-console
    console.log(`[tuning] strong build: deep ${deep}/60, cleared ${cleared}/60`);
    expect(deep).toBeGreaterThanOrEqual(20);
    expect(cleared).toBeLessThanOrEqual(10);
  });
});

describe("budget validation", () => {
  it("canPick blocks picks that strand unfilled slots below $1 each", () => {
    // $5 jumpshot picked; 4 empty slots besides defense; $15 − 5 = 10 left.
    // A $5 defense leaves $5 for 4 slots → legal. A second $5 plus $4 is not.
    const picks: Partial<Record<SlotId, number>> = { jumpshot: 0 };
    expect(canPick(picks, "defense", 5).ok).toBe(true);
    expect(canPick({ ...picks, defense: 0 }, "finishing", 4).ok).toBe(false);
    expect(canPick({ ...picks, defense: 0 }, "finishing", 1).ok).toBe(true);
  });

  it("replacing a pick refunds it first", () => {
    // Full board at exactly $15 → swapping a $5 for another $5 is legal.
    const picks: Partial<Record<SlotId, number>> = {
      jumpshot: 0, // $5
      handles: 0, // $5
      finishing: 9, // $1
      defense: 9, // $1
      athleticism: 9, // $1
      iq: 9, // $1
    };
    expect(canPick(picks, "jumpshot", 5).ok).toBe(true);
    expect(canPick(picks, "finishing", 3).ok).toBe(false);
    expect(canPick(picks, "finishing", 2).ok).toBe(true);
  });

  it("validateBuild rejects short or over-budget builds", () => {
    expect(validateBuild({ v: 1, mode: "sandbox", seed: 1, picks: [0, 0, 0], flaw: 0, attempt: 0, daily: 0 })).toBe(false);
    expect(validateBuild({ v: 1, mode: "sandbox", seed: 1, picks: [0, 0, 0, 0, 0, 0], flaw: 0, attempt: 0, daily: 0 })).toBe(false);
    expect(validateBuild({ v: 1, mode: "sandbox", seed: 1, picks: [9, 9, 9, 9, 9, 9], flaw: 0, attempt: 0, daily: 0 })).toBe(true);
  });
});
