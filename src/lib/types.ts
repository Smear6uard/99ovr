export const LEGACY_SLOTS = [
  "jumpshot",
  "handles",
  "finishing",
  "defense",
  "athleticism",
  "iq",
] as const;

export const SLOTS = [...LEGACY_SLOTS, "passing", "durability"] as const;

export type SlotId = (typeof SLOTS)[number];

export const SLOT_LABELS: Record<SlotId, string> = {
  jumpshot: "Jumpshot",
  handles: "Handles",
  finishing: "Finishing",
  defense: "Defense",
  athleticism: "Athleticism",
  iq: "IQ",
  passing: "Passing",
  durability: "Durability",
};

export const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
export type Position = (typeof POSITIONS)[number];
export type PositionMode = Position | "ALL";
export const POSITION_LABELS: Record<Position, string> = {
  PG: "POINT GUARD", SG: "SHOOTING GUARD", SF: "SMALL FORWARD", PF: "POWER FORWARD", C: "CENTER",
};

export type Price = 1 | 2 | 3 | 4 | 5;

export type Tag =
  | "sniper"
  | "shifty"
  | "bouncy"
  | "lob"
  | "strong"
  | "crafty"
  | "anchor"
  | "motor"
  | "visionary"
  | "dawg"
  | "clutch";

export type PoolEntry = {
  id: string;
  name: string;
  slot: SlotId;
  price: Price;
  /** Hidden rating. Bands: $5 93–99 · $4 86–92 · $3 78–85 · $2 68–77 · $1 45–64 */
  rating: number;
  tags?: Tag[];
  positions: Position[];
  /** Short, pre-authored card stat strip; two or three numbers max. */
  stats: string[];
};

/* ------------------------------------------------------------------ */
/* v3 — Six Steals                                                     */
/* ------------------------------------------------------------------ */

/** The six stealable attributes, in round order. Encoding-stable. */
export const ATTRS = ["jumpshot", "handles", "finishing", "playmaking", "defense", "athleticism"] as const;

export type AttrId = (typeof ATTRS)[number];

export const ATTR_LABELS: Record<AttrId, string> = {
  jumpshot: "Jumpshot",
  handles: "Handles",
  finishing: "Finishing",
  playmaking: "Playmaking",
  defense: "Defense",
  athleticism: "Athleticism",
};

export const ATTR_ABBR: Record<AttrId, string> = {
  jumpshot: "JS",
  handles: "HND",
  finishing: "FIN",
  playmaking: "PLY",
  defense: "DEF",
  athleticism: "ATH",
};

/** Hidden per-attribute ratings, in ATTRS order. */
export type Ratings = readonly [number, number, number, number, number, number];

export type EraVibe = "iconic" | "solid" | "rough";

export type EraPlayer = {
  /** unique within the bucket */
  id: string;
  /** dedup key across buckets — the same human is one steal, everywhere */
  person: string;
  name: string;
  /** display box line, e.g. "30.4 PPG · 6.6 RPG · 4.3 APG" */
  line: string;
  /** one signature line of flavor */
  note: string;
  r: Ratings;
};

export type EraBucket = {
  id: string;
  franchise: string;
  /** reel word, e.g. "BULLS" */
  team: string;
  /** reel word, e.g. "1996" */
  season: string;
  /** "1996 BULLS" */
  label: string;
  decade: number;
  vibe: EraVibe;
  /** era-card flavor line */
  tag: string;
  players: EraPlayer[];
};

export type Franchise = {
  id: string;
  team: string;
  /** bucket indices into BUCKETS, ordered oldest → newest */
  eras: number[];
};

export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "F";

export type Steal = {
  attr: AttrId;
  bucket: EraBucket;
  player: EraPlayer;
  rating: number;
  /** 0-indexed dense rank of `rating` within the bucket for `attr` */
  rank: number;
  /** the roster's best at this attribute — what you left on the table */
  best: EraPlayer;
  grade: Grade;
  verdict: string;
  /** what this skill costs in Budget mode — derived from the hidden rating */
  price: Price;
  /** team re-spins and era re-spins spent to reach this bucket */
  spins: { team: number; era: number };
};

/**
 * v4 mode set. `classic` is the setup-sheet sandbox, `budget` the priced run
 * with the mid-run weakness wheel. v3 codes carry "sandbox" | "daily".
 */
export type StealMode = "classic" | "daily" | "budget";
export type StealGameMode = GameMode | StealMode;

/** The encodable spin-steal run — v3 (flaw economy), v4 (four modes), v5 (decade wheel). */
export type StealBuild = {
  v: 3 | 4 | 5;
  mode: StealGameMode;
  seed: number;
  /** index into FLAWS · −1 in v4 classic/daily (no flaw outside Budget) */
  flaw: number;
  /** v4 build target — "ALL" is BEST PLAYER, else the positional challenge. v3 omits it. */
  target?: PositionMode;
  /** [bucketIdx, playerIdx] per round, in ATTRS order — indices into poolFor(v) */
  steals: Array<[number, number]>;
  attempt: number;
  daily: number;
  knowledge: boolean;
};

export type StealDerived = {
  ratings: Record<AttrId, number>;
  shotCreation: number;
  rimPressure: number;
  offenseRaw: number;
  defenseRaw: number;
  offense: number;
  defense: number;
  playmaking: number;
  athleticism: number;
  fatigueMod: number;
  ovr: number;
  playerPower: number;
  synergies: SynergyHit[];
};

export type StealResult = {
  build: StealBuild;
  steals: Steal[];
  /** null in v4 classic/daily — the flaw exists only in Budget (and v3) */
  flaw: Flaw | null;
  /** Budget mode: dollars spent across the six steals */
  spent: number;
  /** Budget mode: flaw refund added after the weakness wheel */
  refund: number;
  /** sum of grade scores — the H2H tiebreaker */
  gradePoints: number;
  derived: StealDerived;
  rungs: RungResult[];
  fellAt: number | null;
  injured: boolean;
  band: ResultBand;
  archetype: Archetype;
  roast: string;
  simSeed: number;
  gauntlet: Rung[];
  /** highest-graded steal, ties broken by rating */
  bestSteal: Steal;
  /** lowest-graded steal, ties broken by rating */
  reach: Steal;
};

export type FlawSeverity = "Mild" | "Bad" | "Brutal" | "Career-Threatening";

export type FlawEffect =
  | { kind: "lateRung"; fromRung: number; amount: number }
  | { kind: "noShow"; chance: number; amount: number }
  | { kind: "slowStart"; rungs: number[]; amount: number }
  | { kind: "injury"; chancePerRung: number }
  | { kind: "vsQuick"; amount: number }
  | { kind: "vsCrafty"; amount: number }
  | { kind: "flat"; amount: number }
  | { kind: "cardio"; fromRung: number; perRung: number }
  | { kind: "whistle"; chance: number; amount: number }
  | { kind: "heroBall"; earlyBonus: number; lateRungs: number; latePenalty: number };

export type Flaw = {
  id: string;
  name: string;
  desc: string;
  effect: FlawEffect;
  severity: FlawSeverity;
  refund: 0 | 1 | 2 | 3;
  /** narrative templates when the flaw fires in the log; {opp} substituted */
  templates: string[];
};

export type Rung = {
  rung: number;
  id: string;
  name: string;
  shortName: string;
  title: string;
  power: number;
  quick?: boolean;
  crafty?: boolean;
  winQuips: string[];
  lossQuips: string[];
};

export type GameMode = "sandbox" | "daily";

/** The encodable build: everything needed to reproduce a run. */
export type BuildCode = {
  v: number;
  mode: GameMode;
  /** shop draw seed (32-bit) */
  seed: number;
  /** pool index (0–11) per slot, in SLOTS order */
  picks: number[];
  /** index into FLAWS */
  flaw: number;
  /** re-sim counter; 0 = first/official run */
  attempt: number;
  /** daily number; 0 for sandbox */
  daily: number;
  /** Ball Knowledge modifier — cosmetic to the sim; encoded in the code */
  knowledge: boolean;
  /** v1 links omit this and use the original positionless rules. */
  position?: PositionMode;
};

export type SynergyHit = {
  id: string;
  name: string;
  desc: string;
  bonus: string;
};

export type Derived = {
  shotCreation: number;
  rimPressure: number;
  offenseRaw: number;
  defenseRaw: number;
  /** curved to the display scale */
  offense: number;
  defense: number;
  iq: number;
  passing: number;
  durability: number;
  fatigueMod: number;
  ovr: number;
  playerPower: number;
  spend: number;
  synergies: SynergyHit[];
};

export type RungResult = {
  rung: number;
  oppId: string;
  win: boolean;
  playerScore: number;
  oppScore: number;
  /** one narrative beat for the log */
  beat: string;
  flawFired: boolean;
  injuryEnd: boolean;
};

export type Archetype = {
  id: string;
  name: string;
  desc: string;
};

export type ResultBand = "out1" | "early" | "deep" | "door" | "cleared";

export type SimResult = {
  build: BuildCode;
  entries: PoolEntry[];
  flaw: Flaw;
  derived: Derived;
  rungs: RungResult[];
  /** rung number of the loss, or null if the gauntlet was cleared */
  fellAt: number | null;
  injured: boolean;
  band: ResultBand;
  archetype: Archetype;
  roast: string;
  simSeed: number;
  gauntlet: Rung[];
};
