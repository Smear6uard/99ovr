import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Same scoreboard-pixel 99 as icon.svg, drawn font-free from rects. */
const CELLS: Array<[number, number]> = [
  [0, 0], [1, 0], [2, 0],
  [0, 1], [2, 1],
  [0, 2], [1, 2], [2, 2],
  [2, 3],
  [0, 4], [1, 4], [2, 4],
];

export default function AppleIcon() {
  const cell = 18;
  const digitW = 3 * cell;
  const x0 = (180 - (digitW * 2 + cell)) / 2;
  const y0 = (180 - 5 * cell) / 2;
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          background: "#0b1220",
          borderRadius: 40,
          position: "relative",
        }}
      >
        {[0, 1].map((digit) =>
          CELLS.map(([c, r]) => (
            <div
              key={`${digit}-${c}-${r}`}
              style={{
                position: "absolute",
                left: x0 + digit * (digitW + cell) + c * cell,
                top: y0 + r * cell,
                width: cell,
                height: cell,
                background: "#f2b94b",
                display: "flex",
              }}
            />
          ))
        )}
      </div>
    ),
    size
  );
}
