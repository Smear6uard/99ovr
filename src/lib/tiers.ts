import type { Price } from "@/lib/types";
import { RATING_TIERS } from "@/config/ratingTiers";

export { RATING_TIERS } from "@/config/ratingTiers";

export type TierId = (typeof RATING_TIERS)[number]["id"];

export const TIER_HEX = Object.fromEntries(RATING_TIERS.map((tier) => [tier.id, tier.color])) as Record<TierId, string>;
export const TIER_NAMES = Object.fromEntries(RATING_TIERS.map((tier) => [tier.id, tier.name])) as Record<TierId, string>;

export function tierFor(ovr: number): TierId {
  return (RATING_TIERS.find((tier) => ovr >= tier.min && ovr <= tier.max) ?? RATING_TIERS[0]).id;
}

export function tierForPrice(price: Price): TierId {
  if (price === 5) return "hof";
  if (price === 4) return "superstar";
  if (price === 3) return "starter";
  if (price === 2) return "role";
  return "bench";
}
