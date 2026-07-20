# 99OVR

**Build the perfect NBA player with $15.** Six skills bought from legends, one fatal flaw,
and a 10-rung 1v1 gauntlet that ends at MJ. Deterministic sim, daily challenge with streaks,
share links that challenge friends to beat your build from the same shop.

Live at [99ovr.app](https://99ovr.app).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · `next/og` edge images · Vitest.
No database, no accounts, no server game state — game state in React, persistence in
`localStorage`. The only optional infra is a KV histogram for the daily percentile (below).

## Run it

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # engine tests: rng, encode round-trip, budget, sim tuning bands, percentile
npm run build
```

## Deploy

```bash
vercel deploy --prod
```

Then point `99ovr.app` at the project. Everything is static or edge.

## Turning on ads / analytics

All monetization lives in [`src/config/ads.ts`](src/config/ads.ts):

1. Set `ADS_ENABLED = true` and paste your `ADSENSE_CLIENT` (`ca-pub-…`).
2. Paste per-slot ad-unit IDs into `AD_SLOTS`.
3. Add your real network line to [`public/ads.txt`](public/ads.txt) after approval —
   AdSense requires it at the domain root.
4. Optionally set `GA4_ID` and `DONATE_URL`.

Ad containers reserve their height whether or not ads render, so CLS stays at zero.

## Daily percentile (v1.1, off by default)

Flip `PERCENTILE_ENABLED` in [`src/config/features.ts`](src/config/features.ts) and bind a
Vercel KV / Upstash Redis store (`KV_REST_API_URL` + `KV_REST_API_TOKEN`). After the one
official daily run, the client POSTs its **build code** — never a score — to
`/api/daily-rank`, which re-runs the deterministic sim server-side (the anti-cheat),
validates the code against today's actual shop draw, and increments a per-day, PII-free
score histogram (`daily:{date}`, ~60 OVR buckets × gauntlet depth, 3-day TTL). The card and
the emoji block then carry a `📊 Top 9% today` line. Flag off or KV missing → the feature
silently no-ops.

## How the determinism works

- `fnv1a` string hash + `mulberry32` PRNG — no `Math.random()` anywhere in game logic.
- Shop draw is seeded; the daily seed is `fnv1a("99ovr-daily-" + UTC date)`, identical for everyone.
- The sim seed hashes the six picks + flaw + mode + attempt counter, so a shared build code
  replays byte-identically on any device, and "Run It Back" re-rolls only the variance.
- Build codes are 18 bytes → base64url (picks, flaw, seed, mode, attempt, checksum), decoded
  and re-simulated on `/b/[code]` and in the edge OG images. Nothing is stored anywhere.

## Legal

99OVR is a fan-made game. Not affiliated with or endorsed by the NBA, any team, or any player.
Player names are used in a statistical/fantasy context only. No logos or likenesses are used.
