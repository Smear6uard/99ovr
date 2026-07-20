import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" aria-label="99OVR home" className="inline-flex">
        <Wordmark />
      </Link>
      <nav className="flex items-center gap-2 text-[13px] font-semibold">
        <Link
          href="/play"
          className="rounded-full border border-line px-3 py-1.5 text-paper transition-colors hover:border-gold hover:text-gold"
        >
          Play
        </Link>
        <Link
          href="/daily"
          className="rounded-full border border-line px-3 py-1.5 text-paper transition-colors hover:border-gold hover:text-gold"
        >
          Daily
        </Link>
        <Link
          href="/about"
          className="rounded-full border border-line px-3 py-1.5 text-dim transition-colors hover:border-gold hover:text-gold"
        >
          How it works
        </Link>
      </nav>
    </header>
  );
}
