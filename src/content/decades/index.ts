import type { DecadeGuide } from "@/content/types";
import { SIXTIES_GUIDE } from "@/content/decades/sixties";
import { SEVENTIES_GUIDE } from "@/content/decades/seventies";
import { EIGHTIES_GUIDE } from "@/content/decades/eighties";
import { NINETIES_GUIDE } from "@/content/decades/nineties";
import { AUGHTS_GUIDE } from "@/content/decades/aughts";
import { TENS_GUIDE } from "@/content/decades/tens";
import { TWENTIES_GUIDE } from "@/content/decades/twenties";

/** Oldest first, matching POS_DECADES. */
export const DECADE_GUIDES: DecadeGuide[] = [
  SIXTIES_GUIDE,
  SEVENTIES_GUIDE,
  EIGHTIES_GUIDE,
  NINETIES_GUIDE,
  AUGHTS_GUIDE,
  TENS_GUIDE,
  TWENTIES_GUIDE,
];

export function decadeGuide(slug: string): DecadeGuide | undefined {
  return DECADE_GUIDES.find((guide) => guide.slug === slug);
}
