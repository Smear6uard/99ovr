import { describe, expect, it } from "vitest";
import { POOL, indexOfEntry } from "@/data/pool";
import { FLAWS } from "@/data/flaws";
import { GAUNTLET } from "@/data/gauntlet";
import { BUDGET, curve, deriveBuild, runGauntlet, simSeedFor, simulate, validateBuild } from "@/lib/sim";
import { canPick, drawShop } from "@/lib/shop";
import { POSITIONS, SLOTS, type BuildCode, type SlotId } from "@/lib/types";
import { tierFor } from "@/lib/tiers";

const pickAtPrice = (slot: SlotId, price: number, best = false) => {
  const choices = POOL[slot].map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.price === price);
  choices.sort((a, b) => best ? b.entry.rating - a.entry.rating : a.entry.rating - b.entry.rating);
  return choices[0].index;
};

describe("data shape", () => {
  it("has 20 position-tagged, stat-authored players in every slot", () => {
    for (const slot of SLOTS) {
      expect(POOL[slot]).toHaveLength(20);
      for (const price of [1, 2, 3, 4, 5]) expect(POOL[slot].filter((entry) => entry.price === price)).toHaveLength(4);
      for (const entry of POOL[slot]) {
        expect(entry.positions.length).toBeGreaterThan(0);
        expect(entry.stats.length).toBeGreaterThanOrEqual(2);
        expect(entry.stats.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it("can draw every price tier for every positional challenge", () => {
    for (const position of POSITIONS) {
      const draw = drawShop(1234, [], position);
      for (const slot of SLOTS) {
        expect(draw[slot]).toHaveLength(5);
        expect(draw[slot].map((index) => POOL[slot][index]?.price)).toEqual([5, 4, 3, 2, 1]);
        expect(draw[slot].every((index) => POOL[slot][index].positions.includes(position))).toBe(true);
      }
    }
  });
});

describe("rating tuning", () => {
  it("uses the seven published rating thresholds", () => {
    expect([54, 55, 65, 75, 83, 90, 96].map(tierFor)).toEqual(["bench", "role", "starter", "allstar", "superstar", "hof", "goat"]);
  });
  it("keeps the curve monotone", () => {
    let previous = -Infinity;
    for (let value = 0; value <= 110; value += 0.25) {
      expect(curve(value)).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = curve(value);
    }
  });

  it("puts an optimized realistic build in HOF and makes GOAT unreachable", () => {
    const prices = [5, 4, 3, 3, 2, 2, 2, 2]; // $23 via a +$3 flaw
    const entries = SLOTS.map((slot, i) => POOL[slot][pickAtPrice(slot, prices[i], true)]);
    const rating = deriveBuild(entries).ovr;
    expect(rating).toBeGreaterThanOrEqual(90);
    expect(rating).toBeLessThanOrEqual(95);

    const theoretical = deriveBuild(SLOTS.map((slot) => POOL[slot].reduce((a, b) => a.rating > b.rating ? a : b))).ovr;
    expect(theoretical).toBeLessThanOrEqual(95);
  });

  it("keeps all-$1 builds in Bench Warmer territory", () => {
    const low = deriveBuild(SLOTS.map((slot) => POOL[slot][pickAtPrice(slot, 1)])).ovr;
    const high = deriveBuild(SLOTS.map((slot) => POOL[slot][pickAtPrice(slot, 1, true)])).ovr;
    expect(low).toBeGreaterThanOrEqual(40);
    expect(high).toBeLessThan(55);
  });
});

describe("determinism and replay", () => {
  const fixed: BuildCode = {
    v: 2, mode: "sandbox", seed: 777, position: "ALL",
    picks: SLOTS.map((slot) => pickAtPrice(slot, 2)), flaw: 3, attempt: 7, daily: 0, knowledge: false,
  };

  it("returns a byte-identical story for the same build", () => {
    expect(JSON.stringify(simulate(fixed))).toBe(JSON.stringify(simulate(fixed)));
  });

  it("changes the sim seed when attemptCounter changes", () => {
    expect(simSeedFor(fixed)).not.toBe(simSeedFor({ ...fixed, attempt: 8 }));
  });

  it("keeps pack draws deterministic and new packs fresh", () => {
    const initial = drawShop(123456, []);
    expect(initial).toEqual(drawShop(123456, []));
    for (const slot of SLOTS) {
      const next = drawShop(123456, [slot])[slot];
      expect(next).toHaveLength(5);
      next.forEach((pick, tier) => expect(pick).not.toBe(initial[slot][tier]));
    }
  });
});

describe("gauntlet calibration", () => {
  it("does not let a 94-power build randomly lose to the early-rung opponents", () => {
    for (let seed = 0; seed < 1_000; seed++) {
      const result = runGauntlet(
        { playerPower: 94, fatigueMod: 0, durability: 75 },
        null,
        seed,
        GAUNTLET
      );
      expect(result.fellAt === null || result.fellAt >= 7, `seed ${seed}`).toBe(true);
    }
  });
});

describe("budget and flaw refunds", () => {
  it("starts at $20 and adds the selected flaw refund", () => {
    expect(BUDGET).toBe(20);
    expect(Math.max(...FLAWS.map((flaw) => flaw.refund))).toBe(3);
    const picks = Object.fromEntries(SLOTS.map((slot, index) => [slot, pickAtPrice(slot, index < 5 ? 3 : 2)])) as Partial<Record<SlotId, number>>;
    expect(canPick(picks, "jumpshot", 5, 23).ok).toBe(true);
    expect(canPick(picks, "jumpshot", 5, 20).ok).toBe(false);
  });

  it("validates v2 position tags and keeps v1 rules alive", () => {
    const v2: BuildCode = { v: 2, mode: "sandbox", seed: 1, position: "ALL", picks: SLOTS.map((slot) => pickAtPrice(slot, 1)), flaw: 0, attempt: 0, daily: 0, knowledge: false };
    expect(validateBuild(v2)).toBe(true);
    const wrongPosition = { ...v2, position: "C" as const, picks: [...v2.picks] };
    wrongPosition.picks[0] = indexOfEntry("jumpshot", "js-curry");
    expect(validateBuild(wrongPosition)).toBe(false);
  });
});
