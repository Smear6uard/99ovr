import type { ReactNode } from "react";

/** Interactive game screens keep the cabinet's phone-width column on every screen size. */
export function GameColumn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-md ${className}`}>{children}</div>;
}
