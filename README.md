# 99OVR

**Six steals. Six eras. One player.** Spin a slot machine for a real NBA team-era, read the
roster with no prices anywhere, and steal one player's skill — six times, once per attribute.
Hidden ratings grade every pick A+ to F, then you face ten 1v1 bosses.

A run is a **gamble** (where the wheel lands), a **knowledge test** (who on that roster
actually had it), and a **judgment** (the grades, the OVR, the roast). Deterministic sim,
daily streaks, and share links that replay the same wheel for whoever opens them.

Live at [99ovr.app](https://99ovr.app).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · `next/og` edge images · Vitest.
No database, no accounts, no server game state — game state in React, persistence in
`localStorage`. The only optional infra is a KV histogram for the daily percentile (below).

## Run it

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # engine + data invariants + a full run driven through the real components
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
validates every landing against today's actual wheel (and the re-spin budget the flaw paid for), and increments a per-day, PII-free
score histogram (`daily:{date}`, ~60 OVR buckets × gauntlet depth, 3-day TTL). The card and
the emoji block then carry a `📊 Top 9% today` line. Flag off or KV missing → the feature
silently no-ops.

## The loop

Six rounds, one per attribute: **jumpshot, handles, finishing, playmaking, defense,
athleticism**. Each round the wheel lands on one of **59 authored team-eras** across 27
franchises (about a third of them deliberately rough — the groans are content). Every roster
carries 10–14 real players with box stats, at least one **trap** (big numbers, wrong skill)
and at least one **connoisseur** pick (a role player who owns an elite hidden rating). A
player can only be stolen from once per run.

Re-spins are scarce: **one team re-spin** (a brand-new team-era) and **one era re-spin** (same
franchise, different decade) for the entire run. A Brutal flaw buys one extra,
Career-Threatening buys two.

Grades measure the **decision**, not the number — taking the best handles on the 2004 Pistons
is an A+ even though the rating is a 74, and the OVR still eats the 74.

## Modes

| Route | Mode |
|---|---|
| `/play` | Six Steals — the main game |
| `/daily` | Same six spins for everyone, one official run per UTC day |
| `/play?mode=knowledge` | Ball Knowledge — box stats hidden, names only |
| `/budget` | Budget Ball — the original $20 challenge, kept as a side mode |

## How the determinism works

- `fnv1a` string hash + `mulberry32` PRNG — no `Math.random()` anywhere in game logic.
- The wheel is `bucketAt(seed, round, teamRespins, eraRespins)` — a pure function. Six rounds
  address 24 of 27 franchise slots, so no two rounds can ever collide whatever you re-spin.
- **The reel animation is cosmetic.** The landing is decided before it moves; `TeamWheel`
  imports no RNG. Same invariant the v2 pack builder held.
- The daily seed is `fnv1a("99ovr-daily-" + UTC date)`, identical for everyone.
- The sim seed hashes the six stolen player ids + flaw + mode + attempt counter, so a shared
  code replays byte-identically on any device, and "Run It Back" re-rolls only the variance.
- Six Steals codes are a versioned **24-byte** base64url payload (32 chars). The 21-byte v2
  and 18-byte v1 Budget Ball decoders remain supported, so nothing already shared 404s —
  `decodeAny()` routes a code to whichever game produced it. Codes are re-simulated on
  `/b/[code]` and in edge OG images.

## Legal

99OVR is a fan-made game. Not affiliated with or endorsed by the NBA, any team, or any player.
Player names, teams, and seasons are used in a statistical/fantasy context only. No logos or likenesses are used.
