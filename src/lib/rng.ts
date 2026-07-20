/** FNV-1a 32-bit string hash. Deterministic seed derivation everywhere. */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

/** Integer in [0, n). */
export function rngInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

export function pickOne<T>(rng: Rng, arr: readonly T[]): T {
  return arr[rngInt(rng, arr.length)];
}

/** Seeded Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rngInt(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
