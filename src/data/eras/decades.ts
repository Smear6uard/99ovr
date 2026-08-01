import { BUCKETS } from "@/data/eras";
import { decadeTag } from "@/data/eras/authoring";
import { DECADE_ROSTER_SUPPLEMENTS } from "@/data/eras/decade-rosters.generated";
import type { EraBucket, EraPlayer, EraVibe, Franchise } from "@/lib/types";

/**
 * The v5 wheel pool: one bucket per franchise per decade, merging every
 * authored era of that franchise inside the decade into a single roster.
 *
 * DERIVED, BUT STILL ENCODING-STABLE: v5 codes store indices into
 * DECADE_BUCKETS, and this derivation only walks BUCKETS in order — so the
 * append-only discipline on the era files keeps this order stable too.
 * Appending a new era can only append decade-buckets or append players to an
 * existing one, never reorder what's already published.
 */

const VIBE_RANK: Record<EraVibe, number> = { rough: 0, solid: 1, iconic: 2 };

const ratingSum = (p: EraPlayer) => p.r.reduce((a, b) => a + b, 0);

function mergeInto(target: EraBucket, era: EraBucket): void {
  if (VIBE_RANK[era.vibe] > VIBE_RANK[target.vibe]) {
    target.vibe = era.vibe;
    target.tag = era.tag;
  }
  for (const player of era.players) {
    const existing = target.players.findIndex((p) => p.person === player.person);
    if (existing === -1) {
      target.players.push({ ...player, id: `${target.id}:${player.person}` });
    } else if (ratingSum(player) > ratingSum(target.players[existing])) {
      // same human, two eras in one decade — keep the peak version, in place
      target.players[existing] = { ...player, id: `${target.id}:${player.person}` };
    }
  }
}

/**
 * A decade bucket is an all-decade franchise pool, not the single season that
 * originally supplied its wheel slot. Supplements are append-only: the
 * hand-authored snapshot stays at the front so existing v5 player indices do
 * not move, while every other player who appeared for the franchise during
 * that decade becomes available.
 */
function appendDecadeRoster(target: EraBucket): void {
  const existing = new Set(target.players.map((player) => player.person));
  for (const player of DECADE_ROSTER_SUPPLEMENTS[`${target.franchise}:${target.decade}`] ?? []) {
    if (existing.has(player.person)) continue;
    target.players.push({ ...player, id: `${target.id}:${player.person}` });
    existing.add(player.person);
  }
  const topAttributeAverage = target.players
    .map((player) => Math.max(...player.r))
    .sort((a, b) => b - a)
    .slice(0, 8)
    .reduce((sum, rating, _index, top) => sum + rating / top.length, 0);
  const fullRosterVibe: EraVibe = topAttributeAverage >= 90 ? "iconic" : topAttributeAverage < 85 ? "rough" : "solid";
  if (VIBE_RANK[fullRosterVibe] > VIBE_RANK[target.vibe]) target.vibe = fullRosterVibe;
  target.tag = `Every ${target.team} player from the ${decadeTag(target.decade)} — one all-decade roster.`;
}

export const DECADE_BUCKETS: EraBucket[] = (() => {
  const byKey = new Map<string, EraBucket>();
  const out: EraBucket[] = [];
  for (const era of BUCKETS) {
    const key = `${era.franchise}:${era.decade}`;
    const existing = byKey.get(key);
    if (existing) {
      mergeInto(existing, era);
      continue;
    }
    const bucket: EraBucket = {
      id: `${era.franchise}-${era.decade}s`,
      franchise: era.franchise,
      team: era.team,
      season: `${decadeTag(era.decade)}`,
      label: `${decadeTag(era.decade)} ${era.team}`,
      decade: era.decade,
      vibe: era.vibe,
      tag: era.tag,
      players: [],
    };
    mergeInto(bucket, era);
    byKey.set(key, bucket);
    out.push(bucket);
  }
  for (const bucket of out) appendDecadeRoster(bucket);
  return out;
})();

/** Same shape as FRANCHISES, but `eras` are decade-bucket indices. */
export const DECADE_FRANCHISES: Franchise[] = (() => {
  const byId = new Map<string, Franchise>();
  DECADE_BUCKETS.forEach((bucket, index) => {
    const existing = byId.get(bucket.franchise);
    if (existing) existing.eras.push(index);
    else byId.set(bucket.franchise, { id: bucket.franchise, team: bucket.team, eras: [index] });
  });
  return [...byId.values()];
})();
