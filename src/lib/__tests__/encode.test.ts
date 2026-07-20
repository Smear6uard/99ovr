import { describe, expect, it } from "vitest";
import { decodeBuild, encodeBuild } from "@/lib/encode";
import { mulberry32, rngInt } from "@/lib/rng";
import { validateBuild } from "@/lib/sim";
import { POOL } from "@/data/pool";
import { SLOTS, type BuildCode } from "@/lib/types";

function randomValidBuild(rng: () => number): BuildCode | null {
  const picks = SLOTS.map((s) => rngInt(rng, POOL[s].length));
  const build: BuildCode = {
    v: 1,
    mode: rng() < 0.5 ? "daily" : "sandbox",
    seed: Math.floor(rng() * 0xffffffff) >>> 0,
    picks,
    flaw: rngInt(rng, 10),
    attempt: rngInt(rng, 1000),
    daily: rngInt(rng, 500),
    knowledge: rng() < 0.5,
  };
  return validateBuild(build) ? build : null;
}

describe("encodeBuild/decodeBuild", () => {
  it("round-trips hundreds of valid builds byte-perfectly", () => {
    const rng = mulberry32(0xc0ffee);
    let tested = 0;
    for (let i = 0; i < 3000 && tested < 300; i++) {
      const build = randomValidBuild(rng);
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
    while (!build) build = randomValidBuild(rng);
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
    while (!base) base = randomValidBuild(rng);
    for (const knowledge of [true, false]) {
      const b: BuildCode = { ...base, knowledge };
      expect(decodeBuild(encodeBuild(b))).toEqual(b);
    }
  });

  it("a knowledge:false code is byte-compatible with legacy codes (high bit clear)", () => {
    const rng = mulberry32(0xabc123);
    let base: BuildCode | null = null;
    while (!base) base = randomValidBuild(rng);
    const legacy: BuildCode = { ...base, knowledge: false };
    const code = decodeBuild(encodeBuild(legacy));
    expect(code?.knowledge).toBe(false);
  });
});
