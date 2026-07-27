"use client";

import { SITE_URL } from "@/config/site";
import { gradeStrip } from "@/lib/daily";
import { TIER_NAMES, tierFor } from "@/lib/tiers";
import type { SimResult, StealResult } from "@/lib/types";

export function buildUrl(code: string): string {
  return `${SITE_URL}/b/${code}`;
}

function squaresFor(fellAt: number | null): string {
  return fellAt === null ? "🟩".repeat(10) : "🟩".repeat(fellAt - 1) + "🟥" + "⬛".repeat(10 - fellAt);
}

/** Six Steals share text — same bones as the daily block, plus the duel link. */
export function resultText(result: StealResult, code: string): string {
  const { fellAt, derived, archetype } = result;
  const roundLine =
    fellAt === null ? "🏆 Beat all 10 bosses" : `🏀 Round ${fellAt} Boss: ${result.gauntlet[fellAt - 1].shortName}`;
  const lines = [
    `99OVR — ${derived.ovr} OVR · ${TIER_NAMES[tierFor(derived.ovr)]}`,
    gradeStrip(result),
    archetype.name,
  ];
  if (result.build.knowledge) lines.push("🧠 Ball Knowledge (names only)");
  lines.push(roundLine, squaresFor(fellAt), `Beat my build → ${buildUrl(code)}`);
  return lines.join("\n");
}

/** Budget Ball (the legacy $20 game) share text. */
export function budgetResultText(result: SimResult, code: string): string {
  const { fellAt, derived, archetype } = result;
  const roundLine =
    fellAt === null ? "🏆 Beat all 10 bosses" : `🏀 Round ${fellAt} Boss: ${result.gauntlet[fellAt - 1].shortName}`;
  const lines = [
    `99OVR Budget Ball — ${derived.ovr} OVR · ${TIER_NAMES[tierFor(derived.ovr)]}`,
    archetype.name,
  ];
  if (result.build.knowledge) lines.push("🧠 Ball Knowledge (names only)");
  lines.push(roundLine, squaresFor(fellAt), `Beat my $20 build → ${buildUrl(code)}`);
  return lines.join("\n");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(
  summary: { ovr: number; archetypeName: string },
  text: string,
  code: string
): Promise<boolean> {
  try {
    await navigator.share({
      title: `${summary.ovr} OVR · ${summary.archetypeName} — 99OVR`,
      text,
      url: buildUrl(code),
    });
    return true;
  } catch {
    return false;
  }
}

/** Fetches the 1080×1350 portrait card and triggers a download. */
export async function downloadCard(code: string, ovr: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/card?b=${encodeURIComponent(code)}`);
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `99ovr-${ovr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch {
    return false;
  }
}
