/** The 10-round strip — the UI twin of the emoji block. Shared by both games. */
export function RungSquares({ result, size = 16 }: { result: { fellAt: number | null }; size?: number }) {
  const { fellAt } = result;
  const squares = Array.from({ length: 10 }, (_, i) => {
    const rung = i + 1;
    if (fellAt === null || rung < fellAt) return "win";
    if (rung === fellAt) return "loss";
    return "off";
  });
  return (
    <div className="flex gap-1" aria-label="gauntlet progress">
      {squares.map((s, i) => (
        <span
          key={i}
          style={{ width: size, height: size }}
          className={
            s === "win"
              ? "rounded-[3px] bg-win"
              : s === "loss"
                ? "rounded-[3px] bg-loss"
                : "rounded-[3px] border border-line bg-transparent"
          }
        />
      ))}
    </div>
  );
}
