import type { Position, Ratings } from "@/lib/types";

/**
 * Authoring helpers for the positional decade pools. Same ratings scale as
 * the era files (see eras/authoring.ts): [jumpshot, handles, finishing,
 * playmaking, defense, athleticism], 99 = best ever at that one thing,
 * 30–44 = a punchline.
 *
 * `pos` is generous where history is blurry: PF/C hybrids and combo guards
 * carry both tags and appear in both adjacent pools.
 *
 * FROZEN ONCE SHIPPED: the wheel deals a seeded 12 by shuffling the whole
 * (decade, position) pool, so appending or reordering entries changes what
 * existing v5 codes drew. Extending these pools means a new code version.
 */
export type PosDraft = { name: string; line: string; note: string; r: Ratings; pos: Position[] };

export const pp = (name: string, line: string, note: string, r: Ratings, pos: Position[]): PosDraft => ({
  name,
  line,
  note,
  r,
  pos,
});
