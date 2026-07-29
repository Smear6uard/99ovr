"use client";

/** Client half of the daily leaderboard. Null everywhere means "feature doesn't exist." */

export type LbRow = { initials: string; ovr: number; roundsWon: number; score: number };

export type LbBoard = {
  available: boolean;
  top: LbRow[];
  total: number | null;
  rank: number | null;
  member?: string;
};

async function call(input: RequestInfo, init?: RequestInit): Promise<LbBoard | null> {
  try {
    const res = await fetch(input, { ...init, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = (await res.json()) as LbBoard;
    return data.available ? data : null;
  } catch {
    return null;
  }
}

/** Submits the official daily code + initials; returns the fresh board with your rank. */
export function submitDailyScore(code: string, initials: string): Promise<LbBoard | null> {
  return call("/api/leaderboard", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, initials }),
  });
}

/** Read-only board; pass your stored member to get "your rank #N of M" back. */
export function fetchDailyBoard(member?: string | null): Promise<LbBoard | null> {
  const qs = member ? `?member=${encodeURIComponent(member)}` : "";
  return call(`/api/leaderboard${qs}`);
}
