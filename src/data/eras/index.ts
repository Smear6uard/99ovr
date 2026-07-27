import { CLASSICS } from "@/data/eras/classics";
import { NINETIES } from "@/data/eras/nineties";
import { AUGHTS_EARLY } from "@/data/eras/aughts-early";
import { AUGHTS_LATE } from "@/data/eras/aughts-late";
import { TENS_EARLY } from "@/data/eras/tens-early";
import { TENS_LATE } from "@/data/eras/tens-late";
import type { EraBucket, Franchise } from "@/lib/types";

/**
 * Every team-era on the wheel, oldest first. THIS ORDER IS ENCODING-STABLE:
 * a build code stores bucket indices, so buckets may be appended but never
 * reordered or removed.
 */
export const BUCKETS: EraBucket[] = [
  ...CLASSICS,
  ...NINETIES,
  ...AUGHTS_EARLY,
  ...AUGHTS_LATE,
  ...TENS_EARLY,
  ...TENS_LATE,
];

/**
 * Franchises in order of first appearance in BUCKETS — also encoding-stable,
 * since the wheel indexes into this list. Every franchise carries at least two
 * eras so the era re-spin always has somewhere to go.
 */
export const FRANCHISES: Franchise[] = (() => {
  const byId = new Map<string, Franchise>();
  BUCKETS.forEach((bucket, index) => {
    const existing = byId.get(bucket.franchise);
    if (existing) existing.eras.push(index);
    else byId.set(bucket.franchise, { id: bucket.franchise, team: bucket.team, eras: [index] });
  });
  return [...byId.values()];
})();

export const FRANCHISE_INDEX: Record<string, number> = Object.fromEntries(
  FRANCHISES.map((franchise, index) => [franchise.id, index])
);

export function bucketById(id: string): EraBucket | undefined {
  return BUCKETS.find((bucket) => bucket.id === id);
}
