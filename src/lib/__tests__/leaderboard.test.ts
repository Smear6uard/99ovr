import { describe, expect, it } from "vitest";
import { BUCKETS } from "@/data/eras";
import { dailyNumberFor, dailySeed } from "@/lib/daily";
import {
  cleanInitials,
  dailyScore,
  lbMember,
  memberInitials,
  scoreParts,
  validateDailySubmission,
} from "@/lib/leaderboard";
import { ROUNDS, bucketIndexAt } from "@/lib/wheel";
import type { StealBuild, StealResult } from "@/lib/types";

const TODAY = "2026-07-28";

function officialDaily(overrides: Partial<StealBuild> = {}): StealBuild {
  const seed = dailySeed(TODAY);
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0);
    const pick = BUCKETS[bucketIdx].players
      .map((player, index) => ({ player, index }))
      .find(({ player }) => !taken.has(player.person))!;
    taken.add(pick.player.person);
    steals.push([bucketIdx, pick.index]);
  }
  return {
    v: 4,
    mode: "daily",
    seed,
    flaw: -1,
    target: "ALL",
    steals,
    attempt: 0,
    daily: dailyNumberFor(TODAY),
    knowledge: false,
    ...overrides,
  };
}

describe("initials", () => {
  it("uppercases and accepts three clean letters", () => {
    expect(cleanInitials("abc")).toBe("ABC");
    expect(cleanInitials(" mvp ")).toBe("MVP");
  });

  it("rejects wrong shapes and the blocklist", () => {
    expect(cleanInitials("AB")).toBeNull();
    expect(cleanInitials("ABCD")).toBeNull();
    expect(cleanInitials("A1C")).toBeNull();
    expect(cleanInitials(42)).toBeNull();
    expect(cleanInitials("FUK")).toBeNull();
    expect(cleanInitials("KKK")).toBeNull();
  });
});

describe("score", () => {
  it("orders by OVR then gauntlet depth, and round-trips through scoreParts", () => {
    const a = dailyScore({ derived: { ovr: 88 }, fellAt: 9 } as unknown as StealResult);
    const b = dailyScore({ derived: { ovr: 88 }, fellAt: null } as unknown as StealResult);
    const c = dailyScore({ derived: { ovr: 89 }, fellAt: 1 } as unknown as StealResult);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(scoreParts(a)).toEqual({ ovr: 88, roundsWon: 8 });
    expect(scoreParts(b)).toEqual({ ovr: 88, roundsWon: 10 });
  });
});

describe("member keys", () => {
  it("prefixes initials, stays stable per ip+code, and never leaks the ip", () => {
    const m = lbMember("ABC", "203.0.113.9", "somecode");
    expect(m.startsWith("ABC#")).toBe(true);
    expect(m).toBe(lbMember("ABC", "203.0.113.9", "somecode"));
    expect(m).not.toBe(lbMember("ABC", "203.0.113.10", "somecode"));
    expect(m).not.toContain("203");
    expect(memberInitials(m)).toBe("ABC");
  });
});

describe("submission gatekeeping — the anti-cheat", () => {
  it("accepts a legal official run for today", () => {
    expect(validateDailySubmission(officialDaily(), TODAY)).toBeNull();
  });

  it("rejects everything a cheater would try", () => {
    expect(validateDailySubmission(officialDaily({ mode: "classic" }), TODAY)).toBeTruthy();
    expect(validateDailySubmission(officialDaily({ attempt: 3 }), TODAY)).toBeTruthy();
    expect(validateDailySubmission(officialDaily({ daily: 12 }), TODAY)).toBeTruthy();
    expect(validateDailySubmission(officialDaily({ seed: 12345 }), TODAY)).toBeTruthy();
    expect(validateDailySubmission(officialDaily({ target: "PG" }), TODAY)).toBeTruthy();
    expect(validateDailySubmission(officialDaily({ flaw: 0 }), TODAY)).toBeTruthy();
    // a landing today's wheel never offered
    const alien = officialDaily();
    const offered = new Set(
      [0, 1, 2, 3].flatMap((t) => [0, 1, 2, 3].map((e) => bucketIndexAt(alien.seed, 0, t, e)))
    );
    const outside = BUCKETS.findIndex((_b, i) => !offered.has(i));
    alien.steals[0] = [outside, 0];
    expect(validateDailySubmission(alien, TODAY)).toBeTruthy();
  });
});
