/**
 * Monetization config. Flip ADS_ENABLED and paste your AdSense client ID
 * to go live — slot heights are reserved either way, so CLS stays 0.
 */
export const ADS_ENABLED = false;

/** e.g. "ca-pub-1234567890123456" */
export const ADSENSE_CLIENT = "";

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
