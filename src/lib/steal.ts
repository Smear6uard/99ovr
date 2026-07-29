import { BUCKETS } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { GAUNTLET, POSITION_GAUNTLETS } from "@/data/gauntlet";
import { ARCHETYPES } from "@/data/archetypes";
import { fnv1a, mulberry32 } from "@/lib/rng";
import { bandFor, curve, pickRoast, runGauntlet } from "@/lib/sim";
import { gradeFor, gradeScore, verdictFor } from "@/lib/grade";
import { ROUNDS, V4_TOKENS, minSpinsFor, spinsAffordable, tokensFor } from "@/lib/wheel";
import {
  ATTRS,
  ATTR_LABELS,
  POSITIONS,
  type Archetype,
  type AttrId,
  type EraBucket,
  type EraPlayer,
  type PositionMode,
  type Price,
  type Steal,
  type StealBuild,
  type StealDerived,
  type StealResult,
  type SynergyHit,
} from "@/lib/types";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ------------------------------------------------------------------ */
/* Synergies — thresholds on the stolen ratings, so no per-player tags  */
/* ------------------------------------------------------------------ */

type SynergyTarget = "sc" | "rp" | "off" | "def" | "both";

type StealSynergy = {
  id: string;
  name: string;
  desc: string;
  target: SynergyTarget;
  amount: number;
  test: (r: Record<AttrId, number>, steals: Steal[]) => boolean;
};

const decadesOf = (steals: Steal[]) => steals.map((s) => s.bucket.decade);

export const STEAL_SYNERGIES: StealSynergy[] = [
  { id: "shake-bake", name: "Shake & Bake", desc: "Handles create the shot. The shot never misses.", target: "sc", amount: 4, test: (r) => r.jumpshot >= 86 && r.handles >= 86 },
  { id: "lob-city", name: "Lob City", desc: "Throw it anywhere near the backboard.", target: "rp", amount: 4, test: (r) => r.finishing >= 86 && r.athleticism >= 88 },
  { id: "no-fly-zone", name: "No-Fly Zone", desc: "The paint is closed for maintenance.", target: "def", amount: 3, test: (r) => r.defense >= 88 && r.athleticism >= 84 },
  { id: "gravity-well", name: "Gravity Well", desc: "Shooting bends the defense. Vision punishes it.", target: "off", amount: 3, test: (r) => r.jumpshot >= 88 && r.playmaking >= 84 },
  { id: "post-office", name: "Post Office", desc: "Old man game. Always delivers.", target: "rp", amount: 3, test: (r) => r.finishing >= 88 && r.playmaking >= 76 },
  { id: "killer-instinct", name: "Killer Instinct", desc: "No hole in the game to attack.", target: "both", amount: 2, test: (r) => ATTRS.every((a) => r[a] >= 74) },
  { id: "time-machine", name: "Time Machine", desc: "Stole across the whole history of the sport.", target: "both", amount: 2, test: (_r, steals) => new Set(decadesOf(steals)).size >= 4 },
  {
    id: "same-era", name: "Same Era Squad", desc: "One decade. One style. One body.", target: "off", amount: 3,
    test: (_r, steals) => {
      const counts = new Map<number, number>();
      for (const decade of decadesOf(steals)) counts.set(decade, (counts.get(decade) ?? 0) + 1);
      return [...counts.values()].some((n) => n >= 3);
    },
  },
];

function activeSynergies(ratings: Record<AttrId, number>, steals: Steal[]): StealSynergy[] {
  return STEAL_SYNERGIES.filter((s) => s.test(ratings, steals));
}

/* ------------------------------------------------------------------ */
/* Budget mode — prices                                                */
/* ------------------------------------------------------------------ */

/** The whole run's wallet. Flaw severity refunds land after the wheel. */
export const STEAL_BUDGET = 20;
/** The weakness wheel interrupts after this many steals. */
export const WHEEL_AFTER = 3;

/** Same bands the original priced pool used: $5 93+ · $4 86+ · $3 78+ · $2 68+ · $1 below. */
export function priceForRating(rating: number): Price {
  if (rating >= 93) return 5;
  if (rating >= 86) return 4;
  if (rating >= 78) return 3;
  if (rating >= 68) return 2;
  return 1;
}

/**
 * Band price, except the roster's worst at the attribute is always the $1
 * minimum contract — every roster stays affordable, every round.
 */
export function priceIn(bucket: EraBucket, attrIdx: number, playerIdx: number): Price {
  const rating = bucket.players[playerIdx].r[attrIdx];
  const min = Math.min(...bucket.players.map((p) => p.r[attrIdx]));
  return rating === min ? 1 : priceForRating(rating);
}

/** Dollars available on a given round — the refund arrives with the wheel. */
export function budgetCapAt(round: number, refund: number): number {
  return STEAL_BUDGET + (round >= WHEEL_AFTER ? refund : 0);
}

/**
 * A Budget pick is legal only if it leaves $1 for every remaining round.
 * Combined with the minimum-contract rule, a run can never wedge itself broke.
 */
export function canAffordSteal(spentBefore: number, price: number, round: number, refund: number): boolean {
  return spentBefore + price <= budgetCapAt(round, refund) - (ROUNDS - 1 - round);
}

/* ------------------------------------------------------------------ */
/* Grading                                                             */
/* ------------------------------------------------------------------ */

/** Players with a strictly better rating — ties take the best rank. */
export function rankIn(bucket: EraBucket, attrIdx: number, rating: number): number {
  return bucket.players.filter((p) => p.r[attrIdx] > rating).length;
}

export function bestIn(bucket: EraBucket, attrIdx: number): EraPlayer {
  return bucket.players.reduce((a, b) => (b.r[attrIdx] > a.r[attrIdx] ? b : a));
}

/* ------------------------------------------------------------------ */
/* Validation and assembly                                             */
/* ------------------------------------------------------------------ */

export function validateSteals(build: StealBuild): boolean {
  if (build.v !== 3 && build.v !== 4) return false;
  if (!Array.isArray(build.steals) || build.steals.length !== ROUNDS) return false;

  const v4 = build.v === 4;
  if (v4) {
    if (build.mode !== "classic" && build.mode !== "daily" && build.mode !== "budget") return false;
    const target = build.target ?? "ALL";
    if (target !== "ALL" && !POSITIONS.includes(target)) return false;
    if (build.mode === "budget") {
      if (build.flaw < 0 || build.flaw >= FLAWS.length) return false;
    } else if (build.flaw !== -1) {
      return false;
    }
  } else {
    if (build.mode !== "sandbox" && build.mode !== "daily") return false;
    if (build.flaw < 0 || build.flaw >= FLAWS.length) return false;
  }

  const tokens = v4 ? V4_TOKENS : tokensFor(FLAWS[build.flaw]);
  const budgetMode = v4 && build.mode === "budget";
  const refund = budgetMode ? FLAWS[build.flaw].refund : 0;
  const used = { team: 0, era: 0 };
  const people = new Set<string>();
  let spent = 0;

  for (let round = 0; round < ROUNDS; round++) {
    const pair = build.steals[round];
    if (!pair || pair.length !== 2) return false;
    const [bucketIdx, playerIdx] = pair;
    const bucket = BUCKETS[bucketIdx];
    if (!bucket) return false;
    const player = bucket.players[playerIdx];
    if (!player) return false;
    if (people.has(player.person)) return false;
    people.add(player.person);

    const spins = minSpinsFor(build.seed, round, bucketIdx);
    if (!spins) return false;
    used.team += spins.team;
    used.era += spins.era;

    if (budgetMode) {
      const price = priceIn(bucket, round, playerIdx);
      if (!canAffordSteal(spent, price, round, refund)) return false;
      spent += price;
    }
  }

  return spinsAffordable(used, tokens);
}

export function stealsFor(build: StealBuild): Steal[] | null {
  if (!validateSteals(build)) return null;
  const verdictRng = mulberry32(fnv1a(`verdict:${build.seed}:${build.flaw}`));
  return ATTRS.map((attr, round) => {
    const [bucketIdx, playerIdx] = build.steals[round];
    const bucket = BUCKETS[bucketIdx];
    const player = bucket.players[playerIdx];
    const rating = player.r[round];
    const rank = rankIn(bucket, round, rating);
    const best = bestIn(bucket, round);
    const grade = gradeFor(rank, bucket.players.length);
    const verdict = verdictFor(grade, verdictRng(), {
      p: player.name,
      b: best.name,
      a: ATTR_LABELS[attr].toLowerCase(),
      t: bucket.label,
    });
    return {
      attr,
      bucket,
      player,
      rating,
      rank,
      best,
      grade,
      verdict,
      price: priceIn(bucket, round, playerIdx),
      spins: minSpinsFor(build.seed, round, bucketIdx)!,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Derived                                                             */
/* ------------------------------------------------------------------ */

/**
 * Positional scoring weights. `ALL` is byte-identical to the v3 formula —
 * old codes replay unchanged. A positional target re-weights what counts:
 * C trades shot creation for rim pressure and defense, PG buys playmaking
 * and creation, and so on down the line.
 */
type TargetProfile = { sc: number; rp: number; play: number; oOff: number; oDef: number; oPlay: number };

export const TARGET_PROFILES: Record<PositionMode, TargetProfile> = {
  ALL: { sc: 0.42, rp: 0.3, play: 0.28, oOff: 0.52, oDef: 0.36, oPlay: 0.12 },
  PG: { sc: 0.46, rp: 0.18, play: 0.36, oOff: 0.54, oDef: 0.28, oPlay: 0.18 },
  SG: { sc: 0.5, rp: 0.28, play: 0.22, oOff: 0.56, oDef: 0.32, oPlay: 0.12 },
  SF: { sc: 0.44, rp: 0.32, play: 0.24, oOff: 0.5, oDef: 0.38, oPlay: 0.12 },
  PF: { sc: 0.34, rp: 0.44, play: 0.22, oOff: 0.46, oDef: 0.44, oPlay: 0.1 },
  C: { sc: 0.24, rp: 0.54, play: 0.22, oOff: 0.42, oDef: 0.5, oPlay: 0.08 },
};

export function deriveSteals(steals: Steal[], target: PositionMode = "ALL"): StealDerived {
  const ratings = {} as Record<AttrId, number>;
  for (const steal of steals) ratings[steal.attr] = steal.rating;

  const syn = activeSynergies(ratings, steals);
  const bonus = (target: SynergyTarget) =>
    syn
      .filter((s) => s.target === target || (s.target === "both" && (target === "off" || target === "def")))
      .reduce((acc, s) => acc + s.amount, 0);

  const { jumpshot, handles, finishing, playmaking, defense, athleticism } = ratings;
  const profile = TARGET_PROFILES[target] ?? TARGET_PROFILES.ALL;

  const shotCreationRaw = jumpshot * (0.6 + 0.4 * (handles / 99)) + bonus("sc");
  const rimPressureRaw = finishing * (0.55 + 0.45 * (athleticism / 99)) + bonus("rp");
  const offenseRaw =
    profile.sc * shotCreationRaw + profile.rp * rimPressureRaw + profile.play * playmaking + bonus("off");
  const defenseRaw = defense * (0.7 + 0.3 * (athleticism / 99)) + bonus("def");

  const offense = Math.round(curve(offenseRaw));
  const defenseScore = Math.round(curve(defenseRaw));
  const ovr = clamp(
    Math.round(profile.oOff * offense + profile.oDef * defenseScore + profile.oPlay * playmaking),
    40,
    98
  );

  const synergies: SynergyHit[] = syn.map((s) => ({
    id: s.id,
    name: s.name,
    desc: s.desc,
    bonus: `+${s.amount} ${s.target === "sc" ? "shot creation" : s.target === "rp" ? "rim pressure" : s.target === "off" ? "offense" : s.target === "def" ? "defense" : "both ends"}`,
  }));

  return {
    ratings,
    shotCreation: Math.round(curve(shotCreationRaw)),
    rimPressure: Math.round(curve(rimPressureRaw)),
    offenseRaw,
    defenseRaw,
    offense,
    defense: defenseScore,
    playmaking,
    athleticism,
    fatigueMod: clamp((athleticism - 68) / 16, -2.25, 1.75),
    ovr,
    playerPower: 0.57 * offense + 0.34 * defenseScore + 0.09 * playmaking,
    synergies,
  };
}

/* ------------------------------------------------------------------ */
/* Archetype                                                           */
/* ------------------------------------------------------------------ */

export function assignStealArchetype(d: StealDerived, steals: Steal[]): Archetype {
  const grades = steals.map((s) => gradeScore(s.grade));
  const aRange = grades.filter((g) => g >= 9).length;
  const failing = grades.filter((g) => g <= 2).length;
  const decades = new Set(steals.map((s) => s.bucket.decade));
  const r = d.ratings;

  if (aRange >= 5) return ARCHETYPES.connoisseur;
  if (failing >= 4) return ARCHETYPES.reacher;
  if (d.offense >= 85 && d.defense >= 85) return ARCHETYPES["two-way-demon"];
  if (r.playmaking >= 90 && d.offense >= 78) return ARCHETYPES["point-god"];
  if (d.offense >= 85 && d.defense <= 65) return ARCHETYPES["glass-cannon"];
  if (d.defense >= 88 && d.offense <= 68) return ARCHETYPES.lockdown;
  if (decades.size >= 5) return ARCHETYPES["time-traveler"];
  if (decades.size <= 2) return ARCHETYPES["era-purist"];
  if (d.rimPressure >= d.shotCreation + 12 && d.offense >= 72) return ARCHETYPES["bully-ball"];
  if (d.shotCreation >= d.rimPressure + 12 && r.playmaking <= 62 && d.offense >= 72) return ARCHETYPES.microwave;
  if (d.synergies.length >= 2) return ARCHETYPES["theory-crafter"];
  if (failing >= 2) return ARCHETYPES["box-score-scout"];
  if (d.ovr >= 78) return ARCHETYPES["certified-starter"];
  if (d.ovr >= 62) return ARCHETYPES["glue-guy"];
  return ARCHETYPES["ten-day"];
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                       */
/* ------------------------------------------------------------------ */

export function stealSimSeed(build: StealBuild, steals: Steal[]): number {
  const ids = steals.map((s) => s.player.id).join(".");
  const dailyKey = build.mode === "daily" ? `d${build.daily}` : "";
  if (build.v === 4) {
    const flawId = build.flaw >= 0 ? FLAWS[build.flaw].id : "none";
    return fnv1a(`${ids}#${flawId}#v4:${build.mode}#${build.target ?? "ALL"}#${dailyKey}#${build.attempt}`);
  }
  return fnv1a(`${ids}#${FLAWS[build.flaw].id}#${build.mode}#${dailyKey}#${build.attempt}`);
}

/** The whole spin-steal game, purely: build in, story out. Same build ⇒ same story. */
export function simulateSteals(build: StealBuild): StealResult | null {
  const steals = stealsFor(build);
  if (!steals) return null;

  const flaw = build.flaw >= 0 ? FLAWS[build.flaw] : null;
  const target: PositionMode = build.v === 4 ? (build.target ?? "ALL") : "ALL";
  const derived = deriveSteals(steals, target);
  const simSeed = stealSimSeed(build, steals);
  const gauntlet = target !== "ALL" ? POSITION_GAUNTLETS[target] : GAUNTLET;
  const { rungs, fellAt, injured } = runGauntlet(
    { playerPower: derived.playerPower, fatigueMod: derived.fatigueMod, durability: 75 },
    flaw,
    simSeed,
    gauntlet,
    true
  );
  const band = bandFor(fellAt);
  const archetype = assignStealArchetype(derived, steals);
  const last = rungs[rungs.length - 1];
  const flawDecisive = fellAt !== null && !!last && last.flawFired;
  const roast = pickRoast(simSeed, archetype.id, band, flaw?.id ?? "none", flawDecisive);

  const ranked = [...steals].sort(
    (a, b) => gradeScore(b.grade) - gradeScore(a.grade) || b.rating - a.rating
  );
  const budgetMode = build.v === 4 && build.mode === "budget";

  return {
    build,
    steals,
    flaw,
    spent: budgetMode ? steals.reduce((acc, s) => acc + s.price, 0) : 0,
    refund: budgetMode && flaw ? flaw.refund : 0,
    gradePoints: steals.reduce((acc, s) => acc + gradeScore(s.grade), 0),
    derived,
    rungs,
    fellAt,
    injured,
    band,
    archetype,
    roast,
    simSeed,
    gauntlet,
    bestSteal: ranked[0],
    reach: ranked[ranked.length - 1],
  };
}
