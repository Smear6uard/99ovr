"use client";

import { useState } from "react";
import { buildUrl, canNativeShare, copyText, downloadCard, nativeShare } from "@/lib/share";

type Feedback = Record<string, string>;

/**
 * Share sheet: native share, link, emoji block, and the 1080×1350 card.
 * Game-agnostic — Six Steals and Budget Ball pass their own text.
 */
export function ShareRow({
  summary,
  text,
  code,
  dailyBlock,
}: {
  summary: { ovr: number; archetypeName: string };
  /** the full share block for this game */
  text: string;
  code: string;
  /** official daily runs pass the exact emoji block to copy */
  dailyBlock?: string;
}) {
  const [fb, setFb] = useState<Feedback>({});

  const flash = (key: string, msg: string) => {
    setFb((f) => ({ ...f, [key]: msg }));
    setTimeout(() => setFb((f) => ({ ...f, [key]: "" })), 1400);
  };

  const actions: Array<{ key: string; label: string; run: () => Promise<void> }> = [
    {
      key: "share",
      label: "Share",
      run: async () => {
        if (canNativeShare()) {
          const ok = await nativeShare(summary, text, code);
          if (!ok) flash("share", "Canceled");
        } else {
          (await copyText(text)) ? flash("share", "Copied") : flash("share", "Blocked");
        }
      },
    },
    {
      key: "link",
      label: "Copy link",
      run: async () => {
        (await copyText(buildUrl(code))) ? flash("link", "Copied") : flash("link", "Blocked");
      },
    },
    {
      key: "result",
      label: dailyBlock ? "Copy daily result" : "Copy result",
      run: async () => {
        (await copyText(dailyBlock ?? text)) ? flash("result", "Copied") : flash("result", "Blocked");
      },
    },
    {
      key: "card",
      label: "Save card",
      run: async () => {
        flash("card", "Rendering…");
        const ok = await downloadCard(code, summary.ovr);
        flash("card", ok ? "Saved" : "Failed");
      },
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {actions.map((a) => (
        <button
          key={a.key}
          type="button"
          onClick={() => void a.run()}
          className="rounded-md border border-line py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-paper transition-colors hover:border-gold hover:text-gold"
        >
          {fb[a.key] || a.label}
        </button>
      ))}
    </div>
  );
}
