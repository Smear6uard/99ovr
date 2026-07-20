import Link from "next/link";

export default function Home() {
  return (
    <div className="py-8">
      <h1 className="font-display text-5xl uppercase">
        <span className="text-gold">99</span>OVR
      </h1>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/play" className="rounded-lg border border-line p-4">PLAY</Link>
        <Link href="/daily" className="rounded-lg border border-line p-4">DAILY</Link>
        <Link href="/play?mode=knowledge" className="rounded-lg border border-line p-4">BALL KNOWLEDGE</Link>
      </div>
    </div>
  );
}
