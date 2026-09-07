import { ModeGuide } from "@/components/ModeGuide";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ClassicGame } from "@/components/ClassicGame";

export const metadata: Metadata = {
  title: "Classic",
  description:
    "Spin for a real franchise-decade, read the all-decade roster, and steal one player's skill. Six rounds, no prices, ten bosses.",
  alternates: { canonical: "/play" },
  openGraph: {
    title: "Classic · 99OVR",
    description: "Build from six skills and learn from the ten-boss verdict.",
    url: "/play",
    images: ["/api/og?v=classic"],
  },
  twitter: {
    title: "Classic · 99OVR",
    description: "Six steals. One build. Ten bosses.",
    card: "summary_large_image",
    images: ["/api/og?v=classic"],
  },
};

export default function PlayPage() {
  return (
    <>
      <noscript>
        <p className="mb-4 text-sm text-paper">
          Enable JavaScript to play the interactive game. The guide below is
          available without it.
        </p>
      </noscript>
      <h1 className="mode-heading">Classic</h1>
      <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
        <ClassicGame />
      </Suspense>
      <ModeGuide mode="classic" />
    </>
  );
}
