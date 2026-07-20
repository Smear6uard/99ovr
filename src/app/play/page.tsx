import { Suspense } from "react";
import type { Metadata } from "next";
import { SandboxGame } from "@/components/SandboxGame";

export const metadata: Metadata = {
  title: "Play",
  description: "Build the perfect NBA player with $15. Spin, choose, survive the gauntlet.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <SandboxGame />
    </Suspense>
  );
}
