/**
 * Court geometry as ambient background line-work: a three-point arc sweeping
 * the top, the key + free-throw circle grounded at the bottom. Fixed, faint,
 * behind everything.
 */
export function CourtLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.32]"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke="#26314b" strokeWidth="1.5">
        {/* three-point arc, entering from the top */}
        <path d="M -60 -40 A 300 300 0 0 0 460 -40" />
        <path d="M -20 -40 A 240 240 0 0 0 420 -40" strokeDasharray="3 7" />
        {/* center circle, clipped at right edge */}
        <circle cx="420" cy="330" r="70" />
        <circle cx="420" cy="330" r="10" />
        {/* the key */}
        <rect x="120" y="640" width="160" height="200" />
        <circle cx="200" cy="640" r="60" />
        <path d="M 140 660 h -20 M 140 700 h -20 M 140 740 h -20 M 280 660 h -20 M 280 700 h -20 M 280 740 h -20" />
        {/* baseline hash */}
        <path d="M 40 810 v -20 M 360 810 v -20" />
      </g>
    </svg>
  );
}
