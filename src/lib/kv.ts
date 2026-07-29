/**
 * Minimal Vercel KV / Upstash Redis REST client (server-only).
 * No SDK dependency; a missing binding just means kvAvailable() === false
 * and the daily leaderboard no-ops.
 */

function creds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function kvAvailable(): boolean {
  return creds() !== null;
}

/** Runs a command pipeline; returns per-command results or null on any failure. */
export async function kvPipeline(commands: string[][]): Promise<unknown[] | null> {
  const c = creds();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${c.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    if (!Array.isArray(data) || data.some((d) => d.error)) return null;
    return data.map((d) => d.result);
  } catch {
    return null;
  }
}
