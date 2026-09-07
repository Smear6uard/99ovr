import Link from "@/components/SiteLink";
import { Wordmark } from "@/components/Wordmark";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-2 py-4">
      <Link href="/" aria-label="99OVR home" className="inline-flex">
        <Wordmark />
      </Link>
      <nav aria-label="Main navigation" className="flex flex-wrap justify-end gap-1 text-[12px] font-semibold">
        <Link
          href="/daily"
          className="rounded-full border border-line px-2 py-2 text-paper transition-colors hover:border-gold hover:text-gold"
        >
          Daily
        </Link>
        <Link
          href="/play"
          className="rounded-full border border-line px-2 py-2 text-paper transition-colors hover:border-gold hover:text-gold"
        >
          Classic
        </Link>
        <Link
          href="/how-to-play"
          className="rounded-full border border-line px-2 py-2 text-dim transition-colors hover:border-gold hover:text-gold"
        >
          How to play
        </Link>
      </nav>
    </header>
  );
}
