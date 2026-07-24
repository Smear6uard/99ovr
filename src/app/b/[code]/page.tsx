import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeBuild } from "@/lib/encode";
import { simulate } from "@/lib/sim";
import { GauntletLog } from "@/components/GauntletLog";
import { ResultCard } from "@/components/ResultCard";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const build = decodeBuild(code);
  const result = build ? simulate(build) : null;
  if (!result) return { title: "Build not found" };
  const { derived, archetype, fellAt } = result;
  const outcome =
    fellAt === null
      ? "cleared the whole gauntlet"
      : `lost to the Round ${fellAt} boss (${result.gauntlet[fellAt - 1].shortName})`;
  const position = result.build.position && result.build.position !== "ALL" ? ` ${result.build.position}` : "";
  const title = `${derived.ovr} OVR${position} ${archetype.name}`;
  const description = `This $${derived.spend} build ${outcome}. Think you can beat it with the same shop?`;
  const og = `/api/og?b=${encodeURIComponent(code)}`;
  return {
    title,
    description,
    alternates: { canonical: `/b/${code}` },
    openGraph: {
      title: `${title} — 99OVR`,
      description,
      images: [og],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — 99OVR`,
      description,
      images: [og],
    },
  };
}

export default async function BuildPage({ params }: Props) {
  const { code } = await params;
  const build = decodeBuild(code);
  const result = build ? simulate(build) : null;
  if (!build || !result) notFound();

  return (
    <div className="pt-1">
      <ResultCard
        result={result}
        modeChip={build.mode === "daily" ? `DAILY #${build.daily}` : "SHARED BUILD"}
      />

      <Link
        href={`/play?vs=${code}`}
        className="mt-4 block w-full rounded-lg bg-gold py-4 text-center font-display text-2xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
      >
        Beat this build
      </Link>
      <p className="mt-1.5 text-center text-[11px] text-dim">
        Same packs. Same position. Your $20 plus flaw refund.
      </p>

      <GauntletLog result={result} />

      <Link
        href="/play"
        className="mt-6 block w-full rounded-lg border border-line py-3 text-center font-display text-lg uppercase tracking-wide text-paper transition-colors hover:border-gold hover:text-gold"
      >
        Build from scratch
      </Link>
    </div>
  );
}
