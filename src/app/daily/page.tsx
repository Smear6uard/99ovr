import { ModeGuide } from "@/components/ModeGuide";
import type { Metadata } from "next";
import { DailyShell } from "@/components/DailyShell";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description:
    "One wheel, one official run, everyone on Earth gets the same spins and rosters. Post your initials, keep the streak alive.",
  alternates: { canonical: "/daily" },
  openGraph: {
    title: "Daily Challenge · 99OVR",
    description:
      "One shared UTC challenge, six steals and an optional daily leaderboard.",
    url: "/daily",
    images: ["/api/og?v=daily"],
  },
  twitter: {
    title: "Daily Challenge · 99OVR",
    description: "Six steals. One build. Ten bosses.",
    card: "summary_large_image",
    images: ["/api/og?v=daily"],
  },
};

export default function DailyPage() {
  return (
    <>
      <noscript>
        <p className="mb-4 text-sm text-paper">
          Enable JavaScript to play the interactive game. The guide below is
          available without it.
        </p>
      </noscript>
      <h1 className="mode-heading">Daily Challenge</h1>
      <DailyShell />
      <ModeGuide mode="daily" />
    </>
  );
}
