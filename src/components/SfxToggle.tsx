"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/hooks";
import { playSfx, setSfxEnabled, sfxEnabled } from "@/lib/sfx";

/** Arcade sounds are OFF by default; this is the only switch. */
export function SfxToggle() {
  const mounted = useMounted();
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (mounted) setOn(sfxEnabled());
  }, [mounted]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        const next = !on;
        setSfxEnabled(next);
        setOn(next);
        if (next) playSfx("cash");
      }}
      className="underline underline-offset-2 hover:text-paper"
    >
      sounds: {on ? "on 🔊" : "off 🔇"}
    </button>
  );
}
