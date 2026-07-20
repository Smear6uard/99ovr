import type { ResultBand } from "@/lib/types";

/**
 * One roast appears on every result card. This is the #1 screenshot surface.
 * Keyed by archetype × result band, with flaw lines used when the flaw
 * decided the fatal rung, and generic band lines as the safety net.
 * Bands: out1 = fell rung 1–2 · early = 3–5 · deep = 6–8 · door = 9–10 · cleared.
 */
export const ROASTS: {
  archetype: Record<string, Partial<Record<ResultBand, string[]>>>;
  generic: Record<ResultBand, string[]>;
  flaw: Record<string, string[]>;
} = {
  archetype: {
    "two-way-demon": {
      early: ["Elite on both ends. Eliminated on one of them.", "Locked up both ends. Got cooked anyway. Basketball is cruel."],
      deep: ["A cheat code with one missing button."],
      door: ["Built perfect. Died at the boss anyway. That's the tax.", "Two-way everything, one loss from immortality."],
      cleared: ["Both ends. All ten rungs. Patch this build immediately.", "The league office called. They want your receipt."],
    },
    "point-god": {
      early: ["Saw every pass coming. Never saw the L coming."],
      deep: ["Ran the offense beautifully. Forgot it's 1v1 out here."],
      door: ["Elite vision, and the only thing he didn't see was Rung 9."],
      cleared: ["Processed the whole gauntlet like a film session. Ten wins."],
    },
    "glass-cannon": {
      out1: ["All offense, no brakes, crashed on the first turn."],
      early: ["Scored 40 a night until someone scored 41."],
      deep: ["Traded buckets with legends until the register ran out."],
      door: ["Offense wins games. Defense wins Rung 9. He had one.", "Outscored everyone until the one guy he couldn't."],
    },
    "lockdown": {
      early: ["Locked the front door. They came through a window."],
      deep: ["Held legends under 11. Just couldn't get there himself."],
      door: ["The stop was there all night. The bucket never came."],
      cleared: ["Ten legends, zero rhythm allowed. A defensive heist."],
    },
    "bully-ball": {
      early: ["Bullied kids at recess. Then recess ended."],
      deep: ["Dunked everything until the paint filled with Hall of Famers."],
      door: ["Muscle got him to the door. The door was locked."],
    },
    "microwave": {
      out1: ["Preheated for nothing."],
      early: ["Instant offense. Instant exit."],
      deep: ["Cooked for six rungs. Then the power went out."],
    },
    "budget-baller": {
      out1: ["Spent $6. Got $6 worth."],
      early: ["The dollar menu took him further than expected. Not far."],
      deep: ["Nine dollars deep into the gauntlet. Genuinely inspirational."],
      door: ["A budget build at the door of immortality. Scouts are weeping."],
      cleared: ["Cleared the gauntlet on pocket change. Uninsurable. Unstoppable."],
    },
    "theory-crafter": {
      out1: ["The spreadsheet said this couldn't happen."],
      early: ["The synergies worked in the lab. The gauntlet is a field test."],
      deep: ["The math checked out. The legend was better."],
      door: ["Min-maxed all the way to the door. Variance said no."],
      cleared: ["The forums were right. The build is real."],
    },
    "certified-starter": {
      early: ["A solid pro walked into a hall of fame. It went as expected."],
      deep: ["Respectable everywhere. Feared nowhere."],
      door: ["A starter knocked on immortality's door. Nobody answered."],
    },
    "glue-guy": {
      out1: ["The little things didn't include scoring."],
      early: ["Glue melts under playoff lights."],
      deep: ["The glue held for six whole rungs. Premium adhesive."],
    },
    "ten-day": {
      out1: ["Cooked by Boban. Boban felt bad about it.", "The 10-day contract lasted one rung."],
      early: ["Made it further than the front office expected. Still cut."],
      deep: ["Someone tell the G-League a legend is coming back down."],
    },
  },
  generic: {
    out1: [
      "Gone before the gym got warm.",
      "The warmup lasted longer than the run.",
      "First rung. FIRST rung.",
    ],
    early: [
      "A cameo, not a career.",
      "Showed flashes. Mostly of the exit sign.",
      "The gauntlet ate and said thank you.",
    ],
    deep: [
      "A real run. A realer wall.",
      "Six deep is nothing to delete the screenshot over.",
      "Went out swinging against immortals.",
    ],
    door: [
      "One rung from forever. That one stings.",
      "So close the banners were being printed.",
      "Died at the door with the key in hand.",
    ],
    cleared: [
      "Ten rungs. Zero losses. Frame it and retire.",
      "The gauntlet will tell its kids about this one.",
      "Immortal. No notes.",
    ],
  },
  flaw: {
    "bricklayer": [
      "Lost at the line. The rim wasn't even involved.",
      "Free throws: the only shot nobody contests. Bricked anyway.",
    ],
    "load-mgmt": [
      "Rested right through the biggest game of his life.",
      "The hamstring was fine. The vibes were questionable.",
    ],
    "slow-starter": [
      "Lost the game during warmups.",
      "Woke up down eight. Stayed asleep.",
    ],
    "glass-ankles": [
      "The build was perfect. The ankles were rented.",
      "Injury report: heartbreak.",
    ],
    "matador": [
      "Waved the winning bucket through. Politely.",
      "Defense was optional. He declined.",
    ],
    "tunnel-vision": [
      "Never saw the help defense. Or the loss coming.",
      "The open man is still open.",
    ],
    "stone-hands": [
      "The ball asked for a trade.",
      "Dropped the game. Literally.",
    ],
    "cardio-2004": [
      "Gassed at the finish line. Again.",
      "Conditioning is a skill. An unpurchased one.",
    ],
    "whistle-magnet": [
      "Fouled out of a 1v1. Innovative.",
      "Argued the call. Lost the game. Won nothing.",
    ],
    "hero-ball": [
      "Hero shot. Villain result.",
      "The movie ended in the trailer.",
    ],
  },
};
