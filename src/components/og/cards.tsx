/**
 * JSX for the edge-rendered share images (satori). Inline styles only,
 * explicit display:flex on every multi-child container — satori rules.
 */
import { GAUNTLET } from "@/data/gauntlet";
import { TIER_HEX, TIER_NAMES, tierFor, tierForPrice } from "@/lib/tiers";
import type { SimResult } from "@/lib/types";

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
};

/**
 * Satori's glyph fallback mangles diacritics (Anton's lowercase ć reads as Ć),
 * so the image surface uses the ASCII spellings NBA Twitter uses anyway.
 * The in-app card keeps the proper marks.
 */
function ogSafe(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function Squares({ result, size, gap = 6 }: { result: SimResult; size: number; gap?: number }) {
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
  const opp = GAUNTLET[result.fellAt - 1];
  return {
    text: `${result.injured ? "INJURED" : "FELL"} AT RUNG ${result.fellAt} · ${opp.title.toUpperCase()}`,
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
              {build.mode === "daily" ? `DAILY #${build.daily}` : "SANDBOX BUILD"}
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
              <span style={{ fontFamily: "Anton", fontSize: 32, color: hex, letterSpacing: 6 }}>OVR</span>
              <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 17, color: DIM, letterSpacing: 4 }}>
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
            {build.mode === "daily" ? `DAILY #${build.daily}` : `SIM #${build.attempt + 1}`}
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
        <div style={{ display: "flex", gap: 14, alignItems: "center", position: "relative", marginTop: 34 }}>
          <span style={{ fontFamily: "Anton", fontSize: 30, color: hex, letterSpacing: 8 }}>OVR</span>
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: DIM, letterSpacing: 5 }}>
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

/** Default OG for / and /daily — the pitch as a card. */
export function OgHero() {
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
          BUILD THE PERFECT NBA PLAYER WITH $15
        </span>
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
          SIX SKILLS · ONE FATAL FLAW · TEN LEGENDS
        </span>
      </div>
    </div>
  );
}
