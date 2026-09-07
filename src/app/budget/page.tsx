import { ModeGuide } from "@/components/ModeGuide";
import { Suspense } from "react";
import type { Metadata } from "next";
import { BudgetSteals } from "@/components/BudgetSteals";

export const metadata: Metadata = {
  title: "Budget — the $15 run",
  description:
    "The same six steals with a $15 wallet: every skill has a price, and the mid-run weakness wheel pays you to take a flaw.",
  alternates: { canonical: "/budget" },
  openGraph: {
    title: "Budget · 99OVR",
    description: "Build from six skills and learn from the ten-boss verdict.",
    url: "/budget",
    images: ["/api/og?v=budget"],
  },
  twitter: {
    title: "Budget · 99OVR",
    description: "Six steals. One build. Ten bosses.",
    card: "summary_large_image",
    images: ["/api/og?v=budget"],
  },
};

export default function BudgetPage() {
  return (
    <>
      <noscript>
        <p className="mb-4 text-sm text-paper">
          Enable JavaScript to play the interactive game. The guide below is
          available without it.
        </p>
      </noscript>
      <h1 className="mode-heading">Budget</h1>
      <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
        <BudgetSteals />
      </Suspense>
      <ModeGuide mode="budget" />
    </>
  );
}
