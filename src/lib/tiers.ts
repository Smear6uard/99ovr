import type { Price } from "@/lib/types";

export type TierId = "bronze" | "silver" | "gold" | "violet";

export const TIER_HEX: Record<TierId, string> = {
  bronze: "#B0793F",
  silver: "#C7CDD6",
  gold: "#F2B94B",
  violet: "#8B5CF6",
};

export const TIER_NAMES: Record<TierId, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  violet: "Dark Matter",
};

/** The UI's accent logic: the rating on screen decides the accent color. */
export function tierFor(ovr: number): TierId {
  if (ovr >= 90) return "violet";
  if (ovr >= 80) return "gold";
  if (ovr >= 70) return "silver";
  return "bronze";
}

/** Price patches use the same metal language. Violet stays earned-only. */
export function tierForPrice(price: Price): TierId {
  if (price >= 4) return "gold";
  if (price === 3) return "silver";
  return "bronze";
}
