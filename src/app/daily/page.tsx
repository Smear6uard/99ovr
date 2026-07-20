import type { Metadata } from "next";
import { DailyShell } from "@/components/DailyShell";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description:
    "One shop, one official run, everyone on Earth gets the same draw. Keep the streak alive.",
  alternates: { canonical: "/daily" },
};

export default function DailyPage() {
  return <DailyShell />;
}
