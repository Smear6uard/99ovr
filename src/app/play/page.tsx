import { Suspense } from "react";
import type { Metadata } from "next";
import { SandboxGame } from "@/components/SandboxGame";

export const metadata: Metadata = {
  title: "Play",
  description: "Pick a flaw, rip eight packs, and build the perfect NBA player for a $20+ budget.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <SandboxGame />
    </Suspense>
  );
}
