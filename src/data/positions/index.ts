import { slug } from "@/data/eras/authoring";
import { SIXTIES_POOL } from "@/data/positions/sixties";
import { SEVENTIES_POOL } from "@/data/positions/seventies";
import { EIGHTIES_POOL } from "@/data/positions/eighties";
import { NINETIES_POOL } from "@/data/positions/nineties";
import { AUGHTS_POOL } from "@/data/positions/aughts";
import { TENS_POOL } from "@/data/positions/tens";
import { TWENTIES_POOL } from "@/data/positions/twenties";
import type { PosDraft } from "@/data/positions/authoring";
import { POSITIONS, type EraPlayer, type Position } from "@/lib/types";

/** Positional wheel decades, oldest first. ORDER IS ENCODING-STABLE (v5 stores the index). */
export const POS_DECADES = [1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;

const DRAFTS: Record<number, PosDraft[]> = {
  1960: SIXTIES_POOL,
  1970: SEVENTIES_POOL,
  1980: EIGHTIES_POOL,
  1990: NINETIES_POOL,
  2000: AUGHTS_POOL,
  2010: TENS_POOL,
  2020: TWENTIES_POOL,
};

/**
 * (decade, position) → the full pool, in authoring order. The seeded 12-draw
 * shuffles this whole list, so the pools are FROZEN once shipped — appending
 * would silently change what existing codes drew (see positions/authoring.ts).
 */
export const POSITION_POOLS: Record<number, Record<Position, EraPlayer[]>> = (() => {
  const out = {} as Record<number, Record<Position, EraPlayer[]>>;
  for (const decade of POS_DECADES) {
    const perPos = {} as Record<Position, EraPlayer[]>;
    for (const pos of POSITIONS) {
      perPos[pos] = DRAFTS[decade]
        .filter((d) => d.pos.includes(pos))
        .map((d) => ({
          id: `pos-${decade}-${pos}-${slug(d.name)}`,
          person: slug(d.name),
          name: d.name,
          line: d.line,
          note: d.note,
          r: d.r,
        }));
    }
    out[decade] = perPos;
  }
  return out;
})();
