/**
 * Feature flags. Percentile (v1.1) needs a KV store bound to the Vercel
 * project (KV_REST_API_URL / KV_REST_API_TOKEN, or the Upstash equivalents).
 * With the flag off — or KV missing — the whole feature silently no-ops.
 */
export const PERCENTILE_ENABLED = false;
