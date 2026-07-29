import { LEADERBOARD_ENABLED } from "@/config/features";
import { utcDateString } from "@/lib/daily";
import { decodeSteal } from "@/lib/encode";
import { kvAvailable, kvPipeline } from "@/lib/kv";
import {
  LB_RATE_LIMIT,
  LB_TOP_N,
  LB_TTL_SECONDS,
  cleanInitials,
  dailyScore,
  lbKey,
  lbMember,
  memberInitials,
  rateKey,
  scoreParts,
  validateDailySubmission,
} from "@/lib/leaderboard";
import { simulateSteals } from "@/lib/steal";

export const runtime = "edge";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const OFF = { available: false } as const;

type Row = { initials: string; ovr: number; roundsWon: number; score: number };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** ZREVRANK result → 1-based rank; null/absent members stay null (Number(null) is 0!). */
function rankFrom(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n + 1 : null;
}

/** Flat [member, score, member, score…] → display rows. */
function rowsFrom(flat: unknown): Row[] {
  if (!Array.isArray(flat)) return [];
  const rows: Row[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const score = Number(flat[i + 1]);
    if (!Number.isFinite(score)) continue;
    rows.push({ initials: memberInitials(String(flat[i])), score, ...scoreParts(score) });
  }
  return rows;
}

/**
 * Arcade daily leaderboard. The client POSTs its build *code* and initials,
 * never a score: the sim is deterministic, so we re-run it here and derive
 * the score ourselves. Per-day sorted set in KV; flag off or KV missing →
 * {available:false} and the UI hides the board gracefully.
 */
export async function POST(req: Request) {
  if (!LEADERBOARD_ENABLED) return json(OFF);

  let code: unknown;
  let initialsRaw: unknown;
  try {
    ({ code, initials: initialsRaw } = (await req.json()) as { code?: unknown; initials?: unknown });
  } catch {
    return json({ error: "bad body" }, 400);
  }
  if (typeof code !== "string" || code.length > 64) return json({ error: "bad code" }, 400);
  const initials = cleanInitials(initialsRaw);
  if (!initials) return json({ error: "bad initials" }, 400);

  const build = decodeSteal(code);
  if (!build) return json({ error: "bad code" }, 400);

  const today = utcDateString();
  const invalid = validateDailySubmission(build, today);
  if (invalid) return json({ error: invalid }, 400);

  const result = simulateSteals(build);
  if (!result) return json({ error: "bad build" }, 400);

  if (!kvAvailable()) return json(OFF);

  const ip = clientIp(req);
  const rate = await kvPipeline([
    ["INCR", rateKey(today, ip)],
    ["EXPIRE", rateKey(today, ip), String(LB_TTL_SECONDS)],
  ]);
  if (!rate) return json(OFF);
  if (Number(rate[0]) > LB_RATE_LIMIT) return json({ error: "rate limited" }, 429);

  const key = lbKey(today);
  const member = lbMember(initials, ip, code);
  const score = dailyScore(result);
  const out = await kvPipeline([
    ["ZADD", key, String(score), member],
    ["EXPIRE", key, String(LB_TTL_SECONDS)],
    ["ZREVRANK", key, member],
    ["ZCARD", key],
    ["ZRANGE", key, "0", String(LB_TOP_N - 1), "REV", "WITHSCORES"],
  ]);
  if (!out) return json(OFF);

  const total = Number(out[3]);
  return json({
    available: true,
    member,
    rank: rankFrom(out[2]),
    total: Number.isFinite(total) ? total : null,
    top: rowsFrom(out[4]),
  });
}

/** Read-only board: top 50 plus "your rank" when the client remembers its member. */
export async function GET(req: Request) {
  if (!LEADERBOARD_ENABLED || !kvAvailable()) return json(OFF);

  const member = new URL(req.url).searchParams.get("member");
  const today = utcDateString();
  const key = lbKey(today);
  const commands: string[][] = [
    ["ZRANGE", key, "0", String(LB_TOP_N - 1), "REV", "WITHSCORES"],
    ["ZCARD", key],
  ];
  if (member && member.length <= 24) commands.push(["ZREVRANK", key, member]);

  const out = await kvPipeline(commands);
  if (!out) return json(OFF);

  const total = Number(out[1]);
  return json({
    available: true,
    top: rowsFrom(out[0]),
    total: Number.isFinite(total) ? total : 0,
    rank: out.length > 2 ? rankFrom(out[2]) : null,
  });
}
