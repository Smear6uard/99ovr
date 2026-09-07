/**
 * Publisher integration for substantive landing/guide pages only.
 * Gameplay has no manual ad placements. Dashboard Auto Ads exclusions and
 * regional consent configuration still need to be managed in AdSense.
 */
export const ADS_ENABLED = true;

/** e.g. "ca-pub-1234567890123456" */
export const ADSENSE_CLIENT = "ca-pub-9476228948751191";

/** e.g. "G-XXXXXXXXXX" — rendered in layout when set. */
export const GA4_ID = "";

/** "Keep the servers alive" link target; footer hides it when empty. */
export const DONATE_URL = "";

export type AdSlotId = "result-primary" | "shop-footer" | "gauntlet-log";

export const AD_SLOTS: Record<AdSlotId, { adUnit: string; height: number }> = {
  "result-primary": { adUnit: "", height: 280 },
  "shop-footer": { adUnit: "", height: 250 },
  "gauntlet-log": { adUnit: "", height: 250 },
};
