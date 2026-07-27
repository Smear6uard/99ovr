import { Suspense } from "react";
import type { Metadata } from "next";
import { BudgetGame } from "@/components/BudgetGame";

export const metadata: Metadata = {
  title: "Budget Ball — the $20 challenge",
  description:
    "The original 99OVR: pick a flaw for extra cash, draft eight priced skills on a $20 budget, and beat ten bosses.",
  alternates: { canonical: "/budget" },
};

export default function BudgetPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <BudgetGame />
    </Suspense>
  );
}
