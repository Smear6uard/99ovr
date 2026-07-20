"use client";

/** localStorage helpers — the only persistence in the game. */

export type DailyRecord = {
  date: string;
  number: number;
  code: string;
  ovr: number;
  archetypeName: string;
  fellAt: number | null;
  block: string;
  /** percentile v1.1 — set only when the rank endpoint answered */
  topPct?: number;
};

export type DailyState = {
  last?: DailyRecord;
  streak: number;
  bestStreak: number;
  lastOfficialDate?: string;
};

export type BestBuild = {
  ovr: number;
  code: string;
  archetypeName: string;
};

const DAILY_KEY = "99ovr:daily:v1";
const BEST_KEY = "99ovr:best:v1";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota — the game just won't persist. Fine.
  }
}

export function getDailyState(): DailyState {
  return read<DailyState>(DAILY_KEY) ?? { streak: 0, bestStreak: 0 };
}

export function isYesterdayUtc(prev: string, today: string): boolean {
  const [y1, m1, d1] = prev.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  return Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1) === 86_400_000;
}

/** Records the one official daily run and advances the streak. */
export function recordOfficialDaily(rec: DailyRecord): DailyState {
  const state = getDailyState();
  const continued = state.lastOfficialDate && isYesterdayUtc(state.lastOfficialDate, rec.date);
  const streak = continued ? state.streak + 1 : 1;
  const next: DailyState = {
    last: rec,
    streak,
    bestStreak: Math.max(streak, state.bestStreak),
    lastOfficialDate: rec.date,
  };
  write(DAILY_KEY, next);
  return next;
}

/** Attaches a late-arriving percentile to today's stored official run. */
export function attachDailyPercentile(date: string, topPct: number, block: string): DailyState {
  const state = getDailyState();
  if (state.last?.date === date) {
    state.last.topPct = topPct;
    state.last.block = block;
    write(DAILY_KEY, state);
  }
  return state;
}

export function getBestBuild(): BestBuild | null {
  return read<BestBuild>(BEST_KEY);
}

export function maybeRecordBest(candidate: BestBuild): BestBuild {
  const current = getBestBuild();
  if (!current || candidate.ovr > current.ovr) {
    write(BEST_KEY, candidate);
    return candidate;
  }
  return current;
}
