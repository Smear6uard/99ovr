import type { Metadata } from "next";
import { DailyShell } from "@/components/DailyShell";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description:
    "One wheel, one official run, everyone on Earth gets the same spins and rosters. Post your initials, keep the streak alive.",
  alternates: { canonical: "/daily" },
  openGraph: { images: ["/api/og?v=daily"] },
  twitter: { card: "summary_large_image", images: ["/api/og?v=daily"] },
};

export default function DailyPage() {
  return <DailyShell />;
}
