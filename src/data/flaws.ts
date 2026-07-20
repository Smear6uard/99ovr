import type { Flaw } from "@/lib/types";

/**
 * The mandatory flaw pool. Three are offered per run (seeded); one must be taken.
 * Effects hook into the gauntlet sim as power mods — they never touch OVR,
 * which is why the card can say 94 and the log can still say "lost to JR Smith."
 * Array order is encoding-stable — never reorder, only append.
 */
export const FLAWS: Flaw[] = [
  {
    id: "bricklayer",
    name: "Bricklayer From The Line",
    desc: "Career 41% from the stripe — in an empty gym.",
    effect: { kind: "lateRung", fromRung: 7, amount: 5 },
    templates: [
      "Hack-a-strategy deployed. It worked.",
      "Left four points at the line. Again.",
      "Bricked the freebies when it mattered most.",
    ],
  },
  {
    id: "load-mgmt",
    name: "Load Management",
    desc: "Might just… not have it today. Any day.",
    effect: { kind: "noShow", chance: 0.15, amount: 8 },
    templates: [
      "Listed questionable. Played worse.",
      "Showed up in theory only.",
      "Game-time decision. Wrong decision.",
    ],
  },
  {
    id: "slow-starter",
    name: "Slow Starter",
    desc: "Needs a full quarter to locate his legs.",
    effect: { kind: "slowStart", rungs: [1, 6], amount: 6 },
    templates: [
      "Down 0–6 before waking up.",
      "Started colder than the gym AC.",
      "The first bucket took a small eternity.",
    ],
  },
  {
    id: "glass-ankles",
    name: "Glass Ankles",
    desc: "One wrong plant and the run is over.",
    effect: { kind: "injury", chancePerRung: 0.03 },
    templates: [
      "The ankle went. The gym went silent.",
      "Rolled it on a routine cut. Done.",
      "Helped off mid-rung. Brutal way to go.",
    ],
  },
  {
    id: "matador",
    name: "Matador Defense",
    desc: "Waves quick guards through like airport security.",
    effect: { kind: "vsQuick", amount: 6 },
    templates: [
      "Got shook. Repeatedly. Olé.",
      "The first step created highway space.",
      "Blow-by after blow-by after blow-by.",
    ],
  },
  {
    id: "tunnel-vision",
    name: "Tunnel Vision",
    desc: "Has never once seen the open man.",
    effect: { kind: "vsCrafty", amount: 6 },
    templates: [
      "Forced it into a crowd. Again.",
      "The vet baited him all rung long.",
      "Played one-on-three by choice.",
    ],
  },
  {
    id: "stone-hands",
    name: "Stone Hands",
    desc: "Catches clean passes with his wrists.",
    effect: { kind: "flat", amount: 3 },
    templates: [
      "Fumbled a clean look out of bounds.",
      "The ball just… left.",
      "Two turnovers on catches. Catches.",
    ],
  },
  {
    id: "cardio-2004",
    name: "Cardio From 2004",
    desc: "Gassed by the second half. Every half.",
    effect: { kind: "cardio", fromRung: 6, perRung: 1 },
    templates: [
      "Hands on knees before the finish.",
      "Legs gone, jumper short, story over.",
      "Asked for water mid-possession.",
    ],
  },
  {
    id: "whistle-magnet",
    name: "Whistle Magnet",
    desc: "Every call is personal. Every ref agrees.",
    effect: { kind: "whistle", chance: 0.12, amount: 7 },
    templates: [
      "Picked up a tech arguing a make.",
      "Foul trouble by the second bucket.",
      "Spent the rung debating, not defending.",
    ],
  },
  {
    id: "hero-ball",
    name: "Main Character Syndrome",
    desc: "Every possession is his movie. Endings vary.",
    effect: { kind: "heroBall", earlyBonus: 2, lateRungs: 8, latePenalty: 5 },
    templates: [
      "Shot a contested stepback down two.",
      "Waved off the easy look. Missed hard.",
      "The hero shot hit backboard only.",
    ],
  },
];

export function flawByIndex(index: number): Flaw | null {
  if (index < 0 || index >= FLAWS.length) return null;
  return FLAWS[index];
}
