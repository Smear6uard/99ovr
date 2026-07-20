# 99OVR — Landing + Ball Knowledge + Spin Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an 82-0-style landing at `/` (builder moves to `/play`), a Ball Knowledge sandbox modifier (names-only builder + a share-travelling badge, encoded in the build code), and a rebuilt spin→choose builder shared by Sandbox and Daily.

**Architecture:** Everything still derives from the deterministic 18-byte build code. The Ball Knowledge flag is packed into the free high bit of the existing mode byte, so old codes still decode and the sim math is untouched. The builder rebuild swaps `GameFlow`'s `shop`/`flaw` phase renderers for a sequential spin flow; all seeded-draw and determinism logic is reused as-is.

**Tech Stack:** Next.js 15 (App Router) · Tailwind v4 · Vitest · TypeScript · next/og (satori, edge).

## Global Constraints

- **Do not touch** `src/lib/sim.ts` math, `src/data/*` pools, `/b/[code]` server logic, or OG route plumbing — **except** the two changes this plan authorizes: the Ball Knowledge flag in `src/lib/encode.ts`, and the badge JSX in `src/components/og/cards.tsx`.
- `simSeedFor` **must not** read `knowledge` — the flag is cosmetic to the sim.
- Build code stays **18 bytes**; existing codes must still decode (backward-compatible).
- **Ball Knowledge is sandbox-only.** Daily never sets it. `formatDailyBlock` and `daily.test.ts` stay untouched and green.
- **Badge identity:** gold pill + 🧠 with caps text `BALL KNOWLEDGE`. On the satori **OG image** only, drop the emoji (text-only gold pill) — next/og has no emoji provider configured and must not fetch one at the edge.
- **Daily unifies onto the spin builder** — one builder via `GameFlow`.
- **UI tasks (3, 6, 7) REQUIRE the frontend-design skill** for the visual layer; this plan pins the props/state/behavior contract, frontend-design owns the pixels. Keep the whole builder one-handed at 375px and honor `prefers-reduced-motion`.
- **Gate before push:** `npx tsc --noEmit` && `npm run build` && `npx vitest run` all green. Then commit + push to `main` (project's deploy branch; user asked to push to main).

## File Structure

- `src/lib/types.ts` — add `knowledge: boolean` to `BuildCode`. (modify)
- `src/lib/encode.ts` — pack/unpack the flag in the mode byte's high bit. (modify)
- `src/lib/__tests__/encode.test.ts` — cover the flag + backward compat. (modify)
- `src/app/play/page.tsx` — the builder, moved from `/`. (create)
- `src/app/page.tsx` — the landing. (rewrite)
- `src/components/DailyCard.tsx` — client island: daily #, countdown, streak. (create)
- `src/components/Header.tsx` — add Play link. (modify)
- `src/app/b/[code]/page.tsx` — repoint two links to `/play`. (modify)
- `src/app/sitemap.ts` — add `/play`. (modify)
- `src/app/about/page.tsx` — Modes copy: `/play`, Ball Knowledge, "re-spin". (modify)
- `src/components/SandboxGame.tsx` — read `?mode=knowledge`, pass to GameFlow. (modify)
- `src/components/GameFlow.tsx` — accept `knowledge`, encode it, render SpinPhase/FlawSpin. (modify)
- `src/components/ResultCard.tsx` — Ball Knowledge badge. (modify)
- `src/lib/share.ts` — Ball Knowledge line in `resultText`. (modify)
- `src/components/og/cards.tsx` — Ball Knowledge pill (text-only) on both cards. (modify)
- `src/components/SpinPhase.tsx` — new spin→choose builder. (create; replaces ShopPhase usage)
- `src/components/FlawSpin.tsx` — new flaw spin. (create; replaces FlawPhase usage)
- `src/app/globals.css` — reel animation keyframes. (modify)

`ShopPhase.tsx` / `FlawPhase.tsx` are left on disk but no longer imported; delete them in Task 7's commit once nothing references them.

---

## Task 1: Ball Knowledge encoding + type

**Files:**
- Modify: `src/lib/types.ts` (BuildCode)
- Modify: `src/lib/encode.ts:29-66`
- Test: `src/lib/__tests__/encode.test.ts`

**Interfaces:**
- Produces: `BuildCode.knowledge: boolean`; `encodeBuild(build)` sets bit `0x80` of byte 1 when `knowledge`; `decodeBuild(code)` returns `knowledge` and rejects `modeBit > 1`.

- [ ] **Step 1: Extend the round-trip test to cover the flag**

In `src/lib/__tests__/encode.test.ts`, add `knowledge` to `randomValidBuild` and add two tests:

```ts
// inside randomValidBuild's build object, add:
    knowledge: rng() < 0.5,
```

```ts
  it("round-trips the knowledge flag both ways", () => {
    const rng = mulberry32(0x5eed);
    let base: BuildCode | null = null;
    while (!base) base = randomValidBuild(rng);
    for (const knowledge of [true, false]) {
      const b: BuildCode = { ...base, knowledge };
      expect(decodeBuild(encodeBuild(b))).toEqual(b);
    }
  });

  it("a knowledge:false code is byte-compatible with legacy codes (high bit clear)", () => {
    const rng = mulberry32(0xabc123);
    let base: BuildCode | null = null;
    while (!base) base = randomValidBuild(rng);
    const legacy: BuildCode = { ...base, knowledge: false };
    const code = decodeBuild(encodeBuild(legacy));
    expect(code?.knowledge).toBe(false);
  });
```

- [ ] **Step 2: Run the test — expect a TYPE error / failure**

Run: `npx vitest run src/lib/__tests__/encode.test.ts`
Expected: FAIL — `knowledge` does not exist on `BuildCode` (type error) and/or round-trip mismatch.

- [ ] **Step 3: Add `knowledge` to `BuildCode`**

In `src/lib/types.ts`, inside the `BuildCode` type, after `daily`:

```ts
  /** daily number; 0 for sandbox */
  daily: number;
  /** Ball Knowledge modifier — cosmetic to the sim; encoded in the code */
  knowledge: boolean;
```

- [ ] **Step 4: Pack the flag into the mode byte (encode)**

In `src/lib/encode.ts`, replace the mode-byte line in `encodeBuild`:

```ts
  bytes[1] = (build.mode === "daily" ? 1 : 0) | (build.knowledge ? 0x80 : 0);
```

- [ ] **Step 5: Unpack the flag (decode)**

In `src/lib/encode.ts`, replace the mode-decode block in `decodeBuild`:

```ts
  if (bytes[0] !== VERSION) return null;
  const modeByte = bytes[1];
  const modeBit = modeByte & 0x7f;
  if (modeBit > 1) return null;
  const mode: GameMode = modeBit === 1 ? "daily" : "sandbox";
  const knowledge = (modeByte & 0x80) !== 0;
  const seed = ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0;
  const picks = Array.from(bytes.slice(6, 12));
  const flaw = bytes[12];
  const attempt = (bytes[13] << 8) | bytes[14];
  const daily = (bytes[15] << 8) | bytes[16];
  const build: BuildCode = { v: VERSION, mode, seed, picks, flaw, attempt, daily, knowledge };
```

(The `xor` checksum loop is unchanged — it already covers byte 1, so tampering the high bit still fails the existing tamper test.)

- [ ] **Step 6: Run the tests — expect PASS**

Run: `npx vitest run src/lib/__tests__/encode.test.ts`
Expected: PASS (round-trip, tamper, over-budget, knowledge, legacy-compat).

- [ ] **Step 7: Full suite + typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all green. (Note: `GameFlow.runSim` and `daily.test`/`fakeResult` do not yet set `knowledge`; `fakeResult` casts `as unknown as SimResult` so it stays fine. `GameFlow` is fixed in Task 4 — if `tsc` flags the missing `knowledge` in `runSim`'s `BuildCode` here, that is expected and resolved in Task 4. If you need Task 1 green in isolation, temporarily add `knowledge: false` to `runSim`'s build object; Task 4 finalizes it.)

- [ ] **Step 8: Commit**

```bash
git add src/lib/types.ts src/lib/encode.ts src/lib/__tests__/encode.test.ts
git commit -m "feat(encode): pack Ball Knowledge flag into build code"
```

---

## Task 2: Move builder to /play + repoint links

**Files:**
- Create: `src/app/play/page.tsx`
- Rewrite: `src/app/page.tsx` (temporary minimal landing — replaced in Task 3)
- Modify: `src/components/Header.tsx`
- Modify: `src/app/b/[code]/page.tsx:57-74`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/about/page.tsx:76-85`

**Interfaces:**
- Produces: route `/play` renders `<SandboxGame>`; `/` renders a functional (unstyled) landing stub with links to `/play`, `/daily`, `/play?mode=knowledge`.

- [ ] **Step 1: Create `/play` with the current builder**

Create `src/app/play/page.tsx` (verbatim move of the old `/` body):

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { SandboxGame } from "@/components/SandboxGame";

export const metadata: Metadata = {
  title: "Play",
  description: "Build the perfect NBA player with $15. Spin, choose, survive the gauntlet.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <SandboxGame />
    </Suspense>
  );
}
```

- [ ] **Step 2: Replace `/` with a temporary landing stub**

Rewrite `src/app/page.tsx` (Task 3 makes this the real landing):

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="py-8">
      <h1 className="font-display text-5xl uppercase">
        <span className="text-gold">99</span>OVR
      </h1>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/play" className="rounded-lg border border-line p-4">PLAY</Link>
        <Link href="/daily" className="rounded-lg border border-line p-4">DAILY</Link>
        <Link href="/play?mode=knowledge" className="rounded-lg border border-line p-4">BALL KNOWLEDGE</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Play to header nav**

In `src/components/Header.tsx`, add a Play link before Daily inside `<nav>`:

```tsx
        <Link
          href="/play"
          className="rounded-full border border-line px-3 py-1.5 text-paper transition-colors hover:border-gold hover:text-gold"
        >
          Play
        </Link>
```

- [ ] **Step 4: Repoint `/b/[code]` links to `/play`**

In `src/app/b/[code]/page.tsx`, change the "Beat this build" `href` from `` `/?vs=${code}` `` to `` `/play?vs=${code}` `` and the "Build from scratch" `href` from `"/"` to `"/play"`.

- [ ] **Step 5: Add `/play` to the sitemap**

In `src/app/sitemap.ts`, add after the `SITE_URL` entry:

```ts
    { url: `${SITE_URL}/play`, changeFrequency: "weekly", priority: 0.9 },
```

- [ ] **Step 6: Update /about Modes copy**

In `src/app/about/page.tsx`, replace the Modes `<p>` body so Sandbox links to `/play`, add Ball Knowledge, and say "re-spin":

```tsx
        <p className="mt-2 text-paper/90">
          <Link href="/play" className="text-gold underline underline-offset-2">Play</Link> is the
          unlimited sandbox.{" "}
          <Link href="/daily" className="text-gold underline underline-offset-2">Daily</Link> gives everyone the
          same shop and one official run per UTC day — with a streak and a copy-paste result block built for the
          group chat.{" "}
          <Link href="/play?mode=knowledge" className="text-gold underline underline-offset-2">Ball Knowledge</Link>{" "}
          is hard mode: no scouting notes, just names and prices. Every finished build gets a share link that
          challenges anyone who opens it to beat it from the same shop.
        </p>
```

Also, in the rules list, change "One re-roll per slot." wording to "One re-spin per slot." (the `<li>` reading "…drawn from a bigger pool. One re-roll per slot.").

- [ ] **Step 7: Build + typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: green; `/play`, `/`, `/about`, `/b/[code]` all compile.

- [ ] **Step 8: Commit**

```bash
git add src/app/play/page.tsx src/app/page.tsx src/components/Header.tsx src/app/b/ src/app/sitemap.ts src/app/about/page.tsx
git commit -m "feat(routing): move builder to /play, add landing stub + link updates"
```

---

## Task 3: Landing page + DailyCard island

**REQUIRED: invoke the `frontend-design` skill for the hero + cards + how-it-works layout.** This task pins the DailyCard logic and the page structure; frontend-design owns the visual design (82-0-style, one-line hook, court line-work, thumb-reachable cards at 375px).

**Files:**
- Create: `src/components/DailyCard.tsx`
- Rewrite: `src/app/page.tsx`

**Interfaces:**
- Consumes: `dailyNumberFor`, `utcDateString`, `msToNextUtcMidnight`, `formatCountdown` from `@/lib/daily`; `getDailyState` from `@/lib/storage`; `useMounted` from `@/lib/hooks`.
- Produces: `<DailyCard />` client component (self-contained, links to `/daily`).

- [ ] **Step 1: Build the DailyCard island (logic pinned)**

Create `src/components/DailyCard.tsx`. Mount-gate all dynamic values to avoid hydration mismatch; render a skeleton until mounted. frontend-design styles the markup; keep this state logic:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dailyNumberFor, formatCountdown, msToNextUtcMidnight, utcDateString } from "@/lib/daily";
import { useMounted } from "@/lib/hooks";
import { getDailyState } from "@/lib/storage";

export function DailyCard() {
  const mounted = useMounted();
  const [ms, setMs] = useState(0);
  const [info, setInfo] = useState<{ number: number; streak: number } | null>(null);

  useEffect(() => {
    setInfo({ number: dailyNumberFor(utcDateString()), streak: getDailyState().streak });
    setMs(msToNextUtcMidnight());
    const t = setInterval(() => setMs(msToNextUtcMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  const ready = mounted && info;
  const number = ready ? info!.number : null;
  const streak = ready ? info!.streak : null;
  const countdown = ready ? formatCountdown(ms) : "--:--:--";

  return (
    <Link href="/daily" aria-label="Daily challenge" className="block">
      {/* frontend-design: card chrome. Content:
          - eyebrow "DAILY"
          - big "Daily #{number ?? "—"}"
          - "NEXT IN {countdown}" (tabular-nums)
          - "STREAK {streak ?? "—"}"
      */}
    </Link>
  );
}
```

- [ ] **Step 2: Rewrite `/` as the real landing**

Rewrite `src/app/page.tsx` as a server component. Structure (frontend-design fills the visual detail): hero (huge `99OVR` wordmark, one-line hook, court line-work), then three mode cards in order — **PLAY** (`/play`), **`<DailyCard />`** (`/daily`), **BALL KNOWLEDGE** (`/play?mode=knowledge`, tagline "No scouting notes. Just names. Prove you know ball.") — then a how-it-works strip (**Spin → Build → Survive the Gauntlet**). Footer is already global. Set page metadata canonical only:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { DailyCard } from "@/components/DailyCard";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div>
      {/* HERO — frontend-design: huge Wordmark, hook, court accent */}
      {/* MODE CARDS — PLAY / DailyCard / BALL KNOWLEDGE, in this order */}
      {/* HOW IT WORKS — Spin → Build → Survive the Gauntlet */}
    </div>
  );
}
```

Keep the hook copy: **"$15. Six skills from legends. One fatal flaw. Ten 1v1s between you and forever."** (frontend-design may tighten wording but keep the meaning).

- [ ] **Step 3: Visual verification (frontend-design)**

Run the dev server and verify at 375px with the frontend-design browser workflow: hero readable, three cards in order and thumb-reachable, DailyCard shows number/countdown/streak after mount, no hydration warning in console.

- [ ] **Step 4: Build + typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: green.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/DailyCard.tsx
git commit -m "feat(landing): 82-0-style homepage with live Daily card"
```

---

## Task 4: Thread the Ball Knowledge flag through the game flow

**Files:**
- Modify: `src/components/SandboxGame.tsx`
- Modify: `src/components/GameFlow.tsx`

**Interfaces:**
- Consumes: `BuildCode.knowledge` (Task 1).
- Produces: `GameFlow` accepts `knowledge?: boolean`; the `BuildCode` built in `runSim` carries it; `SpinPhase` (Task 6) receives `knowledge`.

- [ ] **Step 1: Read `?mode=knowledge` in SandboxGame**

In `src/components/SandboxGame.tsx`, derive the flag from search params and pass it to `GameFlow`:

```tsx
  const knowledge = params.get("mode") === "knowledge";
```

And on the `<GameFlow>` element add the prop (keep existing props):

```tsx
      <GameFlow
        key={(challenge?.code ?? "sandbox") + (knowledge ? ":bk" : "")}
        mode="sandbox"
        fixedSeed={challenge?.seed}
        challenge={challenge}
        knowledge={knowledge}
      />
```

(Optional, frontend-design touch: when `knowledge`, swap the intro copy/subhead to signal hard mode. Not required for correctness.)

- [ ] **Step 2: Accept + encode `knowledge` in GameFlow**

In `src/components/GameFlow.tsx`:

1. Add `knowledge = false` to the destructured props and its type:

```tsx
  challenge = null,
  knowledge = false,
  topPct = null,
  onOfficialComplete,
}: {
  mode: GameMode;
  fixedSeed?: number;
  daily?: { number: number; date: string };
  official?: boolean;
  startAttempt?: number;
  challenge?: Challenge | null;
  knowledge?: boolean;
  topPct?: number | null;
  onOfficialComplete?: (result: SimResult, code: string, block: string) => void;
}) {
```

2. In `runSim`, add `knowledge` to the `BuildCode`:

```tsx
      const build: BuildCode = {
        v: 1,
        mode,
        seed,
        picks: SLOTS.map((s) => picks[s]!),
        flaw: flawIdx,
        attempt: withAttempt,
        daily: daily?.number ?? 0,
        knowledge,
      };
```

Add `knowledge` to `runSim`'s `useCallback` dependency array.

- [ ] **Step 3: Build + typecheck**

Run: `npx tsc --noEmit`
Expected: green (this resolves any Task-1 note about `runSim` missing `knowledge`).

- [ ] **Step 4: Commit**

```bash
git add src/components/SandboxGame.tsx src/components/GameFlow.tsx
git commit -m "feat(knowledge): thread ?mode=knowledge into the encoded build"
```

---

## Task 5: Ball Knowledge badge on result surfaces

**Files:**
- Modify: `src/components/ResultCard.tsx:89-98`
- Modify: `src/lib/share.ts:12-28`
- Modify: `src/components/og/cards.tsx` (both `OgLandscape` and `OgPortrait`)

**Interfaces:**
- Consumes: `result.build.knowledge`.
- Produces: gold pill + 🧠 `BALL KNOWLEDGE` on the in-app card; `🧠 Ball Knowledge (names only)` line in sandbox share text; text-only gold pill on both OG images.

- [ ] **Step 1: Badge on ResultCard**

In `src/components/ResultCard.tsx`, in the chip row (the `<span className="flex items-center gap-2">` after the `99OVR` label), add the badge before the mode chip, gated on `build.knowledge`:

```tsx
          <span className="flex items-center gap-2">
            {build.knowledge ? (
              <span className="rounded-sm border border-gold/70 px-1.5 py-0.5 text-gold">🧠 BALL KNOWLEDGE</span>
            ) : null}
            {modeChip ? <span className="rounded-sm border border-line px-1.5 py-0.5">{modeChip}</span> : null}
            <span className="rounded-sm border border-line px-1.5 py-0.5">SIM #{build.attempt + 1}</span>
          </span>
```

(`build` is already destructured in `ResultCard`. This automatically covers `/b/[code]`, which renders `ResultCard`.)

- [ ] **Step 2: Ball Knowledge line in the share text**

In `src/lib/share.ts`, in `resultText`, add the line only for knowledge builds. Replace the returned array:

```ts
  const lines = [
    `99OVR — ${derived.ovr} OVR · ${archetype.name}`,
  ];
  if (result.build.knowledge) lines.push("🧠 Ball Knowledge (names only)");
  lines.push(ladderLine, squares, `Beat my build → ${buildUrl(code)}`);
  return lines.join("\n");
```

- [ ] **Step 3: Text-only gold pill on both OG cards**

In `src/components/og/cards.tsx`, add a reusable pill next to the existing mode chip in **both** `OgLandscape` and `OgPortrait`. The existing chip is the `<span>` reading `build.mode === "daily" ? ... : "SANDBOX BUILD"` (landscape) / `"SIM #…"` (portrait). Immediately after that span, inside the same flex row, add (no emoji — satori):

```tsx
            {build.knowledge ? (
              <span
                style={{
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: 16,
                  color: GOLD,
                  border: `2px solid ${GOLD}`,
                  borderRadius: 6,
                  padding: "3px 10px",
                  letterSpacing: 3,
                }}
              >
                BALL KNOWLEDGE
              </span>
            ) : null}
```

(`build` and `GOLD` are already in scope in both functions. Match `fontSize`/`padding` to each card's existing chip — 16/`"3px 10px"` for landscape, 18/`"4px 12px"` for portrait.)

- [ ] **Step 4: Verify — encode a knowledge build and open its surfaces (frontend-design/browser)**

Start dev server, go to `/play?mode=knowledge`, complete a build, confirm: the in-app card shows `🧠 BALL KNOWLEDGE`; "Copy result" text contains the 🧠 line; open `/api/og?b=<code>` (grab the code from the share link) and confirm the `BALL KNOWLEDGE` pill renders; a non-knowledge build shows none of these.

- [ ] **Step 5: Build + typecheck + tests**

Run: `npx tsc --noEmit && npm run build && npx vitest run`
Expected: green (daily.test.ts untouched and passing).

- [ ] **Step 6: Commit**

```bash
git add src/components/ResultCard.tsx src/lib/share.ts src/components/og/cards.tsx
git commit -m "feat(knowledge): BALL KNOWLEDGE badge on card, share text, and OG"
```

---

## Task 6: Spin → Choose builder (SpinPhase)

**REQUIRED: invoke the `frontend-design` skill.** This task pins the state machine, the seeded-draw reuse, the affordability guard, re-spin, knowledge blur-hiding, and reduced-motion; frontend-design builds the reel visuals, header, cards, and thumb-reach layout at 375px.

**Files:**
- Create: `src/components/SpinPhase.tsx`
- Modify: `src/app/globals.css` (reel keyframes)
- Modify: `src/components/GameFlow.tsx:187-198` (render SpinPhase instead of ShopPhase)

**Interfaces:**
- Consumes: `ShopDraw` + `canPick` from `@/lib/shop`; `POOL` from `@/data/pool`; `BUDGET` from `@/lib/sim`; `SLOTS`, `SLOT_LABELS`, `SlotId`, `PoolEntry` from `@/lib/types`; `TIER_HEX`, `tierForPrice` from `@/lib/tiers`; `usePrefersReducedMotion` from `@/lib/hooks`.
- Produces: `<SpinPhase>` with props `{ draw, picks, rerolled, spend, knowledge, shakeNonce, onPick, onReroll, onComplete }` (same callback contract `GameFlow` already passes to `ShopPhase`, plus `knowledge`).

**Behavior contract (must hold exactly):**
- Sequential cursor = first slot in `SLOTS` order with `picks[slot] === undefined`. Only that slot's screen is active.
- Per-slot reel state: `"idle" → (SPIN) → "spinning" (~1s) → "landed"`. `landed` reveals the 5 cards `draw[slot]` (existing seeded draw — reel is cosmetic; **never** compute picks from the reel). Reduced motion: SPIN jumps straight to `landed`.
- The 5 reel names blur past using `POOL[slot].map(e => e.name)`; the landed cards are `draw[slot].map(poolIdx => POOL[slot][poolIdx])`.
- Card affordability: `canPick(picks, slot, entry.price).ok`. Locked cards are greyed (opacity ~0.45) and non-selectable to advance; tapping one still calls `onPick` so `GameFlow.handlePick` rejects it and shows the reason toast (reuse existing behavior; do **not** duplicate the reason logic).
- Picking an affordable card calls `onPick(slot, poolIdx)`. Advance is detected by the filled-count increasing (mirror `ShopPhase`'s `prevFilled` effect); on advance, the next slot starts at `idle`.
- Re-spin: one per slot → button "RE-SPIN (1 left)", disabled/hidden once `rerolled.includes(slot)`. It calls `onReroll(slot)` (clears the pick + advances the seeded permutation) and resets that slot's reel to `idle` (requires a new SPIN).
- Persistent header: budget remaining `BUDGET - spend` (big, gold; dim at 0), a 6-dot progress row (filled / current / empty), and chips of picks so far (`SLOTS` where `picks[s] !== undefined` → `POOL[s][picks[s]].name`). Shake the header on `shakeNonce` change (reuse the `.shake` class pattern from `ShopPhase`).
- Knowledge: when `knowledge` is true, cards render **name + price only** — omit `entry.blurb` and `entry.tags`.
- When all 6 slots are filled → show a CTA that calls `onComplete()`.
- One-handed @375px: header pinned top; SPIN button + card row in lower-half thumb reach.

- [ ] **Step 1: Add reel keyframes to globals.css**

Append to `src/app/globals.css` (the global `prefers-reduced-motion` block already neutralizes duration as a backstop):

```css
/* Spin reel */
@keyframes reelBlur {
  0% { transform: translateY(0); filter: blur(0); }
  15% { filter: blur(6px); }
  85% { filter: blur(6px); }
  100% { transform: translateY(var(--reel-travel, -1200px)); filter: blur(0); }
}
.reel-spin {
  animation: reelBlur 1s cubic-bezier(0.15, 0.85, 0.25, 1) both;
}
```

- [ ] **Step 2: Create SpinPhase (frontend-design owns the JSX; wire this contract)**

Create `src/components/SpinPhase.tsx` implementing the Behavior contract above. Skeleton to fill in with frontend-design:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { POOL } from "@/data/pool";
import { canPick, type ShopDraw } from "@/lib/shop";
import { BUDGET } from "@/lib/sim";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { TIER_HEX, tierForPrice } from "@/lib/tiers";
import { SLOTS, SLOT_LABELS, type PoolEntry, type SlotId } from "@/lib/types";

type Reel = "idle" | "spinning" | "landed";

export function SpinPhase({
  draw,
  picks,
  rerolled,
  spend,
  knowledge,
  shakeNonce,
  onPick,
  onReroll,
  onComplete,
}: {
  draw: ShopDraw;
  picks: Partial<Record<SlotId, number>>;
  rerolled: SlotId[];
  spend: number;
  knowledge: boolean;
  shakeNonce: number;
  onPick: (slot: SlotId, poolIdx: number) => void;
  onReroll: (slot: SlotId) => void;
  onComplete: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const filled = SLOTS.filter((s) => picks[s] !== undefined).length;
  const complete = filled === SLOTS.length;
  const cursor = SLOTS.find((s) => picks[s] === undefined) ?? null;
  const [reel, setReel] = useState<Reel>("idle");

  // reset the reel whenever the active slot changes or is re-spun
  useEffect(() => { setReel("idle"); }, [cursor, rerolled.length]);

  const spin = () => {
    if (reduced) { setReel("landed"); return; }
    setReel("spinning");
    const t = setTimeout(() => setReel("landed"), 1000);
    return () => clearTimeout(t);
  };

  // header shake on rejected pick — reuse the .shake class
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!shakeNonce || !headerRef.current) return;
    const el = headerRef.current;
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
  }, [shakeNonce]);

  // frontend-design: header (budget/dots/chips), the active slot's SPIN + reel,
  // landed cards (name+price; blurb+tags only when !knowledge), RE-SPIN, and the
  // complete → onComplete CTA. Cards: greyed when !canPick(picks, cursor, entry.price).ok;
  // tapping still calls onPick so GameFlow rejects with a reason toast.
  return <div>{/* ... */}</div>;
}
```

- [ ] **Step 3: Swap ShopPhase → SpinPhase in GameFlow**

In `src/components/GameFlow.tsx`, replace the `import { ShopPhase }` with `import { SpinPhase }`, and replace the `phase === "shop"` render block with:

```tsx
      {phase === "shop" ? (
        <SpinPhase
          draw={draw}
          picks={picks}
          rerolled={rerolled}
          spend={spend}
          knowledge={knowledge}
          shakeNonce={shakeNonce}
          onPick={handlePick}
          onReroll={handleReroll}
          onComplete={() => setPhase("flaw")}
        />
      ) : null}
```

- [ ] **Step 4: Visual + behavior verification (frontend-design)**

At 375px: SPIN reels ~1s then lands 5 cards; picking auto-advances; RE-SPIN gives a fresh spin once then disables; over-budget cards greyed and rejected with a reason; header budget/dots/chips update; knowledge mode (`/play?mode=knowledge`) shows names+prices only; with reduced motion the reel is skipped. Confirm the same seed still yields the same landed options (determinism unchanged) by re-loading a `?vs=` duel and checking the draw matches.

- [ ] **Step 5: Build + typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: green.

- [ ] **Step 6: Commit**

```bash
git add src/components/SpinPhase.tsx src/app/globals.css src/components/GameFlow.tsx
git commit -m "feat(builder): spin→choose SpinPhase replaces the all-slots shop"
```

---

## Task 7: Flaw spin (FlawSpin) + cleanup

**REQUIRED: invoke the `frontend-design` skill** for the wheel visuals.

**Files:**
- Create: `src/components/FlawSpin.tsx`
- Modify: `src/components/GameFlow.tsx:200-208` (render FlawSpin instead of FlawPhase)
- Delete: `src/components/ShopPhase.tsx`, `src/components/FlawPhase.tsx` (now unreferenced)

**Interfaces:**
- Consumes: `FLAWS` from `@/data/flaws`; `flawHint` from `@/lib/flawHint`; `usePrefersReducedMotion`.
- Produces: `<FlawSpin>` with the same props `GameFlow` passes to `FlawPhase`: `{ choices, selected, onSelect, onAccept, onBack }`.

**Behavior contract:**
- `idle → (SPIN) → spinning (~1s wheel) → landed`; `landed` reveals the 3 options `choices` (indices into `FLAWS` from `drawFlaws`). Reduced motion → instant `landed`.
- Picking one calls `onSelect(flawIdx)`; an Accept CTA (shown once a flaw is selected) calls `onAccept()`.
- `onBack` returns to the build (the shop phase).

- [ ] **Step 1: Create FlawSpin (frontend-design owns the wheel; wire this contract)**

Create `src/components/FlawSpin.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { FLAWS } from "@/data/flaws";
import { flawHint } from "@/lib/flawHint";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Reel = "idle" | "spinning" | "landed";

export function FlawSpin({
  choices,
  selected,
  onSelect,
  onAccept,
  onBack,
}: {
  choices: number[];
  selected: number | null;
  onSelect: (flawIdx: number) => void;
  onAccept: () => void;
  onBack: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [reel, setReel] = useState<Reel>("idle");
  const spin = () => {
    if (reduced) { setReel("landed"); return; }
    setReel("spinning");
    const t = setTimeout(() => setReel("landed"), 1000);
    return () => clearTimeout(t);
  };
  // frontend-design: "Every legend has one" header, SPIN a flaw wheel,
  // landed → the 3 FLAWS[choices] cards (name, desc, flawHint tag),
  // pick → onSelect; Accept CTA → onAccept; a back affordance → onBack.
  return <div>{/* ... */}</div>;
}
```

- [ ] **Step 2: Swap FlawPhase → FlawSpin in GameFlow**

In `src/components/GameFlow.tsx`, replace `import { FlawPhase }` with `import { FlawSpin }`, and replace the `phase === "flaw"` block:

```tsx
      {phase === "flaw" ? (
        <FlawSpin
          choices={flawChoices}
          selected={flawIdx}
          onSelect={setFlawIdx}
          onAccept={() => runSim(attempt)}
          onBack={() => setPhase("shop")}
        />
      ) : null}
```

- [ ] **Step 3: Delete the dead components**

```bash
git rm src/components/ShopPhase.tsx src/components/FlawPhase.tsx
```

Verify nothing imports them:

Run: `grep -rn "ShopPhase\|FlawPhase" src/`
Expected: no matches.

- [ ] **Step 4: Verification (frontend-design) + full gate**

Verify the flaw spin lands on 3 options, pick + accept runs the sim, back returns to build, reduced motion skips the wheel.

Run: `npx tsc --noEmit && npm run build && npx vitest run`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/components/FlawSpin.tsx src/components/GameFlow.tsx
git commit -m "feat(builder): flaw spin replaces the flaw list; remove dead phases"
```

---

## Task 8: Final gate + push to main

**Files:** none (verification + release).

- [ ] **Step 1: Full local gate**

Run: `npx tsc --noEmit && npm run build && npx vitest run`
Expected: all green. If anything fails, fix before proceeding.

- [ ] **Step 2: Manual smoke at 375px (frontend-design/browser)**

Verify end to end: `/` landing (three cards, live Daily card) → `/play` spin build → flaw spin → result with share → `/play?mode=knowledge` shows names-only + 🧠 badge on the card and OG → `/daily` official run uses the spin builder and its emoji block is unchanged → a shared `/b/[code]` opens, "Beat this build" → `/play?vs=…`.

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

Report the pushed commit range and confirm the working tree is clean (`git status`).

---

## Self-Review

**Spec coverage:**
- Landing (hero, 3 cards in order, live Daily, how-it-works, footer/legal, keeps site OG) → Task 2 (stub) + Task 3. ✓
- Ball Knowledge: hides blurbs (Task 6 knowledge branch) ✓; badge on card/`/b/`/OG/emoji (Task 5) ✓; flag encoded (Task 1) ✓; reached via `/play?mode=knowledge` (Task 4) ✓.
- Spin builder: sequential 1→6, SPIN reel cosmetic over seeded draw, pick→auto-advance (Task 6) ✓; determinism/daily seeding/re-roll unchanged (reuses `drawShop`/`drawFlaws`/`handleReroll`) ✓; RE-SPIN (1 left) (Task 6) ✓; persistent header budget/dots/chips (Task 6) ✓; affordability guard + lock reason (Task 6, reuses `canPick`) ✓; flaw becomes a spin (Task 7) ✓; reduced-motion instant (Tasks 6/7) ✓; one-handed @375px (Tasks 3/6/7) ✓.
- Links/sitemap/about updated (Task 2) ✓. Push to main (Task 8) ✓.

**Placeholder scan:** UI JSX is intentionally delegated to frontend-design, but every behavior, prop type, and logic branch is specified; no "add error handling"/"TBD"/"similar to Task N" left in logic steps. ✓

**Type consistency:** `BuildCode.knowledge: boolean` (Task 1) is consumed identically in `runSim` (Task 4), `ResultCard`/`share`/`og` via `result.build.knowledge` (Task 5), and `SpinPhase` `knowledge` prop (Task 6). Callback contracts for `SpinPhase`/`FlawSpin` match what `GameFlow` already passes to `ShopPhase`/`FlawPhase`. ✓
