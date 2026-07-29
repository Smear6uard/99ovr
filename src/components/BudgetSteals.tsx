"use client";

import { useState } from "react";
import { STEAL_BUDGET } from "@/lib/steal";
import { SetupSheet, type StealSettings } from "@/components/SetupSheet";
import { StealFlow } from "@/components/StealFlow";

/**
 * Budget: the same spin-steal loop with a $15 wallet, prices on every roster,
 * and the weakness wheel breaking the run after three steals.
 */
export function BudgetSteals() {
  const [settings, setSettings] = useState<StealSettings | null>(null);

  if (!settings) {
    return (
      <SetupSheet
        modeName="Budget"
        modeBlurb={`Same six spins — but every skill has a price and you have $${STEAL_BUDGET}. Halfway through, the weakness wheel pays you to take a flaw.`}
        onStart={setSettings}
      />
    );
  }

  return (
    <StealFlow
      key={`budget:${settings.target}:${settings.knowledge ? "bk" : "n"}`}
      mode="budget"
      knowledge={settings.knowledge}
      target={settings.target}
    />
  );
}
