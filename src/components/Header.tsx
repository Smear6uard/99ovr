import Link from "@/components/SiteLink";
import { Wordmark } from "@/components/Wordmark";

const pill =
  "rounded-full border border-line px-2.5 py-2 transition-colors hover:border-gold hover:text-gold";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-2 py-4">
      <Link href="/" aria-label="99OVR home" className="inline-flex">
        <Wordmark />
      </Link>
      <nav aria-label="Main navigation" className="flex flex-wrap justify-end gap-1 text-[12px] font-semibold">
        <Link href="/daily" className={`${pill} text-paper`}>
          Daily
        </Link>
        <Link href="/play" className={`${pill} text-paper`}>
          Classic
        </Link>
        <Link href="/how-to-play" className={`${pill} hidden text-dim sm:inline-block`}>
          How to play
        </Link>
        <Link href="/guides" className={`${pill} text-gold`}>
          Guides
        </Link>
      </nav>
    </header>
  );
}
