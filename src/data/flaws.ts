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
    severity: "Bad", refund: 1,
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
    severity: "Brutal", refund: 2,
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
    severity: "Mild", refund: 0,
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
    severity: "Career-Threatening", refund: 3,
    templates: [
      "The ankle went. The gym went silent.",
      "Rolled it on a routine cut. Done.",
      "Helped off mid-round. Brutal way to go.",
    ],
  },
  {
    id: "matador",
    name: "Matador Defense",
    desc: "Waves quick guards through like airport security.",
    effect: { kind: "vsQuick", amount: 6 },
    severity: "Bad", refund: 1,
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
    severity: "Bad", refund: 1,
    templates: [
      "Forced it into a crowd. Again.",
      "The vet baited him all round long.",
      "Played one-on-three by choice.",
    ],
  },
  {
    id: "stone-hands",
    name: "Stone Hands",
    desc: "Catches clean passes with his wrists.",
    effect: { kind: "flat", amount: 3 },
    severity: "Mild", refund: 0,
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
    severity: "Brutal", refund: 2,
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
    severity: "Bad", refund: 1,
    templates: [
      "Picked up a tech arguing a make.",
      "Foul trouble by the second bucket.",
      "Spent the round debating, not defending.",
    ],
  },
  {
    id: "hero-ball",
    name: "Main Character Syndrome",
    desc: "Every possession is his movie. Endings vary.",
    effect: { kind: "heroBall", earlyBonus: 2, lateRungs: 8, latePenalty: 5 },
    severity: "Brutal", refund: 2,
    templates: [
      "Shot a contested stepback down two.",
      "Waved off the easy look. Missed hard.",
      "The hero shot hit backboard only.",
    ],
  },
  {
    id: "back-spasms", name: "Back Spasms", severity: "Career-Threatening", refund: 3,
    desc: "One awkward landing can close the gym early.",
    effect: { kind: "injury", chancePerRung: 0.045 },
    templates: ["The back locked up. The run did too.", "Landed stiff and never took the next possession.", "One grimace, one timeout, one finished run."],
  },
  {
    id: "fourth-quarter-tax", name: "Fourth-Quarter Tax", severity: "Brutal", refund: 2,
    desc: "The legs send an invoice after Round 5.",
    effect: { kind: "cardio", fromRung: 6, perRung: 1.5 },
    templates: ["Every jumper came up front rim.", "The tank hit empty before the game did.", "Boss fresh. Your legs: unpaid leave."],
  },
  {
    id: "left-hand-only", name: "Left Hand Decorative", severity: "Bad", refund: 1,
    desc: "Quick bosses sit on the one usable lane.",
    effect: { kind: "vsQuick", amount: 7 },
    templates: ["Got sent left. Had no sequel.", "The weak hand became public evidence.", "One lane, one answer, zero counters."],
  },
  {
    id: "scouting-report", name: "Scouting Report Victim", severity: "Mild", refund: 0,
    desc: "Veterans know the move before you start it.",
    effect: { kind: "vsCrafty", amount: 4 },
    templates: ["The counter got countered.", "Boss read the move off the menu.", "Every fake had already leaked online."],
  },
  {
    id: "technical-debt", name: "Technical Debt", severity: "Brutal", refund: 2,
    desc: "The whistle and your mouth are undefeated together.",
    effect: { kind: "whistle", chance: 0.2, amount: 8 },
    templates: ["Argued the call through two possessions.", "The tech was louder than the bucket.", "Beat the defender. Lost to the whistle."],
  },
  {
    id: "podcast-legs", name: "Podcast Legs", severity: "Career-Threatening", refund: 3,
    desc: "Elite takes. Questionable availability.",
    effect: { kind: "noShow", chance: 0.22, amount: 10 },
    templates: ["Recorded 90 minutes. Played about nine.", "The mic got the best version today.", "Analysis sharp. Closeout very much not."],
  },
];

export function flawByIndex(index: number): Flaw | null {
  if (index < 0 || index >= FLAWS.length) return null;
  return FLAWS[index];
}
