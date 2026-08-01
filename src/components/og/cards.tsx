/**
 * JSX for the edge-rendered share images (satori). Inline styles only,
 * explicit display:flex on every multi-child container — satori rules.
 */
import { GRADE_HEX } from "@/lib/grade";
import { STEAL_BUDGET, stealBudgetFor } from "@/lib/steal";
import { TIER_HEX, TIER_NAMES, tierFor, tierForPrice } from "@/lib/tiers";
import { ATTR_ABBR, POSITION_LABELS, type SimResult, type StealResult } from "@/lib/types";

const INK = "#0b1220";
const PANEL = "#111a2e";
const LINE = "#26314b";
const PAPER = "#f2efe6";
const DIM = "#8e99af";
const GOLD = "#f2b94b";
const WIN = "#3fb68b";
const LOSS = "#e5484d";

const SLOT_ABBR: Record<string, string> = {
  jumpshot: "JUMPSHOT",
  handles: "HANDLES",
  finishing: "FINISHING",
  defense: "DEFENSE",
  athleticism: "ATHLETICISM",
  iq: "IQ",
  passing: "PASSING",
  durability: "DURABILITY",
};

/**
 * Satori's glyph fallback mangles diacritics (Anton's lowercase ć reads as Ć),
 * so the image surface uses the ASCII spellings NBA Twitter uses anyway.
 * The in-app card keeps the proper marks.
 */
function ogSafe(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function Squares({ result, size, gap = 6 }: { result: { fellAt: number | null }; size: number; gap?: number }) {
  const { fellAt } = result;
  return (
    <div style={{ display: "flex", gap }}>
      {Array.from({ length: 10 }, (_, i) => {
        const rung = i + 1;
        const state = fellAt === null || rung < fellAt ? "win" : rung === fellAt ? "loss" : "off";
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: size / 5,
              background: state === "win" ? WIN : state === "loss" ? LOSS : "transparent",
              border: state === "off" ? `2px solid ${LINE}` : "none",
              display: "flex",
            }}
          />
        );
      })}
    </div>
  );
}

function PickRow({ result, scale = 1 }: { result: SimResult; scale?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 * scale }}>
      {result.entries.map((e) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52 * scale,
              height: 34 * scale,
              borderRadius: 6 * scale,
              background: TIER_HEX[tierForPrice(e.price)],
              color: INK,
              fontFamily: "Anton",
              fontSize: 20 * scale,
            }}
          >
            ${e.price}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 21 * scale, color: PAPER }}>
              {ogSafe(e.name)}
            </span>
            <span style={{ fontFamily: "Inter", fontSize: 12 * scale, color: DIM, letterSpacing: 2 }}>
              {SLOT_ABBR[e.slot]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function gauntletLine(result: SimResult): { text: string; color: string } {
  if (result.fellAt === null) return { text: "CLEARED THE GAUNTLET", color: WIN };
  const opp = result.gauntlet[result.fellAt - 1];
  return {
    text: `${result.injured ? "INJURED" : "LOST"} · ROUND ${result.fellAt} BOSS: ${opp.shortName.toUpperCase()}`,
    color: LOSS,
  };
}

function CourtArc({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", top: 0, left: 0, opacity: 0.3 }}
    >
      <path
        d={`M ${-width * 0.15} ${height * 1.25} A ${width * 0.62} ${width * 0.62} 0 0 1 ${width * 1.15} ${height * 1.25}`}
        stroke={LINE}
        strokeWidth={3}
        fill="none"
      />
      <circle cx={width} cy={height * 0.1} r={width * 0.12} stroke={LINE} strokeWidth={3} fill="none" />
    </svg>
  );
}

/** 1200×630 — what iMessage/X unfurl. A trading card, not a website. */
export function OgLandscape({ result }: { result: SimResult }) {
  const { derived, archetype, flaw, build } = result;
  const tier = tierFor(derived.ovr);
  const hex = TIER_HEX[tier];
  const gl = gauntletLine(result);
  const position = build.position && build.position !== "ALL" ? ` ${POSITION_LABELS[build.position]}` : "";
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background: INK,
        padding: 26,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          border: `8px solid ${hex}`,
          borderRadius: 26,
          background: PANEL,
          position: "relative",
          overflow: "hidden",
          padding: "30px 44px",
        }}
      >
        <CourtArc width={1120} height={550} />

        {/* left: the number and the story */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: "Anton", fontSize: 30, color: PAPER, letterSpacing: 1 }}>
              <span style={{ color: GOLD }}>99</span>OVR
            </span>
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 16,
                color: DIM,
                border: `2px solid ${LINE}`,
                borderRadius: 6,
                padding: "3px 10px",
                letterSpacing: 3,
              }}
            >
              {build.mode === "daily" ? `DAILY #${build.daily}` : "BUDGET BALL"}
            </span>
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
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: -20 }}>
            <span style={{ fontFamily: "Anton", fontSize: 240, color: hex, lineHeight: 1.05 }}>
              {derived.ovr}
            </span>
            <div style={{ display: "flex", flexDirection: "column", paddingBottom: 52 }}>
              <span style={{ fontFamily: "Anton", fontSize: 32, color: hex, letterSpacing: 6 }}>OVR{position}</span>
              <span style={{ fontFamily: "Anton", fontSize: 34, color: hex, letterSpacing: 3 }}>
                {TIER_NAMES[tier].toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: -24 }}>
            <span
              style={{
                fontFamily: "Anton",
                fontSize: 40,
                color: hex,
                border: `5px solid ${hex}`,
                padding: "3px 18px",
                transform: "rotate(-3deg)",
                letterSpacing: 2,
              }}
            >
              {archetype.name.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
            <Squares result={result} size={24} />
            <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 21, color: gl.color, letterSpacing: 3 }}>
              {gl.text}
            </span>
          </div>

          <span
            style={{
              fontFamily: "Inter",
              fontSize: 24,
              color: PAPER,
              marginTop: 20,
              maxWidth: 640,
              lineHeight: 1.3,
            }}
          >
            “{result.roast}”
          </span>
        </div>

        {/* right: the receipt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 330,
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <PickRow result={result} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderLeft: `4px solid ${LOSS}`,
                paddingLeft: 14,
              }}
            >
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13, color: LOSS, letterSpacing: 3 }}>
                FLAW
              </span>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: PAPER }}>{flaw.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "Anton", fontSize: 30, color: GOLD, letterSpacing: 2 }}>99OVR.APP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 1080×1350 — the IG/TikTok download card. */
export function OgPortrait({ result }: { result: SimResult }) {
  const { derived, archetype, flaw, build } = result;
  const tier = tierFor(derived.ovr);
  const hex = TIER_HEX[tier];
  const gl = gauntletLine(result);
  const position = build.position && build.position !== "ALL" ? ` ${POSITION_LABELS[build.position]}` : "";
  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        display: "flex",
        background: INK,
        padding: 30,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `10px solid ${hex}`,
          borderRadius: 30,
          background: PANEL,
          position: "relative",
          overflow: "hidden",
          padding: "42px 54px",
          alignItems: "center",
        }}
      >
        <CourtArc width={960} height={1250} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <span style={{ fontFamily: "Anton", fontSize: 40, color: PAPER, letterSpacing: 1 }}>
            <span style={{ color: GOLD }}>99</span>OVR
          </span>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 18,
              color: DIM,
              border: `2px solid ${LINE}`,
              borderRadius: 6,
              padding: "4px 12px",
              letterSpacing: 3,
            }}
          >
            {build.mode === "daily" ? `DAILY #${build.daily}` : "BUDGET BALL"}
          </span>
          {build.knowledge ? (
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 18,
                color: GOLD,
                border: `2px solid ${GOLD}`,
                borderRadius: 6,
                padding: "4px 12px",
                letterSpacing: 3,
              }}
            >
              BALL KNOWLEDGE
            </span>
          ) : null}
        </div>

        <span style={{ fontFamily: "Anton", fontSize: 380, color: hex, lineHeight: 1, position: "relative" }}>
          {derived.ovr}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", marginTop: 20 }}>
          <span style={{ fontFamily: "Anton", fontSize: 30, color: PAPER, letterSpacing: 8 }}>OVR{position}</span>
          <span style={{ fontFamily: "Anton", fontSize: 58, color: hex, letterSpacing: 5 }}>
            {TIER_NAMES[tier].toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 30, position: "relative" }}>
          <span
            style={{
              fontFamily: "Anton",
              fontSize: 56,
              color: hex,
              border: `6px solid ${hex}`,
              padding: "6px 26px",
              transform: "rotate(-3deg)",
              letterSpacing: 2,
            }}
          >
            {archetype.name.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 40, position: "relative" }}>
          <Squares result={result} size={38} gap={9} />
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 26, color: gl.color, letterSpacing: 3 }}>
            {gl.text}
          </span>
        </div>

        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", marginTop: 46, position: "relative" }}>
          <PickRow result={result} scale={1.15} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 18, width: 330 }}>
            <div style={{ display: "flex", flexDirection: "column", borderLeft: `5px solid ${LOSS}`, paddingLeft: 16 }}>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: LOSS, letterSpacing: 3 }}>
                FLAW
              </span>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: PAPER }}>{flaw.name}</span>
            </div>
          </div>
        </div>

        <span
          style={{
            fontFamily: "Inter",
            fontSize: 28,
            color: PAPER,
            marginTop: 40,
            lineHeight: 1.4,
            position: "relative",
            textAlign: "center",
          }}
        >
          “{result.roast}”
        </span>

        <div style={{ display: "flex", flex: 1 }} />
        <span style={{ fontFamily: "Anton", fontSize: 40, color: GOLD, letterSpacing: 3, position: "relative" }}>
          99OVR.APP
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* v3 — Six Steals                                                     */
/* ------------------------------------------------------------------ */

function Chip({ text, color, border, size = 16 }: { text: string; color: string; border: string; size?: number }) {
  return (
    <span
      style={{
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: size,
        color,
        border: `2px solid ${border}`,
        borderRadius: 6,
        padding: "3px 10px",
        letterSpacing: 3,
      }}
    >
      {text}
    </span>
  );
}

/** The six grades in a row — the v3 twin of the price receipt. */
function GradeRow({ result, scale = 1 }: { result: StealResult; scale?: number }) {
  return (
    <div style={{ display: "flex", gap: 8 * scale }}>
      {result.steals.map((steal) => (
        <div
          key={steal.attr}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 * scale }}
        >
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 12 * scale, color: DIM, letterSpacing: 1 }}>
            {ATTR_ABBR[steal.attr]}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 46 * scale,
              height: 38 * scale,
              border: `3px solid ${GRADE_HEX[steal.grade]}`,
              color: GRADE_HEX[steal.grade],
              fontFamily: "Anton",
              fontSize: 24 * scale,
            }}
          >
            {steal.grade}
          </span>
        </div>
      ))}
    </div>
  );
}

function StealRows({ result, scale = 1 }: { result: StealResult; scale?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 * scale }}>
      {result.steals.map((steal) => (
        <div key={steal.attr} style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52 * scale,
              height: 32 * scale,
              borderRadius: 6 * scale,
              background: GRADE_HEX[steal.grade],
              color: INK,
              fontFamily: "Anton",
              fontSize: 19 * scale,
            }}
          >
            {steal.grade}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20 * scale, color: PAPER }}>
              {ogSafe(steal.player.name)}
            </span>
            <span style={{ fontFamily: "Inter", fontSize: 12 * scale, color: DIM, letterSpacing: 2 }}>
              {ATTR_ABBR[steal.attr]} · {ogSafe(steal.bucket.label)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function stealGauntletLine(result: StealResult): { text: string; color: string } {
  if (result.fellAt === null) return { text: "CLEARED THE GAUNTLET", color: WIN };
  const opp = result.gauntlet[result.fellAt - 1];
  return {
    text: `${result.injured ? "INJURED" : "LOST"} · ROUND ${result.fellAt} BOSS: ${opp.shortName.toUpperCase()}`,
    color: LOSS,
  };
}

function stealModeChip(result: StealResult): string {
  const { build } = result;
  if (build.mode === "daily") return `DAILY #${build.daily}`;
  if (build.mode === "budget") return "BUDGET";
  if (build.v === 4) return "CLASSIC";
  return "SIX STEALS";
}

/** The chip row every steal OG card opens with: brand, mode, target, knowledge. */
function StealChips({ result, size = 16 }: { result: StealResult; size?: number }) {
  const { build } = result;
  const target = build.target ?? "ALL";
  return (
    <>
      <Chip text={stealModeChip(result)} color={DIM} border={LINE} size={size} />
      {target !== "ALL" ? <Chip text={`BEST ${target} BUILD`} color={GOLD} border={GOLD} size={size} /> : null}
      {build.knowledge ? <Chip text="BALL KNOWLEDGE" color={GOLD} border={GOLD} size={size} /> : null}
    </>
  );
}

/** FLAW sidebar block — Budget (and v3) only; classic/daily runs have none. */
function FlawBlock({ result, scale = 1 }: { result: StealResult; scale?: number }) {
  if (!result.flaw) return null;
  const budget = result.build.v >= 4 && result.build.mode === "budget";
  return (
    <div style={{ display: "flex", flexDirection: "column", borderLeft: `4px solid ${LOSS}`, paddingLeft: 14 * scale }}>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13 * scale, color: LOSS, letterSpacing: 3 }}>
        FLAW{budget ? ` · +$${result.refund} BACK` : ""}
      </span>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 19 * scale, color: PAPER }}>
        {result.flaw.name}
      </span>
      {budget ? (
        <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 14 * scale, color: GOLD, marginTop: 4 * scale }}>
          ${result.spent} SPENT OF ${stealBudgetFor(result.build.v) + result.refund}
        </span>
      ) : null}
    </div>
  );
}

/** 1200×630 — what iMessage/X unfurl for a Six Steals run. */
export function OgStealLandscape({ result }: { result: StealResult }) {
  const { derived, archetype } = result;
  const tier = tierFor(derived.ovr);
  const hex = TIER_HEX[tier];
  const gl = stealGauntletLine(result);
  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: INK, padding: 26, fontFamily: "Inter" }}>
      <div
        style={{
          display: "flex",
          flex: 1,
          border: `8px solid ${hex}`,
          borderRadius: 26,
          background: PANEL,
          position: "relative",
          overflow: "hidden",
          padding: "28px 40px",
        }}
      >
        <CourtArc width={1120} height={550} />

        <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "Anton", fontSize: 30, color: PAPER, letterSpacing: 1 }}>
              <span style={{ color: GOLD }}>99</span>OVR
            </span>
            <StealChips result={result} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: -14 }}>
            <span style={{ fontFamily: "Anton", fontSize: 210, color: hex, lineHeight: 1.05 }}>{derived.ovr}</span>
            <div style={{ display: "flex", flexDirection: "column", paddingBottom: 46 }}>
              <span style={{ fontFamily: "Anton", fontSize: 30, color: hex, letterSpacing: 6 }}>OVR</span>
              <span style={{ fontFamily: "Anton", fontSize: 32, color: hex, letterSpacing: 3 }}>
                {TIER_NAMES[tier].toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: -18 }}>
            <span
              style={{
                fontFamily: "Anton",
                fontSize: 36,
                color: hex,
                border: `5px solid ${hex}`,
                padding: "3px 16px",
                transform: "rotate(-3deg)",
                letterSpacing: 2,
              }}
            >
              {archetype.name.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", marginTop: 24 }}>
            <GradeRow result={result} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 20 }}>
            <Squares result={result} size={22} />
            <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: gl.color, letterSpacing: 3 }}>
              {gl.text}
            </span>
          </div>

          <span style={{ fontFamily: "Inter", fontSize: 22, color: PAPER, marginTop: 16, maxWidth: 620, lineHeight: 1.3 }}>
            “{result.roast}”
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 340,
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <StealRows result={result} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FlawBlock result={result} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "Anton", fontSize: 30, color: GOLD, letterSpacing: 2 }}>99OVR.APP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 1080×1350 — the IG/TikTok download card for a Six Steals run. */
export function OgStealPortrait({ result }: { result: StealResult }) {
  const { derived, archetype } = result;
  const tier = tierFor(derived.ovr);
  const hex = TIER_HEX[tier];
  const gl = stealGauntletLine(result);
  return (
    <div style={{ width: 1080, height: 1350, display: "flex", background: INK, padding: 30, fontFamily: "Inter" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `10px solid ${hex}`,
          borderRadius: 30,
          background: PANEL,
          position: "relative",
          overflow: "hidden",
          padding: "38px 50px",
          alignItems: "center",
        }}
      >
        <CourtArc width={960} height={1250} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <span style={{ fontFamily: "Anton", fontSize: 38, color: PAPER, letterSpacing: 1 }}>
            <span style={{ color: GOLD }}>99</span>OVR
          </span>
          <StealChips result={result} size={18} />
        </div>

        {/* Anton's glyphs overshoot their line box, so the tier block needs real
            clearance under the number or it renders on top of the digits. */}
        <span style={{ fontFamily: "Anton", fontSize: 272, color: hex, lineHeight: 1, position: "relative" }}>
          {derived.ovr}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", marginTop: 132 }}>
          <span style={{ fontFamily: "Anton", fontSize: 28, color: PAPER, letterSpacing: 8 }}>OVR</span>
          <span style={{ fontFamily: "Anton", fontSize: 54, color: hex, letterSpacing: 5 }}>
            {TIER_NAMES[tier].toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 22, position: "relative" }}>
          <span
            style={{
              fontFamily: "Anton",
              fontSize: 52,
              color: hex,
              border: `6px solid ${hex}`,
              padding: "6px 24px",
              transform: "rotate(-3deg)",
              letterSpacing: 2,
            }}
          >
            {archetype.name.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 34, position: "relative" }}>
          <GradeRow result={result} scale={1.25} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 30, position: "relative" }}>
          <Squares result={result} size={34} gap={8} />
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: gl.color, letterSpacing: 3 }}>
            {gl.text}
          </span>
        </div>

        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", marginTop: 34, position: "relative" }}>
          <StealRows result={result} scale={1.1} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16, width: 300 }}>
            <FlawBlock result={result} scale={1.1} />
          </div>
        </div>

        <span
          style={{
            fontFamily: "Inter",
            fontSize: 26,
            color: PAPER,
            marginTop: 30,
            lineHeight: 1.4,
            position: "relative",
            textAlign: "center",
          }}
        >
          “{result.roast}”
        </span>

        <div style={{ display: "flex", flex: 1 }} />
        <span style={{ fontFamily: "Anton", fontSize: 38, color: GOLD, letterSpacing: 3, position: "relative" }}>
          99OVR.APP
        </span>
      </div>
    </div>
  );
}

export type HeroVariant = "default" | "daily" | "classic" | "budget" | "h2h";

const HERO_COPY: Record<HeroVariant, { tagline: string; sub: string; prices: boolean }> = {
  default: { tagline: "SPIN A DECADE. READ THE ROSTER. STEAL THE SKILL.", sub: "FOUR MODES · SIX STEALS · TEN BOSSES", prices: false },
  daily: { tagline: "SAME WHEEL FOR EVERYONE ON EARTH.", sub: "DAILY · ONE OFFICIAL RUN · ARCADE LEADERBOARD", prices: false },
  classic: { tagline: "SIX SPINS. SIX ROSTERS. NO PRICES.", sub: "CLASSIC · BEST PLAYER OR A POSITIONAL CROWN", prices: false },
  budget: { tagline: `EVERY SKILL HAS A PRICE. YOU HAVE $${STEAL_BUDGET}.`, sub: "BUDGET · THE WEAKNESS WHEEL PAYS YOU BACK", prices: true },
  h2h: { tagline: "SAME WHEEL. ONE WINNER.", sub: "HEAD TO HEAD · LOSER TAKES THE ROAST", prices: false },
};

/** Mode hero OGs for /, /daily, /play, /budget, /h2h. */
export function OgHero({ variant = "default" }: { variant?: HeroVariant }) {
  const copy = HERO_COPY[variant] ?? HERO_COPY.default;
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background: INK,
        padding: 26,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `8px solid ${GOLD}`,
          borderRadius: 26,
          background: PANEL,
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <CourtArc width={1120} height={550} />
        <span style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 1, color: PAPER, position: "relative" }}>
          <span style={{ color: GOLD }}>99</span>OVR
        </span>
        <span
          style={{
            fontFamily: "Anton",
            fontSize: 42,
            color: PAPER,
            letterSpacing: 4,
            position: "relative",
          }}
        >
          {copy.tagline}
        </span>
        {copy.prices ? (
          <div style={{ display: "flex", gap: 12, marginTop: 18, position: "relative" }}>
            {([1, 2, 3, 4, 5] as const).map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 72,
                  height: 46,
                  borderRadius: 8,
                  background: TIER_HEX[tierForPrice(p)],
                  color: INK,
                  fontFamily: "Anton",
                  fontSize: 26,
                }}
              >
                ${p}
              </div>
            ))}
          </div>
        ) : null}
        <span
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 22,
            color: DIM,
            letterSpacing: 3,
            marginTop: 16,
            position: "relative",
          }}
        >
          {copy.sub}
        </span>
      </div>
    </div>
  );
}

/** 1200×630 for /h2h/[code] — the challenge card: CAN YOU BEAT N OVR? */
export function OgH2H({ result }: { result: StealResult }) {
  const tier = tierFor(result.derived.ovr);
  const hex = TIER_HEX[tier];
  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: INK, padding: 26, fontFamily: "Inter" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `8px solid ${hex}`,
          borderRadius: 26,
          background: PANEL,
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <CourtArc width={1120} height={550} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <span style={{ fontFamily: "Anton", fontSize: 34, color: PAPER, letterSpacing: 1 }}>
            <span style={{ color: GOLD }}>99</span>OVR
          </span>
          <Chip text="HEAD TO HEAD" color={GOLD} border={GOLD} size={18} />
          {result.build.knowledge ? <Chip text="BALL KNOWLEDGE" color={GOLD} border={GOLD} size={18} /> : null}
        </div>
        <span
          style={{ fontFamily: "Anton", fontSize: 96, color: PAPER, letterSpacing: 3, position: "relative", marginTop: 8 }}
        >
          CAN YOU BEAT
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, position: "relative" }}>
          <span style={{ fontFamily: "Anton", fontSize: 210, color: hex, lineHeight: 0.9 }}>{result.derived.ovr}</span>
          <span style={{ fontFamily: "Anton", fontSize: 96, color: hex }}>OVR?</span>
        </div>
        <div style={{ display: "flex", marginTop: 18, position: "relative" }}>
          <GradeRow result={result} scale={1.15} />
        </div>
        <span
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 22,
            color: DIM,
            letterSpacing: 3,
            marginTop: 14,
            position: "relative",
          }}
        >
          IDENTICAL SPINS · IDENTICAL ROSTERS · NO EXCUSES · 99OVR.APP
        </span>
      </div>
    </div>
  );
}
