# 99OVR

**Six steals. Six rosters. One player.** Spin a slot machine for a real NBA franchise-decade, read the
all-decade roster, and steal one player's skill — six times, once per attribute. Hidden ratings grade
every pick A+ to F, then you face ten 1v1 bosses. Four modes: Daily (arcade leaderboard),
Classic (positional build targets), Budget ($15 and a mid-run weakness wheel), and Head to
Head (challenge links that replay your exact spins).

A run is a **gamble** (where the wheel lands), a **knowledge test** (who on that roster
actually had it), and a **judgment** (the grades, the OVR, the roast). Deterministic sim,
daily streaks, and share links that replay the same wheel for whoever opens them.

Live at [99ovr.app](https://99ovr.app).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · `next/og` edge images · Vitest.
No database, no accounts, no server game state — game state in React, persistence in
`localStorage`. The only optional infra is a KV sorted set for the daily leaderboard (below).

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

## Daily leaderboard

`LEADERBOARD_ENABLED` lives in [`src/config/features.ts`](src/config/features.ts); bind a
Vercel KV / Upstash Redis store (`KV_REST_API_URL` + `KV_REST_API_TOKEN`). After the one
official daily run, the client POSTs its **build code + three initials** — never a score —
to `/api/leaderboard`, which re-runs the deterministic sim server-side (the anti-cheat),
validates every landing against today's actual wheel and re-spin budget, and ZADDs the
derived score into a per-day sorted set (`daily:lb:{date}`, 3-day TTL). Top 50 arcade board,
"your rank #N of M", basic per-IP rate limit, slur-blocked initials, and the emoji block
carries a `🏆 ABC · #12 of 431 today` line. Flag off or KV missing → the board hides
gracefully.

## The loop

Six rounds, one per attribute: **jumpshot, handles, finishing, playmaking, defense,
athleticism**. Each round the wheel lands on one of **57 franchise-decades** across 27
franchises. Each bucket contains every player who appeared for that franchise during the
decade, with the original hand-authored roster entries kept encoding-stable. A player can
only be stolen from once per run.

Re-spins are scarce and one-axis: **one team re-spin** changes the franchise but preserves
the decade, while **one decade re-spin** changes the decade but preserves the franchise.
In Budget, flaw severity pays cash instead: Mild +$1 · Bad +$2 · Brutal +$3 ·
Career-Threatening +$3, refunded after the mid-run
weakness wheel and spendable on the last three steals.

Grades measure the **decision**, not the number — taking the best handles on the 2004 Pistons
is an A+ even though the rating is a 74, and the OVR still eats the 74.

## Modes

| Route | Mode |
|---|---|
| `/daily` | Same six spins for everyone, one official run per UTC day, arcade leaderboard |
| `/play` | Classic — setup sheet (Normal/Ball Knowledge, Best Player or Best PG–C), no flaw |
| `/budget` | Budget — $15, per-attribute prices, weakness wheel after three steals |
| `/h2h` | Head to Head — a Classic run mints `/h2h/[code]`; a friend plays the identical spins |

## How the determinism works

- `fnv1a` string hash + `mulberry32` PRNG — no `Math.random()` anywhere in game logic.
- The initial wheel and each one-axis re-spin are pure seeded transitions. A team re-spin
  draws another franchise from the current decade; a decade re-spin draws another decade
  from the current franchise.
- **The reel animation is cosmetic.** The landing is decided before it moves; `TeamWheel`
  imports no RNG. Same invariant the v2 pack builder held.
- The daily seed is `fnv1a("99ovr-daily-" + UTC date)`, identical for everyone.
- The sim seed hashes the six stolen player ids + flaw + mode + build target + attempt
  counter, so a shared code replays byte-identically on any device, and "Run It Back"
  re-rolls only the variance.
- v4 codes are a versioned **25-byte** base64url payload carrying mode, build target,
  Ball Knowledge, and (Budget only) the flaw. The 24-byte v3 Six Steals codes and the
  21/18-byte Budget Ball decoders remain supported, so nothing already shared 404s —
  `decodeAny()` routes a code to whichever game produced it. Codes are re-simulated on
  `/b/[code]`, `/h2h/[code]`, and in edge OG images.

Full decade-roster supplements are generated from the CC0 [NBA Dataset: Box Scores and
Stats (1947–Today)](https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores).

## Legal

99OVR is a fan-made game. Not affiliated with or endorsed by the NBA, any team, or any player.
Player names, teams, and seasons are used in a statistical/fantasy context only. No logos or likenesses are used.
