import { validateBuild } from "@/lib/sim";
import type { BuildCode, GameMode } from "@/lib/types";

/**
 * Build ⇄ compact base64url code for /b/[code] and OG images.
 * Layout (18 bytes): v(1) mode(1) seed(4BE) picks(6) flaw(1) attempt(2BE) daily(2BE) xor(1)
 */
const VERSION = 1;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): Uint8Array | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const bin = atob(b64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export function encodeBuild(build: BuildCode): string {
  const bytes = new Uint8Array(18);
  bytes[0] = VERSION;
  bytes[1] = build.mode === "daily" ? 1 : 0;
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
  let x = 0;
  for (let i = 0; i < 17; i++) x ^= bytes[i];
  bytes[17] = x;
  return toBase64Url(bytes);
}

export function decodeBuild(code: string): BuildCode | null {
  const bytes = fromBase64Url(code);
  if (!bytes || bytes.length !== 18) return null;
  let x = 0;
  for (let i = 0; i < 17; i++) x ^= bytes[i];
  if (x !== bytes[17]) return null;
  if (bytes[0] !== VERSION) return null;
  if (bytes[1] > 1) return null;
  const mode: GameMode = bytes[1] === 1 ? "daily" : "sandbox";
  const seed = ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0;
  const picks = Array.from(bytes.slice(6, 12));
  const flaw = bytes[12];
  const attempt = (bytes[13] << 8) | bytes[14];
  const daily = (bytes[15] << 8) | bytes[16];
  const build: BuildCode = { v: VERSION, mode, seed, picks, flaw, attempt, daily };
  if (!validateBuild(build)) return null;
  return build;
}
