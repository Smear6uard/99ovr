# 99OVR — Landing + Ball Knowledge + Spin Builder

**Date:** 2026-07-20
**Status:** Approved for planning

## Summary

Three changes to 99OVR, all additive to the existing deterministic-code architecture. The sim math, data pools, `/b/[code]` server logic, and OG route plumbing are **not** touched except where explicitly stated (the Ball Knowledge flag in the encoder, and the badge on the OG cards).

1. **New homepage (`/`)** — an 82-0-style landing with three mode cards. The builder moves to `/play`.
2. **Ball Knowledge mode** — a sandbox-flow modifier (`/play?mode=knowledge`) that hides player blurbs (names + prices only) and stamps a badge that travels with every share. The flag is encoded in the build code.
3. **Spin → Choose builder** — the all-slots-at-once shop is rebuilt as a sequential, one-slot-at-a-time spin loop. Shared by Sandbox and Daily.

### Confirmed decisions
- **Ball Knowledge badge:** gold pill with a 🧠 brain emoji, caps text `BALL KNOWLEDGE`.
- **Daily unifies onto the spin builder.** One builder everywhere via `GameFlow`. Daily is never Ball Knowledge.

## Guardrails (do not touch except where stated)
- `src/lib/sim.ts` math — untouched. `simSeedFor` must not read `knowledge`; the flag is cosmetic to the game.
- `src/data/*` pools — untouched.
- Build-code **encoding** — touched **only** to add the Ball Knowledge flag (change 2 explicitly authorizes this). Layout stays 18 bytes; existing codes must still decode.
- `/b/[code]` server logic — untouched except repointing its two in-page links (`/` → `/play`) and rendering the badge via the shared `ResultCard`.
- OG route plumbing (`/api/og`, `/api/card`) — untouched except the card JSX renders the badge.
- Daily emoji block (`formatDailyBlock`) and `daily.test.ts` — untouched (Ball Knowledge is sandbox-only).

## Architecture & routing

- `src/app/page.tsx` becomes the **landing** (server component + small client islands). The current Suspense-wrapped `<SandboxGame>` moves verbatim to a new `src/app/play/page.tsx`.
- `<SandboxGame>` already reads `?vs=` via `useSearchParams`; it now also reads `?mode=knowledge`. Both work on `/play` unchanged.
- Global chrome (`Header`, `Footer`, `CourtLines`) stays on every route via `layout.tsx`.
- Link/route updates:
  - `Header` nav gains a **Play** → `/play` link (keeps Daily, How it works).
  - `/b/[code]`: "Beat this build" `/?vs=${code}` → `/play?vs=${code}`; "Build from scratch" `/` → `/play`.
  - `sitemap.ts`: add `/play`.
  - `/about`: "Modes" section links Sandbox → `/play`, adds a Ball Knowledge line; wording "re-roll" → "re-spin" where it refers to the builder.

## Change 1 — Landing (`/`)

**Component shape:** `page.tsx` is a server component rendering static hero + how-it-works + the three cards. The DAILY card's live data (daily number, countdown, streak) requires `localStorage` + a ticking clock, so it is a **client island** (`DailyCard`). The PLAY and BALL KNOWLEDGE cards are static links.

**Sections:**
1. **Hero** — huge `99OVR` wordmark, one-line hook (adapt existing: "$15. Six skills from legends. One fatal flaw. Ten 1v1s between you and forever."), court line-work accent (ambient `CourtLines` is already global; add a local arc flourish if needed).
2. **Three mode cards** (in order):
   - **PLAY** — the sandbox → `/play`.
   - **DAILY** — client island showing `dailyNumberFor(utcDateString())`, live `formatCountdown(msToNextUtcMidnight())` (1s interval), and `getDailyState().streak`. Pre-mount fallback renders a static skeleton to avoid hydration mismatch (mirror `useMounted` pattern). → `/daily`.
   - **BALL KNOWLEDGE** — hard mode → `/play?mode=knowledge`. Tagline: "No scouting notes. Just names. Prove you know ball."
3. **How-it-works strip** — 3 steps: **Spin → Build → Survive the Gauntlet**.
4. Existing `Footer` (already global).

**Meta:** keeps site-level OG/meta (layout default → `OgHero`). Page sets `alternates.canonical = "/"` only.

## Change 2 — Ball Knowledge (sandbox modifier)

**Data model:** add `knowledge: boolean` to `BuildCode` (`src/lib/types.ts`).

**Encoding (`src/lib/encode.ts`):** store the flag in the free high bit (`0x80`) of the mode byte `bytes[1]`.
- Encode: `bytes[1] = (build.mode === "daily" ? 1 : 0) | (build.knowledge ? 0x80 : 0)`.
- Decode: `const modeBit = bytes[1] & 0x7f; if (modeBit > 1) return null; const mode = modeBit === 1 ? "daily" : "sandbox"; const knowledge = (bytes[1] & 0x80) !== 0;`
- Backward-compatible: legacy codes have `bytes[1] ∈ {0,1}` → `knowledge:false`. Checksum (`xor` over bytes 0–16) already covers byte 1, so tampering a single bit still fails.

**Threading:**
- `SandboxGame` reads `params.get("mode") === "knowledge"` → passes `knowledge` prop to `GameFlow`.
- `GameFlow` accepts `knowledge?: boolean`, passes it to `SpinPhase` (to hide blurbs) and includes it in the `BuildCode` it builds in `runSim` (`knowledge: knowledge ?? false`). Daily callers omit it → `false`.
- `simulate` returns `build` verbatim, so `result.build.knowledge` reaches `ResultCard`, `/b/[code]`, and OG cards automatically.

**Surfaces:**
- **Builder** hides `blurb` and `tags` on every card when `knowledge` is on (names + prices only). Nothing else changes.
- **Badge — gold pill + 🧠 `BALL KNOWLEDGE`** on:
  - `ResultCard` — near the mode chip, gated on `result.build.knowledge`. (This also covers `/b/[code]`, which renders `ResultCard`.)
  - `OgLandscape` / `OgPortrait` (`src/components/og/cards.tsx`) — a gold pill near the existing DAILY/SANDBOX chip, gated on `build.knowledge`. Emoji-free text in the image itself (satori); the "🧠" is fine as an emoji glyph but to avoid satori glyph risk the OG badge uses the caps text `BALL KNOWLEDGE` in a gold pill (no emoji) — the 🧠 lives on the in-app card and the text share.
  - **Sandbox share text** (`resultText` in `src/lib/share.ts`) — insert a `🧠 Ball Knowledge (names only)` line for knowledge builds. `nativeShare` uses `resultText`, so it inherits it.

**Scope:** Ball Knowledge is reachable only via the sandbox flow. Daily never sets it. `formatDailyBlock` is untouched.

## Change 3 — Spin → Choose builder

Replaces `ShopPhase` and `FlawPhase`. `GameFlow`'s phase machine (`shop | flaw | sim | result`) is preserved; the `shop` phase renders the new `SpinPhase`, the `flaw` phase renders the new `FlawSpin`. All existing state (`seed`, `picks`, `rerolled`, `flawIdx`, `draw` from `drawShop`, `flawChoices` from `drawFlaws`) and its determinism are unchanged.

### `SpinPhase` (new component)
- Sequential cursor over `SLOTS`, slot 1 → 6. Owns `currentSlot` index + reel animation state internally.
- Each slot screen: big slot name, then a **SPIN** button. Tapping SPIN runs a ~1s reel (player names blurring past) that lands on the **5 already-drawn cards** for that slot (`draw[slot]` — the existing seeded draw; the reel is cosmetic only).
- After the reel lands, the 5 tier cards are shown; picking one calls `onPick(slot, poolIdx)` and auto-advances to the next unfilled slot (reset to pre-spin state for that slot).
- **Re-spin:** per-slot, one allowed → "RE-SPIN (1 left)". Calls existing `onReroll(slot)` (which clears the pick and advances the seeded permutation), then requires another SPIN.
- **Persistent header:** budget remaining (big), 6-dot progress (filled/current/empty), chips of picks so far (slot → picked name).
- **Affordability guard:** a card is locked/greyed when `canPick(picks, slot, entry.price).ok === false`. Tapping a locked card surfaces `canPick(...).reason` (toast/inline), does not select.
- **Knowledge:** when `knowledge` prop is on, cards show name + price only (no `blurb`, no `tags`).
- **Reduced motion:** skip the reel entirely; SPIN reveals the 5 cards instantly.
- **One-handed @375px:** SPIN button and the card row sit in lower-half thumb reach; header pinned top.
- After slot 6 is filled → `onComplete()` → `GameFlow` advances to the flaw phase.

### `FlawSpin` (new component)
- Replaces the flaw list. A **spin a flaw wheel** interaction lands on the existing 3 seeded options (`flawChoices` from `drawFlaws`). User picks one → `onSelect(flawIdx)` then `onAccept()` runs the sim.
- Same reduced-motion rule (instant reveal of the 3 options).
- Keeps a "back to build" affordance (`onBack` → shop phase).

### Reel animation
- New CSS keyframes in `globals.css` (blur + scroll of a strip of pool names), ~1s, easing to a snap. Gated behind `usePrefersReducedMotion()` in JS **and** the global reduced-motion CSS rule already neutralizes animation duration as a backstop.

## Testing

- **`encode.test.ts`** (extend):
  - `randomValidBuild` includes a random `knowledge` boolean; round-trip asserts it survives.
  - New assertion: a code built with `knowledge:false` and its high bit clear decodes to `knowledge:false` (legacy compat), and a `knowledge:true` build sets the high bit and round-trips.
  - Tamper test remains valid (checksum covers byte 1).
- **`daily.test.ts`** — unchanged, must stay green (proves Daily block untouched).
- **Full gate before push:** `npx tsc --noEmit`, `npm run build`, `npx vitest run` all green.

## Rollout
- Implement with the frontend-design skill for all UI surfaces (landing, spin reel, cards, badge), per the hard rule.
- After green tests + build, commit and push to `main` (per request). Working on a feature branch is unnecessary since `main` is the deploy branch for this project and the user asked to push to main.

## Out of scope
- No changes to sim math, tuning curve, data pools, percentile/KV feature, ads config, or the go-live checklist.
- No new persistence beyond what `localStorage` already provides.
