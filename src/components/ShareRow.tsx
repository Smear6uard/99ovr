"use client";

import { useState } from "react";
import { buildUrl, canNativeShare, copyText, downloadCard, nativeShare, resultText } from "@/lib/share";
import type { SimResult } from "@/lib/types";

type Feedback = Record<string, string>;

/** Share sheet: native share, link, emoji block, and the 1080×1350 card. */
export function ShareRow({
  result,
  code,
  dailyBlock,
}: {
  result: SimResult;
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
          const ok = await nativeShare(result, code);
          if (!ok) flash("share", "Canceled");
        } else {
          (await copyText(`${resultText(result, code)}`)) ? flash("share", "Copied") : flash("share", "Blocked");
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
        const text = dailyBlock ?? resultText(result, code);
        (await copyText(text)) ? flash("result", "Copied") : flash("result", "Blocked");
      },
    },
    {
      key: "card",
      label: "Save card",
      run: async () => {
        flash("card", "Rendering…");
        const ok = await downloadCard(code, result.derived.ovr);
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
          className="rounded-md border border-line py-2.5 text-[12px] font-bold tracking-[0.12em] text-paper uppercase transition-colors hover:border-gold hover:text-gold"
        >
          {fb[a.key] || a.label}
        </button>
      ))}
    </div>
  );
}
