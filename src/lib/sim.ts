import { POOL } from "@/data/pool";
import { FLAWS } from "@/data/flaws";
import { gauntletFor } from "@/data/gauntlet";
import { assignArchetype } from "@/data/archetypes";
import { ROASTS } from "@/data/roasts";
import { BEATS } from "@/data/narrative";
import { fnv1a, mulberry32, type Rng } from "@/lib/rng";
import {
  LEGACY_SLOTS,
  POSITIONS,
  SLOTS,
  type BuildCode,
  type Derived,
  type Flaw,
  type PoolEntry,
  type PositionMode,
  type Rung,
  type ResultBand,
  type RungResult,
  type SimResult,
  type SynergyHit,
  type Tag,
} from "@/lib/types";

export const BUDGET = 20;
export const LEGACY_BUDGET = 15;

/* ------------------------------------------------------------------ */
/* Synergies                                                           */
/* ------------------------------------------------------------------ */

type SynergyTarget = "sc" | "rp" | "off" | "def" | "both";

export type SynergyDef = {
  id: string;
  name: string;
  desc: string;
  a: Tag;
  b: Tag;
  target: SynergyTarget;
  amount: number;
};

export const SYNERGIES: SynergyDef[] = [
  { id: "shake-bake", name: "Shake & Bake", desc: "Handles create the shot. The shot never misses.", a: "sniper", b: "shifty", target: "sc", amount: 4 },
  { id: "lob-city", name: "Lob City", desc: "Throw it anywhere near the backboard.", a: "lob", b: "bouncy", target: "rp", amount: 4 },
  { id: "no-fly-zone", name: "No-Fly Zone", desc: "The paint is closed for maintenance.", a: "anchor", b: "motor", target: "def", amount: 3 },
  { id: "gravity-well", name: "Gravity Well", desc: "Shooting bends the defense. Vision punishes it.", a: "sniper", b: "visionary", target: "off", amount: 3 },
  { id: "post-office", name: "Post Office", desc: "Old man game. Always delivers.", a: "strong", b: "crafty", target: "rp", amount: 3 },
  { id: "killer-instinct", name: "Killer Instinct", desc: "Wants the last shot. On both ends.", a: "clutch", b: "dawg", target: "both", amount: 2 },
];

function activeSynergies(entries: PoolEntry[]): SynergyDef[] {
  const tags = new Set<Tag>();
  for (const e of entries) for (const t of e.tags ?? []) tags.add(t);
  return SYNERGIES.filter((s) => tags.has(s.a) && tags.has(s.b));
}

/* ------------------------------------------------------------------ */
/* Rating curve                                                        */
/* ------------------------------------------------------------------ */

/**
 * Maps raw composite scores onto the 2K-style display scale.
 * Piecewise linear, monotone. Tuned (see sim.test.ts) so the best
 * best legal v2 builds land in HOF and an all-$1 build lands near 50.
 * 99 is unreachable by construction — that's the name of the game.
 */
const CURVE: Array<[number, number]> = [
  [0, 20],
  [38, 45],
  [47, 55],
  [62, 74],
  [70, 84],
  [76, 90],
  [80, 93],
  [99, 99],
];

export function curve(x: number): number {
  if (x <= CURVE[0][0]) return CURVE[0][1];
  for (let i = 1; i < CURVE.length; i++) {
    const [x1, y1] = CURVE[i - 1];
    const [x2, y2] = CURVE[i];
    if (x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
  return CURVE[CURVE.length - 1][1];
}

/* ------------------------------------------------------------------ */
/* Derived scores                                                      */
/* ------------------------------------------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function deriveBuild(entries: PoolEntry[], position: PositionMode = "ALL"): Derived {
  const r: Record<string, number> = {};
  for (const e of entries) r[e.slot] = e.rating;

  const syn = activeSynergies(entries);
  const bonus = (target: SynergyTarget) =>
    syn.filter((s) => s.target === target || (s.target === "both" && (target === "off" || target === "def")))
      .reduce((acc, s) => acc + s.amount, 0);

  const legacy = entries.length === LEGACY_SLOTS.length;
  const passing = legacy ? r.iq : r.passing;
  const durability = legacy ? 75 : r.durability;
  let sc = r.jumpshot * (0.6 + 0.4 * (r.handles / 99));
  if (!legacy) sc += (passing - 70) * 0.08;
  let rp = r.finishing * (0.55 + 0.45 * (r.athleticism / 99));
  sc += bonus("sc");
  rp += bonus("rp");

  let offenseRaw = legacy
    ? 0.45 * sc + 0.35 * rp + 0.2 * r.iq
    : 0.42 * sc + 0.3 * rp + 0.16 * r.iq + 0.12 * passing;
  let defenseRaw = r.defense * (0.7 + 0.3 * (r.athleticism / 99));
  offenseRaw += bonus("off");
  defenseRaw += bonus("def");

  const offense = Math.round(curve(offenseRaw));
  const defense = Math.round(curve(defenseRaw));
  const iq = r.iq;
  const profiles: Record<PositionMode, { sc: number; rp: number; off: number; def: number; iq: number; pass: number }> = {
    ALL: { sc: 0, rp: 0, off: 0.5, def: 0.35, iq: 0.1, pass: 0.05 },
    PG: { sc: 0.04, rp: 0, off: 0.49, def: 0.22, iq: 0.12, pass: 0.17 },
    SG: { sc: 0.04, rp: 0, off: 0.55, def: 0.29, iq: 0.1, pass: 0.06 },
    SF: { sc: 0, rp: 0.01, off: 0.47, def: 0.36, iq: 0.1, pass: 0.07 },
    PF: { sc: -0.03, rp: 0.05, off: 0.4, def: 0.43, iq: 0.1, pass: 0.07 },
    C: { sc: -0.07, rp: 0.09, off: 0.35, def: 0.5, iq: 0.08, pass: 0.07 },
  };
  const profile = profiles[position];
  const profileOff = clamp(offense + profile.sc * (curve(sc) - offense) + profile.rp * (curve(rp) - offense), 0, 99);
  const ovr = legacy
    ? clamp(Math.round(0.5 * curve(offenseRaw) + 0.35 * curve(defenseRaw) + 0.15 * iq), 40, 99)
    : clamp(Math.round(profile.off * profileOff + profile.def * defense + profile.iq * iq + profile.pass * passing), 40, 95);
  const playerPower = legacy
    ? 0.6 * curve(offenseRaw) + 0.4 * curve(defenseRaw)
    : 0.57 * profileOff + 0.34 * defense + 0.05 * iq + 0.04 * passing;
  const fatigueMod = legacy ? 0 : clamp((durability - 68) / 16, -2.25, 1.75);

  const synergies: SynergyHit[] = syn.map((s) => ({
    id: s.id,
    name: s.name,
    desc: s.desc,
    bonus: `+${s.amount} ${s.target === "sc" ? "shot creation" : s.target === "rp" ? "rim pressure" : s.target === "off" ? "offense" : s.target === "def" ? "defense" : "both ends"}`,
  }));

  return {
    shotCreation: Math.round(curve(sc)),
    rimPressure: Math.round(curve(rp)),
    offenseRaw,
    defenseRaw,
    offense,
    defense,
    iq,
    passing,
    durability,
    fatigueMod,
    ovr,
    playerPower,
    spend: entries.reduce((a, e) => a + e.price, 0),
    synergies,
  };
}

/* ------------------------------------------------------------------ */
/* Flaw mods                                                           */
/* ------------------------------------------------------------------ */

type FlawTick = { mod: number; fired: boolean; injury: boolean };

function flawTick(flaw: Flaw, rungIdx: number, roll: number, quick: boolean, crafty: boolean, durability: number, legacy = false): FlawTick {
  const e = flaw.effect;
  switch (e.kind) {
    case "lateRung":
      return rungIdx >= e.fromRung ? { mod: -e.amount, fired: true, injury: false } : { mod: 0, fired: false, injury: false };
    case "noShow":
      return roll < e.chance ? { mod: -e.amount, fired: true, injury: false } : { mod: 0, fired: false, injury: false };
    case "slowStart":
      return e.rungs.includes(rungIdx) ? { mod: -e.amount, fired: true, injury: false } : { mod: 0, fired: false, injury: false };
    case "injury":
      return roll < e.chancePerRung * (legacy ? 1 : clamp(1.35 - durability / 115, 0.35, 1))
        ? { mod: 0, fired: true, injury: true }
        : { mod: 0, fired: false, injury: false };
    case "vsQuick":
      return quick ? { mod: -e.amount, fired: true, injury: false } : { mod: 0, fired: false, injury: false };
    case "vsCrafty":
      return crafty ? { mod: -e.amount, fired: true, injury: false } : { mod: 0, fired: false, injury: false };
    case "flat":
      return { mod: -e.amount, fired: roll < 0.3, injury: false };
    case "cardio":
      return rungIdx >= e.fromRung
        ? { mod: -(rungIdx - e.fromRung + 1) * e.perRung, fired: true, injury: false }
        : { mod: 0, fired: false, injury: false };
    case "whistle":
      return roll < e.chance ? { mod: -e.amount, fired: true, injury: false } : { mod: 0, fired: false, injury: false };
    case "heroBall":
      if (rungIdx <= 3) return { mod: e.earlyBonus, fired: false, injury: false };
      if (rungIdx >= e.lateRungs) return { mod: -e.latePenalty, fired: true, injury: false };
      return { mod: 0, fired: false, injury: false };
  }
}

/* ------------------------------------------------------------------ */
/* The gauntlet                                                        */
/* ------------------------------------------------------------------ */

const fill = (t: string, opp: string, ps?: number, os?: number) =>
  t.replace("{opp}", opp).replace("{ps}", String(ps ?? 0)).replace("{os}", String(os ?? 0));

const pickAt = <T,>(arr: readonly T[], roll: number): T => arr[Math.min(arr.length - 1, Math.floor(roll * arr.length))];

/** Everything the gauntlet needs from a build — shared by v2 Derived and v3 StealDerived. */
export type GauntletInput = { playerPower: number; fatigueMod: number; durability: number };

/**
 * `flatInjuryRisk` skips the durability scaling on injury flaws — true for v1
 * (no durability slot yet) and for v3 (durability removed; the flaw carries it).
 * `flaw` is null for v4 classic/daily runs — no flaw ticks, ever.
 */
export function runGauntlet(derived: GauntletInput, flaw: Flaw | null, simSeed: number, gauntlet: Rung[], flatInjuryRisk = false): { rungs: RungResult[]; fellAt: number | null; injured: boolean } {
  const legacy = flatInjuryRisk;
  const rng: Rng = mulberry32(simSeed);
  const rungs: RungResult[] = [];
  let fellAt: number | null = null;
  let injured = false;

  for (const opp of gauntlet) {
    // Fixed per-rung draw order — determinism depends on this.
    const variance = rng() * 6 - 3;
    const flawRoll = rng();
    const winRoll = rng();
    const scoreNoise = rng();
    const quipRoll = rng();
    const beatRoll = rng();

    const tick: FlawTick = flaw
      ? flawTick(flaw, opp.rung, flawRoll, !!opp.quick, !!opp.crafty, derived.durability, legacy)
      : { mod: 0, fired: false, injury: false };

    if (tick.injury) {
      const ps = 3 + Math.floor(scoreNoise * 6);
      const os = Math.max(0, ps - 1 - Math.floor(quipRoll * 3));
      rungs.push({
        rung: opp.rung,
        oppId: opp.id,
        win: false,
        playerScore: ps,
        oppScore: os,
        beat: fill(pickAt(BEATS.injury, beatRoll), opp.shortName, ps, os),
        flawFired: true,
        injuryEnd: true,
      });
      fellAt = opp.rung;
      injured = true;
      break;
    }

    const fatigue = opp.rung >= 6 ? derived.fatigueMod * (opp.rung - 5) : 0;
    const diff = derived.playerPower - opp.power + tick.mod + fatigue + variance;
    const p = 1 / (1 + Math.exp(-diff / 6));
    const win = winRoll < p;

    const effDiff = Math.abs(diff);
    const loserScore = clamp(Math.round(10 - effDiff * 0.7 - scoreNoise * 2), 0, 10);
    const playerScore = win ? 11 : loserScore;
    const oppScore = win ? loserScore : 11;
    const close = loserScore >= 8;

    let beat: string;
    if (flaw && tick.fired && (!win || flaw.effect.kind === "noShow" || flaw.effect.kind === "whistle")) {
      beat = fill(pickAt(flaw.templates, beatRoll), opp.shortName);
    } else if (quipRoll < 0.4) {
      beat = pickAt(win ? opp.winQuips : opp.lossQuips, beatRoll);
    } else {
      const pool = win ? (close ? BEATS.winClose : BEATS.winBig) : close ? BEATS.lossClose : BEATS.lossBig;
      beat = fill(pickAt(pool, beatRoll), opp.shortName);
    }

    rungs.push({
      rung: opp.rung,
      oppId: opp.id,
      win,
      playerScore,
      oppScore,
      beat,
      flawFired: tick.fired,
      injuryEnd: false,
    });

    if (!win) {
      fellAt = opp.rung;
      break;
    }
  }

  return { rungs, fellAt, injured };
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                       */
/* ------------------------------------------------------------------ */

export function bandFor(fellAt: number | null): ResultBand {
  if (fellAt === null) return "cleared";
  if (fellAt <= 2) return "out1";
  if (fellAt <= 5) return "early";
  if (fellAt <= 8) return "deep";
  return "door";
}

export function entriesFor(build: BuildCode): PoolEntry[] | null {
  const entries: PoolEntry[] = [];
  const slots = build.v === 1 ? LEGACY_SLOTS : SLOTS;
  for (let i = 0; i < slots.length; i++) {
    const e = POOL[slots[i]][build.picks[i]];
    if (!e) return null;
    entries.push(e);
  }
  return entries;
}

export function validateBuild(build: BuildCode): boolean {
  if (build.v !== 1 && build.v !== 2) return false;
  const slots = build.v === 1 ? LEGACY_SLOTS : SLOTS;
  if (build.picks.length !== slots.length) return false;
  const entries = entriesFor(build);
  if (!entries) return false;
  if (build.flaw < 0 || build.flaw >= (build.v === 1 ? 10 : FLAWS.length)) return false;
  const budget = build.v === 1 ? LEGACY_BUDGET : BUDGET + FLAWS[build.flaw].refund;
  if (entries.reduce((a, e) => a + e.price, 0) > budget) return false;
  if (build.v === 2) {
    const position = build.position ?? "ALL";
    if (position !== "ALL" && !POSITIONS.includes(position)) return false;
    if (position !== "ALL" && entries.some((entry) => !entry.positions.includes(position))) return false;
  }
  return true;
}

export function simSeedFor(build: BuildCode): number {
  const entries = entriesFor(build);
  if (!entries) return 0;
  const ids = entries.map((e) => e.id).join(".");
  const flawId = FLAWS[build.flaw].id;
  const dailyKey = build.mode === "daily" ? `d${build.daily}` : "";
  const positionKey = build.v === 2 ? `#${build.position ?? "ALL"}` : "";
  return fnv1a(`${ids}#${flawId}#${build.mode}#${dailyKey}${positionKey}#${build.attempt}`);
}

export function pickRoast(simSeed: number, archetypeId: string, band: ResultBand, flawId: string, flawDecisive: boolean): string {
  const rng = mulberry32((simSeed ^ 0x9e3779b9) >>> 0);
  const flawLines = ROASTS.flaw[flawId];
  if (flawDecisive && flawLines?.length && rng() < 0.45) return pickAt(flawLines, rng());
  const lines = ROASTS.archetype[archetypeId]?.[band] ?? ROASTS.generic[band];
  return pickAt(lines, rng());
}

/** The whole game, purely: build in, story out. Same build ⇒ same story. */
export function simulate(build: BuildCode): SimResult | null {
  if (!validateBuild(build)) return null;
  const entries = entriesFor(build)!;
  const flaw = FLAWS[build.flaw];
  const derived = deriveBuild(entries, build.position ?? "ALL");
  const simSeed = simSeedFor(build);
  const gauntlet = gauntletFor(build.position, build.v);
  const { rungs, fellAt, injured } = runGauntlet(derived, flaw, simSeed, gauntlet, build.v === 1);
  const band = bandFor(fellAt);
  const archetype = assignArchetype(derived, build.v === 1 ? undefined : flaw);
  const last = rungs[rungs.length - 1];
  const flawDecisive = fellAt !== null && !!last && last.flawFired;
  const roast = pickRoast(simSeed, archetype.id, band, flaw.id, flawDecisive);
  return { build, entries, flaw, derived, rungs, fellAt, injured, band, archetype, roast, simSeed, gauntlet };
}
