import type { EraBucket, EraPlayer, EraVibe, Ratings } from "@/lib/types";
import { auditRatings } from "@/data/ratingsAudit";

/**
 * Authoring helpers for the team-era pool. Kept tiny on purpose — the data
 * files are meant to read like rosters, not like code.
 *
 * Ratings are [jumpshot, handles, finishing, playmaking, defense, athleticism],
 * always in ATTRS order. Rough scale:
 *
 *   99      the best there has ever been at this one thing
 *   95–98   all-time elite
 *   88–94   elite
 *   80–87   very good
 *   70–79   solid starter
 *   60–69   average NBA
 *   45–59   a weakness
 *   30–44   a punchline
 */

export function slug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type Draft = { name: string; line: string; note: string; r: Ratings };

/** 2010 → "10s", 2000 → "00s", 1990 → "90s". Eras display as decades, never exact years. */
export const decadeTag = (decade: number): string => `${String(decade % 100).padStart(2, "0")}s`;

/** One roster line. `person` (the cross-bucket steal-dedup key) is derived. */
export const p = (name: string, line: string, note: string, r: Ratings): Draft => ({ name, line, note, r });

/**
 * One team-era bucket. `players` order is encoding-stable within the bucket —
 * never reorder a published roster, only append.
 */
export const era = (
  id: string,
  franchise: string,
  team: string,
  season: string,
  vibe: EraVibe,
  tag: string,
  drafts: Draft[]
): EraBucket => {
  const decade = Math.floor(Number(season) / 10) * 10;
  return {
    id,
    franchise,
    team,
    season,
    label: `${decadeTag(decade)} ${team}`,
    decade,
    vibe,
    tag,
    players: drafts.map<EraPlayer>((d) => {
      const person = slug(d.name);
      return {
        id: `${id}:${person}`,
        person,
        name: d.name,
        line: d.line,
        note: d.note,
        r: auditRatings(decade, person, d.r, "authored", id),
      };
    }),
  };
};
