"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The OVR count-up. Eases 0 → value over ~1.1s, reporting every frame so the
 * card can flood its border with each tier band crossed. Skips straight to the
 * final number under prefers-reduced-motion.
 */
export function Odometer({
  value,
  animate,
  reduced,
  onTick,
  onDone,
  className = "",
  style,
}: {
  value: number;
  animate: boolean;
  reduced: boolean;
  onTick?: (n: number) => void;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [n, setN] = useState(animate && !reduced ? 0 : value);
  const done = useRef(false);

  useEffect(() => {
    if (!animate || reduced) {
      setN(value);
      onTick?.(value);
      if (!done.current) {
        done.current = true;
        onDone?.();
      }
      return;
    }
    let raf = 0;
    const duration = 1100;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(eased * value);
      setN(cur);
      onTick?.(cur);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!done.current) {
        done.current = true;
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, animate, reduced]);

  return (
    <span className={`font-display tabular-nums ${className}`} style={style} aria-label={`${value} overall`}>
      {n}
    </span>
  );
}
