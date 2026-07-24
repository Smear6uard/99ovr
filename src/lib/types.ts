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
