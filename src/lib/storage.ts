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
  /** leaderboard — set only when the submission went through */
  initials?: string;
  rank?: number;
  total?: number;
  /** the KV sorted-set member, kept so "your rank" survives a reload */
  member?: string;
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

/** Attaches a late-arriving leaderboard rank to today's stored official run. */
export function attachDailyRank(
  date: string,
  lb: { initials: string; rank: number; total: number; member?: string },
  block: string
): DailyState {
  const state = getDailyState();
  if (state.last?.date === date) {
    state.last.initials = lb.initials;
    state.last.rank = lb.rank;
    state.last.total = lb.total;
    state.last.member = lb.member;
    state.last.block = block;
    write(DAILY_KEY, state);
  }
  return state;
}

const INITIALS_KEY = "99ovr:initials:v1";

export function getSavedInitials(): string | null {
  return read<string>(INITIALS_KEY);
}

export function saveInitials(initials: string): void {
  write(INITIALS_KEY, initials);
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
