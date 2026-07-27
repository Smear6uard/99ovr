import { BUCKETS } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { GAUNTLET } from "@/data/gauntlet";
import { ARCHETYPES } from "@/data/archetypes";
import { fnv1a, mulberry32 } from "@/lib/rng";
import { bandFor, curve, pickRoast, runGauntlet } from "@/lib/sim";
import { gradeFor, gradeScore, verdictFor } from "@/lib/grade";
import { ROUNDS, minSpinsFor, spinsAffordable, tokensFor } from "@/lib/wheel";
import {
  ATTRS,
  ATTR_LABELS,
  type Archetype,
  type AttrId,
  type EraBucket,
  type EraPlayer,
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
  if (build.v !== 3) return false;
  if (build.flaw < 0 || build.flaw >= FLAWS.length) return false;
  if (!Array.isArray(build.steals) || build.steals.length !== ROUNDS) return false;

  const tokens = tokensFor(FLAWS[build.flaw]);
  const used = { team: 0, era: 0 };
  const people = new Set<string>();

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
      spins: minSpinsFor(build.seed, round, bucketIdx)!,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Derived                                                             */
/* ------------------------------------------------------------------ */

export function deriveSteals(steals: Steal[]): StealDerived {
  const ratings = {} as Record<AttrId, number>;
  for (const steal of steals) ratings[steal.attr] = steal.rating;

  const syn = activeSynergies(ratings, steals);
  const bonus = (target: SynergyTarget) =>
    syn
      .filter((s) => s.target === target || (s.target === "both" && (target === "off" || target === "def")))
      .reduce((acc, s) => acc + s.amount, 0);

  const { jumpshot, handles, finishing, playmaking, defense, athleticism } = ratings;

  const shotCreationRaw = jumpshot * (0.6 + 0.4 * (handles / 99)) + bonus("sc");
  const rimPressureRaw = finishing * (0.55 + 0.45 * (athleticism / 99)) + bonus("rp");
  const offenseRaw = 0.42 * shotCreationRaw + 0.3 * rimPressureRaw + 0.28 * playmaking + bonus("off");
  const defenseRaw = defense * (0.7 + 0.3 * (athleticism / 99)) + bonus("def");

  const offense = Math.round(curve(offenseRaw));
  const defenseScore = Math.round(curve(defenseRaw));
  const ovr = clamp(Math.round(0.52 * offense + 0.36 * defenseScore + 0.12 * playmaking), 40, 98);

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
  return fnv1a(`${ids}#${FLAWS[build.flaw].id}#${build.mode}#${dailyKey}#${build.attempt}`);
}

/** The whole v3 game, purely: build in, story out. Same build ⇒ same story. */
export function simulateSteals(build: StealBuild): StealResult | null {
  const steals = stealsFor(build);
  if (!steals) return null;

  const flaw = FLAWS[build.flaw];
  const derived = deriveSteals(steals);
  const simSeed = stealSimSeed(build, steals);
  const gauntlet = GAUNTLET;
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
  const roast = pickRoast(simSeed, archetype.id, band, flaw.id, flawDecisive);

  const ranked = [...steals].sort(
    (a, b) => gradeScore(b.grade) - gradeScore(a.grade) || b.rating - a.rating
  );

  return {
    build,
    steals,
    flaw,
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
