"use client";

import { useEffect } from "react";
import { AD_SLOTS, ADS_ENABLED, ADSENSE_CLIENT, type AdSlotId } from "@/config/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Fixed-height ad container — the height is reserved whether or not ads are
 * enabled, so layout never shifts. `refreshKey` remounts the unit on re-sims.
 */
export function AdSlot({ id, refreshKey = 0 }: { id: AdSlotId; refreshKey?: number | string }) {
  const slot = AD_SLOTS[id];

  useEffect(() => {
    if (!ADS_ENABLED) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not loaded — the reserved box just stays empty
    }
  }, [refreshKey]);

  return (
    <div
      style={{ height: slot.height }}
      className="my-6 w-full overflow-hidden rounded-md border border-dashed border-line/70"
      aria-hidden
    >
      {ADS_ENABLED && ADSENSE_CLIENT ? (
        <ins
          key={`${id}-${refreshKey}`}
          className="adsbygoogle block"
          style={{ display: "block", width: "100%", height: slot.height }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot.adUnit}
          data-ad-format="auto"
          data-full-width-responsive="false"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-dim">
          <span className="rounded-sm border border-line px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em]">
            AD
          </span>
          <span className="text-[11px]">keeps 99OVR free</span>
        </div>
      )}
    </div>
  );
}
