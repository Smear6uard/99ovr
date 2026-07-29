import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSteal } from "@/lib/encode";
import { simulateSteals } from "@/lib/steal";
import { H2HGame } from "@/components/H2HGame";

type Props = { params: Promise<{ code: string }> };

function load(code: string) {
  const build = decodeSteal(code);
  return build ? simulateSteals(build) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const result = load(code);
  if (!result) return { title: "Challenge not found" };
  const og = `/api/og?b=${encodeURIComponent(code)}&v=h2h`;
  const title = `CAN YOU BEAT ${result.derived.ovr} OVR?`;
  const description = `A friend put up ${result.derived.ovr} OVR on this wheel and thinks you can't. Same spins, same rosters, one winner.`;
  return {
    title,
    description,
    alternates: { canonical: `/h2h/${code}` },
    openGraph: { title: `${title} — 99OVR`, description, images: [og], type: "website" },
    twitter: { card: "summary_large_image", title: `${title} — 99OVR`, description, images: [og] },
  };
}

export default async function H2HChallengePage({ params }: Props) {
  const { code } = await params;
  if (!load(code)) notFound();
  return <H2HGame code={code} />;
}
