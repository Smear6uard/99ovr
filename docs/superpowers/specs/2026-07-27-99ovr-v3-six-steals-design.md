# 99OVR v3 — Six Steals

**Date:** 2026-07-27
**Status:** approved, implementing

Replaces the budget/price core. The old loop leaked player quality through
visible prices (no knowledge test) and dealt one card per tier every time (no
stakes on a spin). v3 replaces both with a spin-the-wheel steal loop.

The gauntlet, sim determinism, display tiers, encoding discipline, OG pipeline,
and daily/duel infrastructure are kept and rewired.

---

## 1. The loop

Six rounds, one per attribute, in this order:

```
JUMPSHOT · HANDLES · FINISHING · PLAYMAKING · DEFENSE · ATHLETICISM
```

`PLAYMAKING` merges the old passing and IQ slots. `DURABILITY` is removed as a
slot entirely — injury risk lives in the flaw system, and late-round fatigue now
keys off ATHLETICISM.

Each round:

1. A slot-machine wheel spins and lands on a real **team-era** bucket
   ("1996 Bulls", "2004 Pistons"). The landing is the gamble.
2. The full roster appears: 10–14 real players, each with a display box line
   (PPG/RPG/APG) and one signature line. **No prices anywhere.**
3. You **steal** one player's skill for the current attribute. Hidden
   per-attribute ratings (0–99, authored) grade the pick later.
4. A player can be stolen from **once per run**. Dedup is by person, not by
   roster entry, so the same human in two buckets counts once.

Box stats only partially signal attribute quality. Scoring 28 a game says
nothing about handles. That gap is the knowledge test.

### Re-spins

Scarce, like 82-0. For the **entire run**:

- **1 team re-spin** — spin the whole wheel again, land on a new franchise.
- **1 era re-spin** — keep the franchise, jump to another authored era of it
  (2013 Bulls → 1996 Bulls). Knowing a franchise has a better decade on file is
  itself a knowledge play.

Flaw severity grants **wild** tokens, spendable as either type:

| Severity | Wild tokens |
|---|---|
| Mild | +0 |
| Bad | +0 |
| Brutal | +1 |
| Career-Threatening | +2 |

The flaw step stays before Round 1. Flaws no longer refund budget — there is no
budget.

---

## 2. Data

`src/data/eras/` — six files split by era decade, plus `index.ts`.

**27 franchises, 59 buckets.** Every franchise has ≥2 authored eras so the era
re-spin always has a destination. Second eras are where the rough ones live
(2002 Bulls, 2011 Cavs, 2010 Nets, 1998 Raptors) — roughly a third of the wheel
is mid or rough, and the groans are content.

```ts
p("Ben Wallace", "9.7 PPG · 13.0 RPG · 1.7 APG", "4× DPOY", [38, 44, 62, 45, 98, 88])
//                display box line                signature  [js, hnd, fin, pm, def, ath]
```

`person` (the steal-dedup key) is slugified from the name automatically.

### Per-bucket invariants — enforced by a data test

- 10–14 players.
- **≥1 trap pick**: a top-3 scorer on the roster who is bottom-half in at least
  one attribute.
- **≥1 connoisseur pick**: a bottom-half scorer who owns the roster's best
  rating in at least one attribute.
- **Unique roster-best per attribute** — no ties at rank 0, so A+ is never
  ambiguous.

`BUCKETS` order is encoding-stable. Never reorder; only append.

---

## 3. The wheel — deterministic and enumerable

```
franchiseAt(seed, round, t) = shuffle(seed, FRANCHISES)[(round * 4 + t) % 27]
bucketAt(seed, round, t, e) = eraOrder(seed, franchise)[e % franchise.eras.length]
```

`t` = team re-spins used on this round, `e` = era re-spins used on this round.
Max addressable index is `5 * 4 + 3 = 23 < 27`, so no two rounds can ever
collide on a franchise regardless of re-spin usage.

**Validation / anti-cheat.** For a landed bucket, recover the *minimal* `(t, e)`
that produces it, and require `Σ(t + e) ≤ 2 + wild`. This is a tight bound, not
a permissive one — a code claiming four re-spins on a Mild flaw is rejected.

The reel animation is **purely cosmetic**. The landed bucket is always
`bucketAt(...)`, never derived from where the animation stops. `TeamWheel`
imports no RNG. This is the same invariant the v2 spin builder held.

---

## 4. Encoding — v3, 24 bytes

```
0      version = 3
1      mode | knowledge << 7
2–5    seed (u32 big-endian)
6      flaw index
7–18   6 × (bucketIdx, playerIdx)
19–20  attempt (u16)
21–22  daily (u16)
23     xor checksum
```

→ 32 base64url chars.

Validation: indices in range, no duplicate person across the six steals, and the
re-spin token budget satisfied.

v1 (18 bytes) and v2 (21 bytes) keep their exact byte layouts and remain
decodable. `decodeAny(code)` returns `{ kind: "steal" | "budget" }`; legacy codes
render with the old card under a BUDGET BALL chip, and their "Beat this build"
link points at `/budget`.

---

## 5. Sim

`src/lib/steal.ts`. Reuses `runGauntlet`, `curve`, `bandFor`, and `gauntletFor`
from `sim.ts` unchanged.

```
shotCreation = js  * (0.60 + 0.40 * hnd / 99)
rimPressure  = fin * (0.55 + 0.45 * ath / 99)
offenseRaw   = 0.42 * sc + 0.30 * rp + 0.28 * playmaking
defenseRaw   = def * (0.70 + 0.30 * ath / 99)
ovr          = clamp(0.52 * offense + 0.36 * defense + 0.12 * playmaking, 40, 98)
fatigueMod   = clamp((ath - 68) / 16, -2.25, 1.75)
```

Synergies are re-cut as **rating thresholds** so no per-player tag authoring is
needed: Shake & Bake, Lob City, No-Fly Zone, Gravity Well, Post Office, Killer
Instinct. Two era synergies join them:

- **Time Machine** — steals span 4+ distinct decades.
- **Same Era Squad** — 3+ steals from one decade.

The curve is recalibrated by a rewritten brute-force test: the best possible
build across all buckets lands 96–97 (GOAT is reachable), 99 stays unreachable
by construction, and a random run sits around 72–78.

### Grading

Dense rank within the landed roster for that attribute, ties taking the best
rank:

```
pct   = 1 - rank / (n - 1)
grade = A+ ≥ .98 · A ≥ .90 · A- ≥ .80 · B+ ≥ .70 · B ≥ .60 · B- ≥ .50
        C+ ≥ .40 · C ≥ .30 · C- ≥ .20 · D+ ≥ .12 · D ≥ .05 · F otherwise
```

**Grade measures decision quality; OVR measures outcome.** Taking the best
handles on the 2004 Pistons is an A+ even though the number is a 74 — and the
OVR still eats the 74. That separation is the whole screenshot.

---

## 6. Screens

### `/play` — StealFlow

```
flaw spin → 6 × steal round → verdict → gauntlet
```

**Round:** `TeamWheel` (two reel strips — team and era — with near-miss ticks and
a staggered stop) → big era-card reveal → `RosterCard` → steal. Already-stolen
players render struck-through and dead. Re-spin buttons show remaining tokens.
Reduced motion skips the reel.

**Ball Knowledge** hides the box line — the roster shows names only. The badge
travels on every share, as already built.

**`Verdict`** is a tap-through sequence, not an instant result:

1. Six grade cards, one at a time — attribute, who you stole, the roster-best
   reveal, and a punchy verdict line.
2. **BEST STEAL** and **THE REACH**.
3. OVR odometer count-up → tier flood → archetype stamp → roast.
4. The 10-round boss gauntlet plays out.

### Homepage

Mode cards: **PLAY · DAILY · BALL KNOWLEDGE · BUDGET BALL**. Positional
challenges are shelved — the `?position=` route and the per-position boss
ladders stay in `gauntlet.ts` for legacy v2 codes, just unlinked.

### `/budget`

Today's `/play` verbatim — `GameFlow`, `SpinPhase`, `POOL`, `shop.ts` — moved,
not modified. Presented as "Budget Ball — the $20 challenge". It does not touch
the core.

---

## 7. Share surfaces

Daily block:

```
99OVR Daily #372
🟢A 🟢A- 🟡B 🟢A 🔴D 🟡C+ · 88 OVR SUPERSTAR · Round 9 ⟶ 99ovr.app
```

🟢 A-range · 🟡 B/C · 🔴 D/F. `daily.test.ts` is rewritten to lock this format.

Duels (`/b/[code]` → "Beat this build") replay the **same spin sequence** from
the encoded seed. Note that a challenger on a Career-Threatening flaw carries two
more wild tokens than one on a Mild flaw — "fair fight" means the same wheel, not
the same options. The flaw is a real trade.

OG images get a steal variant: the grade row replaces the price receipt, and six
team-era + player lines replace the pick rows. `ogSafe()` diacritic handling is
preserved. Budget cards keep the old layout under a BUDGET BALL chip.

---

## 8. Acceptance checklist

- A run reads **gamble → knowledge test → judgment**, in that order.
- Every wheel landing, roster draw, and grade is a pure function of the seed.
- The same code replays byte-identical on the client, in `/b/[code]` SSR, and in
  the edge OG renderer.
- The reel never decides anything.
- No price is visible anywhere in the core loop.
- Legacy v1/v2 codes still decode and render.
