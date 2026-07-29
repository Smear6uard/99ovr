import { Suspense } from "react";
import type { Metadata } from "next";
import { BudgetSteals } from "@/components/BudgetSteals";

export const metadata: Metadata = {
  title: "Budget — the $20 run",
  description:
    "The same six steals with a $20 wallet: every skill has a price, and the mid-run weakness wheel pays you to take a flaw.",
  alternates: { canonical: "/budget" },
  openGraph: { images: ["/api/og?v=budget"] },
  twitter: { card: "summary_large_image", images: ["/api/og?v=budget"] },
};

export default function BudgetPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <BudgetSteals />
    </Suspense>
  );
}
