import { Suspense } from "react";
import type { Metadata } from "next";
import { StealGame } from "@/components/StealGame";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Spin for a real team-era, read the roster, and steal one player's skill. Six rounds, no prices, ten bosses.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <StealGame />
    </Suspense>
  );
}
