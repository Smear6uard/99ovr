export function Wordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-display uppercase leading-none tracking-wide ${className}`}>
      <span className="text-gold">99</span>
      <span className="text-paper">OVR</span>
    </span>
  );
}
