import { Suspense } from "react";
import type { Metadata } from "next";
import { ClassicGame } from "@/components/ClassicGame";

export const metadata: Metadata = {
  title: "Classic",
  description:
    "Spin for a real team-era, read the roster, and steal one player's skill. Six rounds, no prices, ten bosses.",
  alternates: { canonical: "/play" },
  openGraph: { images: ["/api/og?v=classic"] },
  twitter: { card: "summary_large_image", images: ["/api/og?v=classic"] },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <ClassicGame />
    </Suspense>
  );
}
