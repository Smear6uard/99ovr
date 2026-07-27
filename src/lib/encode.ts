import { validateBuild } from "@/lib/sim";
import { validateSteals } from "@/lib/steal";
import { ROUNDS } from "@/lib/wheel";
import type { BuildCode, GameMode, PositionMode, StealBuild } from "@/lib/types";

const CURRENT_VERSION = 2;
const V1_BYTES = 18;
const V2_BYTES = 21;
const V3_BYTES = 24;
const POSITION_BYTES: PositionMode[] = ["ALL", "PG", "SG", "SF", "PF", "C"];

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): Uint8Array | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + (b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : ""));
    return Uint8Array.from(bin, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function checksum(bytes: Uint8Array, end: number): number {
  let value = 0;
  for (let i = 0; i < end; i++) value ^= bytes[i];
  return value;
}

/** v1 stays byte-for-byte compatible; all newly created builds use v2. */
export function encodeBuild(build: BuildCode): string {
  if (build.v === 1) {
    const bytes = new Uint8Array(V1_BYTES);
    bytes[0] = 1;
    bytes[1] = (build.mode === "daily" ? 1 : 0) | (build.knowledge ? 0x80 : 0);
    bytes[2] = (build.seed >>> 24) & 0xff;
    bytes[3] = (build.seed >>> 16) & 0xff;
    bytes[4] = (build.seed >>> 8) & 0xff;
    bytes[5] = build.seed & 0xff;
    for (let i = 0; i < 6; i++) bytes[6 + i] = build.picks[i] & 0xff;
    bytes[12] = build.flaw & 0xff;
    bytes[13] = (build.attempt >>> 8) & 0xff;
    bytes[14] = build.attempt & 0xff;
    bytes[15] = (build.daily >>> 8) & 0xff;
    bytes[16] = build.daily & 0xff;
    bytes[17] = checksum(bytes, 17);
    return toBase64Url(bytes);
  }

  const bytes = new Uint8Array(V2_BYTES);
  bytes[0] = CURRENT_VERSION;
  bytes[1] = (build.mode === "daily" ? 1 : 0) | (build.knowledge ? 0x80 : 0);
  bytes[2] = POSITION_BYTES.indexOf(build.position ?? "ALL");
  bytes[3] = (build.seed >>> 24) & 0xff;
  bytes[4] = (build.seed >>> 16) & 0xff;
  bytes[5] = (build.seed >>> 8) & 0xff;
  bytes[6] = build.seed & 0xff;
  for (let i = 0; i < 8; i++) bytes[7 + i] = build.picks[i] & 0xff;
  bytes[15] = build.flaw & 0xff;
  bytes[16] = (build.attempt >>> 8) & 0xff;
  bytes[17] = build.attempt & 0xff;
  bytes[18] = (build.daily >>> 8) & 0xff;
  bytes[19] = build.daily & 0xff;
  bytes[20] = checksum(bytes, 20);
  return toBase64Url(bytes);
}

export function decodeBuild(code: string): BuildCode | null {
  const bytes = fromBase64Url(code);
  if (!bytes) return null;
  const version = bytes[0];
  if (version === 1 && bytes.length === V1_BYTES) return decodeV1(bytes);
  if (version === CURRENT_VERSION && bytes.length === V2_BYTES) return decodeV2(bytes);
  return null;
}

function modeFrom(byte: number): { mode: GameMode; knowledge: boolean } | null {
  const modeBit = byte & 0x7f;
  if (modeBit > 1) return null;
  return { mode: modeBit === 1 ? "daily" : "sandbox", knowledge: (byte & 0x80) !== 0 };
}

function decodeV1(bytes: Uint8Array): BuildCode | null {
  if (checksum(bytes, 17) !== bytes[17]) return null;
  const flags = modeFrom(bytes[1]);
  if (!flags) return null;
  const build: BuildCode = {
    v: 1, ...flags,
    seed: ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0,
    picks: Array.from(bytes.slice(6, 12)), flaw: bytes[12],
    attempt: (bytes[13] << 8) | bytes[14], daily: (bytes[15] << 8) | bytes[16],
  };
  return validateBuild(build) ? build : null;
}

function decodeV2(bytes: Uint8Array): BuildCode | null {
  if (checksum(bytes, 20) !== bytes[20]) return null;
  const flags = modeFrom(bytes[1]);
  const position = POSITION_BYTES[bytes[2]];
  if (!flags || !position) return null;
  const build: BuildCode = {
    v: 2, ...flags, position,
    seed: ((bytes[3] << 24) | (bytes[4] << 16) | (bytes[5] << 8) | bytes[6]) >>> 0,
    picks: Array.from(bytes.slice(7, 15)), flaw: bytes[15],
    attempt: (bytes[16] << 8) | bytes[17], daily: (bytes[18] << 8) | bytes[19],
  };
  return validateBuild(build) ? build : null;
}

/* ------------------------------------------------------------------ */
/* v3 — Six Steals                                                     */
/* ------------------------------------------------------------------ */

/**
 * 24 bytes → 32 base64url chars.
 *   0      version = 3
 *   1      mode | knowledge << 7
 *   2–5    seed (u32)
 *   6      flaw index
 *   7–18   six (bucketIdx, playerIdx) pairs, in ATTRS order
 *   19–20  attempt (u16)
 *   21–22  daily (u16)
 *   23     xor checksum
 */
export function encodeSteal(build: StealBuild): string {
  const bytes = new Uint8Array(V3_BYTES);
  bytes[0] = 3;
  bytes[1] = (build.mode === "daily" ? 1 : 0) | (build.knowledge ? 0x80 : 0);
  bytes[2] = (build.seed >>> 24) & 0xff;
  bytes[3] = (build.seed >>> 16) & 0xff;
  bytes[4] = (build.seed >>> 8) & 0xff;
  bytes[5] = build.seed & 0xff;
  bytes[6] = build.flaw & 0xff;
  for (let i = 0; i < ROUNDS; i++) {
    bytes[7 + i * 2] = build.steals[i][0] & 0xff;
    bytes[8 + i * 2] = build.steals[i][1] & 0xff;
  }
  bytes[19] = (build.attempt >>> 8) & 0xff;
  bytes[20] = build.attempt & 0xff;
  bytes[21] = (build.daily >>> 8) & 0xff;
  bytes[22] = build.daily & 0xff;
  bytes[23] = checksum(bytes, 23);
  return toBase64Url(bytes);
}

export function decodeSteal(code: string): StealBuild | null {
  const bytes = fromBase64Url(code);
  if (!bytes || bytes.length !== V3_BYTES || bytes[0] !== 3) return null;
  if (checksum(bytes, 23) !== bytes[23]) return null;
  const flags = modeFrom(bytes[1]);
  if (!flags) return null;
  const steals: Array<[number, number]> = [];
  for (let i = 0; i < ROUNDS; i++) steals.push([bytes[7 + i * 2], bytes[8 + i * 2]]);
  const build: StealBuild = {
    v: 3, ...flags,
    seed: ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0,
    flaw: bytes[6],
    steals,
    attempt: (bytes[19] << 8) | bytes[20],
    daily: (bytes[21] << 8) | bytes[22],
  };
  return validateSteals(build) ? build : null;
}

export type AnyBuild =
  | { kind: "steal"; build: StealBuild }
  | { kind: "budget"; build: BuildCode };

/** One entry point for /b/[code] and the OG routes, which serve both games. */
export function decodeAny(code: string): AnyBuild | null {
  const steal = decodeSteal(code);
  if (steal) return { kind: "steal", build: steal };
  const budget = decodeBuild(code);
  if (budget) return { kind: "budget", build: budget };
  return null;
}
