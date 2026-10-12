import { BUCKETS } from "@/data/eras";
import { DECADE_BUCKETS } from "@/data/eras/decades";
import { POSITION_POOLS } from "@/data/positions";
import { POSITIONS, type EraVibe, type Position } from "@/lib/types";

/**
 * Read-only views of the game data for the publisher pages. Only names, the
 * box-score line and the hand-written note are exposed — the same text a
 * roster card shows in the game. Hidden skill ratings never leave the engine.
 */

const TEAM_NAMES: Record<string, string> = { "76ERS": "76ers", SUPERSONICS: "SuperSonics" };

export function teamName(team: string): string {
  return TEAM_NAMES[team] ?? team.charAt(0) + team.slice(1).toLowerCase();
}

/** Matches the badge on the in-game landing card. */
export const VIBE_LABELS: Record<EraVibe, string> = {
  iconic: "All-time",
  solid: "Solid",
  rough: "Rough",
};

export type PoolEntry = { name: string; line: string; note: string; positions: Position[] };

/** A decade's positional pool, one entry per person, in authoring order. */
export function decadePool(decade: number): PoolEntry[] {
  const pools = POSITION_POOLS[decade];
  if (!pools) return [];
  const byPerson = new Map<string, PoolEntry>();
  for (const position of POSITIONS) {
    for (const player of pools[position]) {
      const existing = byPerson.get(player.person);
      if (existing) existing.positions.push(position);
      else
        byPerson.set(player.person, {
          name: player.name,
          line: player.line,
          note: player.note,
          positions: [position],
        });
    }
  }
  return [...byPerson.values()];
}

export type WheelEra = {
  id: string;
  season: string;
  team: string;
  tag: string;
  /** The hand-authored snapshot roster at the front of the decade bucket. */
  headliners: { name: string; line: string; note: string }[];
};

/** One franchise-decade the Best Player wheel can land on: every authored era inside it, merged. */
export type WheelLanding = {
  id: string;
  franchise: string;
  decade: number;
  team: string;
  /** The landing's vibe — it drives the jackpot / sad-trombone cue — for the merged decade roster, not one season. */
  vibe: EraVibe;
  /** Everyone the merged all-decade roster can deal. */
  rosterSize: number;
  eras: WheelEra[];
};

export const WHEEL_LANDINGS: WheelLanding[] = DECADE_BUCKETS.map((bucket) => ({
  id: bucket.id,
  franchise: bucket.franchise,
  decade: bucket.decade,
  team: teamName(bucket.team),
  vibe: bucket.vibe,
  rosterSize: bucket.players.length,
  eras: BUCKETS.filter((era) => era.franchise === bucket.franchise && era.decade === bucket.decade)
    .map((era) => ({
      id: era.id,
      season: era.season,
      team: teamName(era.team),
      tag: era.tag,
      headliners: era.players.map(({ name, line, note }) => ({ name, line, note })),
    }))
    .sort((a, b) => Number(a.season) - Number(b.season)),
}));

export function landingsIn(decade: number): WheelLanding[] {
  return WHEEL_LANDINGS.filter((landing) => landing.decade === decade).sort(
    (a, b) => Number(a.eras[0]?.season) - Number(b.eras[0]?.season),
  );
}
