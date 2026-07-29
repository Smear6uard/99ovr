"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/hooks";
import { getBestBuild, type BestBuild } from "@/lib/storage";
import { TIER_HEX, tierFor } from "@/lib/tiers";
import { SetupSheet, type StealSettings } from "@/components/SetupSheet";
import { StealFlow } from "@/components/StealFlow";

/** Classic: the setup sheet, then the six-steal loop. No flaw anywhere in this mode. */
export function ClassicGame() {
  const mounted = useMounted();
  const [best, setBest] = useState<BestBuild | null>(null);
  const [settings, setSettings] = useState<StealSettings | null>(null);

  useEffect(() => {
    if (mounted) setBest(getBestBuild());
  }, [mounted]);

  if (!settings) {
    return (
      <div>
        {best ? (
          <p className="pt-1 text-center text-[11px] font-bold tracking-[0.16em] text-dim">
            YOUR BEST:{" "}
            <span style={{ color: TIER_HEX[tierFor(best.ovr)] }}>
              {best.ovr} OVR · {best.archetypeName.toUpperCase()}
            </span>
          </p>
        ) : null}
        <SetupSheet
          modeName="Classic"
          modeBlurb="Six spins, six real rosters, one skill from each. No prices, no flaw — just what you actually know."
          onStart={setSettings}
        />
      </div>
    );
  }

  return (
    <StealFlow
      key={`classic:${settings.target}:${settings.knowledge ? "bk" : "n"}`}
      mode="classic"
      knowledge={settings.knowledge}
      target={settings.target}
    />
  );
}
