import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeAny } from "@/lib/encode";
import { simulate } from "@/lib/sim";
import { simulateSteals } from "@/lib/steal";
import { GauntletLog } from "@/components/GauntletLog";
import { ResultCard } from "@/components/ResultCard";
import { StealCard } from "@/components/StealCard";

type Props = { params: Promise<{ code: string }> };

/** Resolves a code to whichever game produced it. */
function load(code: string) {
  const decoded = decodeAny(code);
  if (!decoded) return null;
  if (decoded.kind === "steal") {
    const result = simulateSteals(decoded.build);
    return result ? ({ kind: "steal", result } as const) : null;
  }
  const result = simulate(decoded.build);
  return result ? ({ kind: "budget", result } as const) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const loaded = load(code);
  if (!loaded) return { title: "Build not found" };

  const { result } = loaded;
  const { derived, archetype, fellAt } = result;
  const outcome =
    fellAt === null
      ? "cleared the whole gauntlet"
      : `lost to the Round ${fellAt} boss (${result.gauntlet[fellAt - 1].shortName})`;

  const title =
    loaded.kind === "steal"
      ? `${derived.ovr} OVR ${archetype.name}`
      : `${derived.ovr} OVR ${archetype.name} (Budget Ball)`;
  const description =
    loaded.kind === "steal"
      ? `Six steals, six eras — ${loaded.result.steals.map((s) => s.grade).join(" ")}. This build ${outcome}. Same wheel. Beat it.`
      : `This $${loaded.result.derived.spend} build ${outcome}. Think you can beat it with the same shop?`;
  const og = `/api/og?b=${encodeURIComponent(code)}`;

  return {
    title,
    description,
    alternates: { canonical: `/b/${code}` },
    openGraph: { title: `${title} — 99OVR`, description, images: [og], type: "website" },
    twitter: { card: "summary_large_image", title: `${title} — 99OVR`, description, images: [og] },
  };
}

export default async function BuildPage({ params }: Props) {
  const { code } = await params;
  const loaded = load(code);
  if (!loaded) notFound();

  const steal = loaded.kind === "steal";
  const target = steal ? `/play?vs=${code}` : `/budget?vs=${code}`;

  return (
    <div className="pt-1">
      {steal ? (
        <StealCard
          result={loaded.result}
          modeChip={loaded.result.build.mode === "daily" ? `DAILY #${loaded.result.build.daily}` : "SHARED RUN"}
        />
      ) : (
        <ResultCard result={loaded.result} modeChip="BUDGET BALL" />
      )}

      <Link
        href={target}
        className="mt-4 block w-full rounded-lg bg-gold py-4 text-center font-display text-2xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
      >
        Beat this build
      </Link>
      <p className="mt-1.5 text-center text-[11px] text-dim">
        {steal
          ? "Same wheel. Same six landings. Your flaw, your reads."
          : "Same packs. Same prices. The original $20 challenge."}
      </p>

      <GauntletLog result={loaded.result} />

      <Link
        href={steal ? "/play" : "/budget"}
        className="mt-6 block w-full rounded-lg border border-line py-3 text-center font-display text-lg uppercase tracking-wide text-paper transition-colors hover:border-gold hover:text-gold"
      >
        {steal ? "Start your own run" : "Build from scratch"}
      </Link>
    </div>
  );
}
