import Link from "next/link";
import { DONATE_URL } from "@/config/ads";
import { SfxToggle } from "@/components/SfxToggle";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line py-6 text-[11px] leading-relaxed text-dim">
      <p>
        99OVR is a fan-made game. Not affiliated with or endorsed by the NBA, any team, or any
        player. Player names are used in a statistical/fantasy context only. No logos or likenesses
        are used.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <Link href="/about" className="underline underline-offset-2 hover:text-paper">
          About & FAQ
        </Link>
        <Link href="/daily" className="underline underline-offset-2 hover:text-paper">
          Daily challenge
        </Link>
        <SfxToggle />
        {DONATE_URL ? (
          <a href={DONATE_URL} className="underline underline-offset-2 hover:text-paper">
            keep the servers alive ☕
          </a>
        ) : (
          <span>keep the servers alive ☕ (soon)</span>
        )}
      </p>
    </footer>
  );
}
