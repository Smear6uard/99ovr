import type { Flaw } from "@/lib/types";

/** Human-readable mechanics line shown on flaw cards — transparency fuels strategy debates. */
export function flawHint(flaw: Flaw): string {
  const e = flaw.effect;
  switch (e.kind) {
    case "lateRung":
      return `−${e.amount} from Round ${e.fromRung} on`;
    case "noShow":
      return `${Math.round(e.chance * 100)}% per round: −${e.amount}`;
    case "slowStart":
      return `−${e.amount} on Rounds ${e.rungs.join(" & ")}`;
    case "injury":
      return `${Math.round(e.chancePerRung * 100)}% per round: run ends`;
    case "vsQuick":
      return `−${e.amount} vs quick bosses`;
    case "vsCrafty":
      return `−${e.amount} vs crafty bosses`;
    case "flat":
      return `−${e.amount} every round`;
    case "cardio":
      return `growing penalty from Round ${e.fromRung}`;
    case "whistle":
      return `${Math.round(e.chance * 100)}% per round: −${e.amount}`;
    case "heroBall":
      return `+${e.earlyBonus} early · −${e.latePenalty} from Round ${e.lateRungs}`;
  }
}
