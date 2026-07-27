import { describe, expect, it } from "vitest";
import { decodeAny, decodeBuild, decodeSteal, encodeBuild, encodeSteal } from "@/lib/encode";
import { mulberry32, rngInt } from "@/lib/rng";
import { validateBuild } from "@/lib/sim";
import { ROUNDS, bucketIndexAt } from "@/lib/wheel";
import { BUCKETS } from "@/data/eras";
import { POOL } from "@/data/pool";
import { FLAWS } from "@/data/flaws";
import { LEGACY_SLOTS, SLOTS, type BuildCode, type StealBuild } from "@/lib/types";

function randomValidBuild(rng: () => number, version: 1 | 2 = 2): BuildCode | null {
  const slots = version === 1 ? LEGACY_SLOTS : SLOTS;
  const picks = slots.map((s) => {
    const affordable = POOL[s].map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.price <= 2);
    return affordable[rngInt(rng, affordable.length)].index;
  });
  const build: BuildCode = {
    v: version,
    mode: rng() < 0.5 ? "daily" : "sandbox",
    seed: Math.floor(rng() * 0xffffffff) >>> 0,
    picks,
    flaw: rngInt(rng, version === 1 ? 10 : FLAWS.length),
    attempt: rngInt(rng, 1000),
    daily: rngInt(rng, 500),
    knowledge: rng() < 0.5,
    ...(version === 2 ? { position: "ALL" as const } : {}),
  };
  return validateBuild(build) ? build : null;
}

describe("encodeBuild/decodeBuild", () => {
  it("round-trips hundreds of valid builds byte-perfectly", () => {
    const rng = mulberry32(0xc0ffee);
    let tested = 0;
    for (let i = 0; i < 3000 && tested < 300; i++) {
      const build = randomValidBuild(rng, 2);
      if (!build) continue;
      tested++;
      const code = encodeBuild(build);
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
      const back = decodeBuild(code);
      expect(back).toEqual(build);
    }
    expect(tested).toBe(300);
  });

  it("rejects tampered codes", () => {
    const rng = mulberry32(0xdeadbeef);
    let build: BuildCode | null = null;
    while (!build) build = randomValidBuild(rng, 2);
    const code = encodeBuild(build);
    // Flip one character at every position; decode must never return a
    // different-but-"valid" build silently.
    for (let i = 0; i < code.length; i++) {
      const flipped = code.slice(0, i) + (code[i] === "A" ? "B" : "A") + code.slice(i + 1);
      if (flipped === code) continue;
      const out = decodeBuild(flipped);
      if (out !== null) expect(out).toEqual(build);
      else expect(out).toBeNull();
    }
    expect(decodeBuild("not-a-real-code")).toBeNull();
    expect(decodeBuild("")).toBeNull();
    expect(decodeBuild("💀💀💀")).toBeNull();
  });

  it("rejects over-budget builds even with a valid checksum", () => {
    const allFives: BuildCode = {
      v: 1,
      mode: "sandbox",
      seed: 42,
      picks: [0, 0, 0, 0, 0, 0], // every slot's first entry is a $5
      flaw: 0,
      attempt: 0,
      daily: 0,
      knowledge: false,
    };
    expect(validateBuild(allFives)).toBe(false);
    expect(decodeBuild(encodeBuild(allFives))).toBeNull();
  });

  it("round-trips the knowledge flag both ways", () => {
    const rng = mulberry32(0x5eed);
    let base: BuildCode | null = null;
    while (!base) base = randomValidBuild(rng, 2);
    for (const knowledge of [true, false]) {
      const b: BuildCode = { ...base, knowledge };
      expect(decodeBuild(encodeBuild(b))).toEqual(b);
    }
  });

  it("a knowledge:false code is byte-compatible with legacy codes (high bit clear)", () => {
    const rng = mulberry32(0xabc123);
    let base: BuildCode | null = null;
    while (!base) base = randomValidBuild(rng, 1);
    const legacy: BuildCode = { ...base, knowledge: false };
    const code = decodeBuild(encodeBuild(legacy));
    expect(code?.knowledge).toBe(false);
  });

  it("decodes and re-encodes v1 links without changing their bytes", () => {
    const legacy: BuildCode = {
      v: 1, mode: "sandbox", seed: 42,
      picks: LEGACY_SLOTS.map((slot) => POOL[slot].findIndex((entry) => entry.price === 1)),
      flaw: 3, attempt: 2, daily: 0, knowledge: false,
    };
    const code = "AQAAAAAqCQkJCQkJAwACAAAq";
    expect(encodeBuild(legacy)).toBe(code);
    const decoded = decodeBuild(code);
    expect(decoded).toEqual(legacy);
    expect(encodeBuild(decoded!)).toBe(code);
  });
});

/* ------------------------------------------------------------------ */
/* v3 — Six Steals                                                     */
/* ------------------------------------------------------------------ */

/** A legal run on `seed`, taking the first un-stolen player each round. */
function randomStealBuild(rng: () => number): StealBuild {
  const seed = Math.floor(rng() * 0xffffffff) >>> 0;
  const taken = new Set<string>();
  const steals: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    const bucketIdx = bucketIndexAt(seed, round, 0, 0);
    const players = BUCKETS[bucketIdx].players;
    const offset = rngInt(rng, players.length);
    let playerIdx = -1;
    for (let i = 0; i < players.length; i++) {
      const candidate = (offset + i) % players.length;
      if (!taken.has(players[candidate].person)) {
        playerIdx = candidate;
        break;
      }
    }
    taken.add(players[playerIdx].person);
    steals.push([bucketIdx, playerIdx]);
  }
  return {
    v: 3,
    mode: rng() < 0.5 ? "daily" : "sandbox",
    seed,
    flaw: rngInt(rng, FLAWS.length),
    steals,
    attempt: rngInt(rng, 1000),
    daily: rngInt(rng, 500),
    knowledge: rng() < 0.5,
  };
}

describe("encodeSteal/decodeSteal", () => {
  it("round-trips hundreds of valid runs byte-perfectly", () => {
    const rng = mulberry32(0xfeed);
    for (let i = 0; i < 300; i++) {
      const build = randomStealBuild(rng);
      const code = encodeSteal(build);
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(code).toHaveLength(32);
      expect(decodeSteal(code)).toEqual(build);
    }
  });

  it("round-trips the knowledge flag without touching anything else", () => {
    const rng = mulberry32(0x5eed3);
    const base = randomStealBuild(rng);
    for (const knowledge of [true, false]) {
      const build: StealBuild = { ...base, knowledge };
      expect(decodeSteal(encodeSteal(build))).toEqual(build);
    }
  });

  it("rejects tampered codes", () => {
    const build = randomStealBuild(mulberry32(0xbadbad));
    const code = encodeSteal(build);
    for (let i = 0; i < code.length; i++) {
      const flipped = code.slice(0, i) + (code[i] === "A" ? "B" : "A") + code.slice(i + 1);
      if (flipped === code) continue;
      const out = decodeSteal(flipped);
      if (out !== null) expect(out).toEqual(build);
    }
    expect(decodeSteal("not-a-real-code")).toBeNull();
    expect(decodeSteal("")).toBeNull();
  });

  it("rejects an illegal run even with a valid checksum", () => {
    const build = randomStealBuild(mulberry32(7));
    // steal from the same person twice
    const dup: StealBuild = {
      ...build,
      steals: [build.steals[0], build.steals[0], ...build.steals.slice(2)] as Array<[number, number]>,
    };
    expect(decodeSteal(encodeSteal(dup))).toBeNull();
  });

  it("keeps v1, v2, and v3 codes in separate, non-colliding namespaces", () => {
    const rng = mulberry32(0x1234);
    const steal = randomStealBuild(rng);
    const stealCode = encodeSteal(steal);
    expect(decodeBuild(stealCode)).toBeNull();

    let budget: BuildCode | null = null;
    while (!budget) budget = randomValidBuild(rng, 2);
    const budgetCode = encodeBuild(budget);
    expect(decodeSteal(budgetCode)).toBeNull();

    expect(decodeAny(stealCode)).toEqual({ kind: "steal", build: steal });
    expect(decodeAny(budgetCode)).toEqual({ kind: "budget", build: budget });
    expect(decodeAny("garbage")).toBeNull();
  });
});
