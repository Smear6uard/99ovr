/**
 * Narrative beat templates for the gauntlet log, keyed by margin.
 * {opp} is replaced with the rung's short name; {ps}/{os} with scores.
 */
export const BEATS = {
  winBig: [
    "Ran {opp} off the floor.",
    "{opp} wanted no part of the second half.",
    "It was 8–2 before {opp} blinked.",
    "Total control. {opp} never found a rhythm.",
    "Called game early. {opp} shook hands.",
    "The gap was obvious from the jump.",
  ],
  winClose: [
    "Traded haymakers with {opp} to the wire.",
    "Won it on the final possession. Barely.",
    "{opp} pushed it to game point. Escaped.",
    "Every bucket answered until the last one.",
    "Gutted it out over {opp}. Ugly. Counts.",
    "An instant classic nobody filmed.",
  ],
  lossClose: [
    "Had {opp} on the ropes. Couldn't close.",
    "Game point three times. Converted zero.",
    "{opp} found one more gear at 10–10.",
    "One possession short. One.",
    "Lost on a shot {opp} will retell forever.",
    "So close the scorekeeper double-checked.",
  ],
  lossBig: [
    "{opp} made it a scrimmage.",
    "It got quiet fast.",
    "{opp} was on a different plane. Visibly.",
    "Over by the third bucket.",
    "A masterclass, delivered at your expense.",
    "{opp} treated it like a teaching clinic.",
  ],
  injury: [
    "Up {ps}–{os} when the ankle gave out.",
    "It ended on a sound, not a shot.",
    "The trainer's sprint said everything.",
  ],
} as const;

/** Lines cycled during the 1.8s "Simulating…" ticker. */
export const TICKER_LINES = [
  "Checking the ball up top…",
  "Scouts pulling up folding chairs…",
  "Rims tightened to regulation spite…",
  "Your flaw is cracking its knuckles…",
  "Boban is stretching. It's genuinely heartwarming…",
  "No refs. No mercy. One ball…",
  "Vegas refuses to set a line…",
  "Chalk toss. Somebody coughs…",
  "The gauntlet doesn't warm up. It waits…",
  "Winner stays. Loser explains…",
  "Somebody's cousin has the aux…",
  "First to 11. Legends don't lose at home…",
];
