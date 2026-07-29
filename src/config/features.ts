/**
 * Feature flags. The daily leaderboard needs a KV store bound to the Vercel
 * project (KV_REST_API_URL / KV_REST_API_TOKEN, or the Upstash equivalents).
 * With the flag off — or KV missing — the board hides itself gracefully.
 */
export const LEADERBOARD_ENABLED = true;
