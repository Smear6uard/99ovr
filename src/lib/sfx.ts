"use client";

/**
 * Tiny arcade SFX synth — WebAudio oscillator blips, no assets. OFF by
 * default behind a toggle; purely cosmetic, so every call is fail-silent.
 */

const SFX_KEY = "99ovr:sfx:v1";

export function sfxEnabled(): boolean {
  try {
    return localStorage.getItem(SFX_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSfxEnabled(on: boolean): void {
  try {
    localStorage.setItem(SFX_KEY, on ? "1" : "0");
  } catch {
    // private mode — the toggle just won't stick
  }
}

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx = ctx ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, at: number, dur: number, type: OscillatorType = "square", gainPeak = 0.04) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + at);
  gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.02);
}

export type SfxName = "spin" | "tick" | "land" | "jackpot" | "womp" | "stamp" | "cash";

/** Fire-and-forget. Respects the toggle; silently no-ops everywhere else. */
export function playSfx(name: SfxName): void {
  if (!sfxEnabled()) return;
  switch (name) {
    case "spin":
      for (let i = 0; i < 8; i++) blip(220 + i * 40, i * 0.05, 0.05, "square", 0.02);
      break;
    case "tick":
      blip(880, 0, 0.03, "square", 0.015);
      break;
    case "land":
      blip(392, 0, 0.09);
      blip(523, 0.09, 0.12);
      break;
    case "jackpot":
      blip(523, 0, 0.09);
      blip(659, 0.09, 0.09);
      blip(784, 0.18, 0.09);
      blip(1047, 0.27, 0.22, "square", 0.05);
      break;
    case "womp":
      blip(196, 0, 0.16, "sawtooth", 0.035);
      blip(147, 0.16, 0.3, "sawtooth", 0.035);
      break;
    case "stamp":
      blip(131, 0, 0.08, "square", 0.05);
      break;
    case "cash":
      blip(988, 0, 0.06);
      blip(1319, 0.06, 0.1);
      break;
  }
}

/** Mobile spin buzz. Cosmetic; guarded everywhere. */
export function buzz(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // unsupported — fine
  }
}
