import { describe, expect, it } from "vitest";
import { fnv1a, mulberry32, shuffle } from "@/lib/rng";

describe("fnv1a", () => {
  it("matches known FNV-1a 32-bit vectors", () => {
    expect(fnv1a("")).toBe(0x811c9dc5);
    expect(fnv1a("a")).toBe(0xe40c292c);
    expect(fnv1a("foobar")).toBe(0xbf9cf968);
  });

  it("is deterministic", () => {
    expect(fnv1a("99ovr-daily-2026-07-20")).toBe(fnv1a("99ovr-daily-2026-07-20"));
  });
});

describe("mulberry32", () => {
  it("produces an identical sequence for the same seed", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it("stays in [0, 1)", () => {
    const rng = mulberry32(fnv1a("range-check"));
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("different seeds diverge", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});

describe("shuffle", () => {
  it("is a seeded permutation (deterministic, same members)", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const s1 = shuffle(mulberry32(7), arr);
    const s2 = shuffle(mulberry32(7), arr);
    expect(s1).toEqual(s2);
    expect([...s1].sort((x, y) => x - y)).toEqual(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
