import type { Flaw } from "@/lib/types";

/** Human-readable mechanics line shown on flaw cards — transparency fuels strategy debates. */
export function flawHint(flaw: Flaw): string {
  const e = flaw.effect;
  switch (e.kind) {
    case "lateRung":
      return `−${e.amount} power from Rung ${e.fromRung} on`;
    case "noShow":
      return `${Math.round(e.chance * 100)}% per rung: −${e.amount} power`;
    case "slowStart":
      return `−${e.amount} power on Rungs ${e.rungs.join(" & ")}`;
    case "injury":
      return `${Math.round(e.chancePerRung * 100)}% per rung: run ends`;
    case "vsQuick":
      return `−${e.amount} power vs quick legends`;
    case "vsCrafty":
      return `−${e.amount} power vs crafty legends`;
    case "flat":
      return `−${e.amount} power on every rung`;
    case "cardio":
      return `growing penalty from Rung ${e.fromRung}`;
    case "whistle":
      return `${Math.round(e.chance * 100)}% per rung: −${e.amount} power`;
    case "heroBall":
      return `+${e.earlyBonus} early · −${e.latePenalty} from Rung ${e.lateRungs}`;
  }
}
