"use client";

import { SITE_URL } from "@/config/site";
import { GAUNTLET } from "@/data/gauntlet";
import type { SimResult } from "@/lib/types";

export function buildUrl(code: string): string {
  return `${SITE_URL}/b/${code}`;
}

/** Sandbox/share text block — same bones as the daily block, plus the duel link. */
export function resultText(result: SimResult, code: string): string {
  const { fellAt, derived, archetype } = result;
  const squares =
    fellAt === null
      ? "🟩".repeat(10)
      : "🟩".repeat(fellAt - 1) + "🟥" + "⬛".repeat(10 - fellAt);
  const ladderLine =
    fellAt === null
      ? "🪜 Cleared all 10 rungs"
      : `🪜 Fell at Rung ${fellAt} (${GAUNTLET[fellAt - 1].shortName})`;
  return [
    `99OVR — ${derived.ovr} OVR · ${archetype.name}`,
    ladderLine,
    squares,
    `Beat my build → ${buildUrl(code)}`,
  ].join("\n");
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

export async function nativeShare(result: SimResult, code: string): Promise<boolean> {
  try {
    await navigator.share({
      title: `${result.derived.ovr} OVR · ${result.archetype.name} — 99OVR`,
      text: resultText(result, code),
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
