import { Suspense } from "react";
import { SandboxGame } from "@/components/SandboxGame";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-[480px]" aria-hidden />}>
      <SandboxGame />
    </Suspense>
  );
}
