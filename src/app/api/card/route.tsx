import { ImageResponse } from "next/og";
import { decodeBuild } from "@/lib/encode";
import { simulate } from "@/lib/sim";
import { OgPortrait } from "@/components/og/cards";

export const runtime = "edge";

const antonData = fetch(new URL("../../../assets/fonts/Anton-Regular.ttf", import.meta.url)).then(
  (r) => r.arrayBuffer()
);
const interData = fetch(new URL("../../../assets/fonts/Inter-Regular.woff", import.meta.url)).then(
  (r) => r.arrayBuffer()
);
const interBoldData = fetch(new URL("../../../assets/fonts/Inter-Bold.woff", import.meta.url)).then(
  (r) => r.arrayBuffer()
);
const interExtData = fetch(new URL("../../../assets/fonts/Inter-Regular-Ext.woff", import.meta.url)).then(
  (r) => r.arrayBuffer()
);
const interBoldExtData = fetch(new URL("../../../assets/fonts/Inter-Bold-Ext.woff", import.meta.url)).then(
  (r) => r.arrayBuffer()
);

/** The 1080×1350 "Save card" download — IG/TikTok-slide sized. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("b");
  const build = code ? decodeBuild(code) : null;
  const result = build ? simulate(build) : null;
  if (!result) {
    return new Response("Unknown build", { status: 404 });
  }
  const [anton, inter, interBold, interExt, interBoldExt] = await Promise.all([
    antonData,
    interData,
    interBoldData,
    interExtData,
    interBoldExtData,
  ]);

  return new ImageResponse(<OgPortrait result={result} />, {
    width: 1080,
    height: 1350,
    fonts: [
      { name: "Inter", data: inter, weight: 400, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
      { name: "Inter", data: interExt, weight: 400, style: "normal" },
      { name: "Inter", data: interBoldExt, weight: 700, style: "normal" },
      { name: "Anton", data: anton, weight: 400, style: "normal" },
    ],
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-disposition": 'attachment; filename="99ovr-card.png"',
    },
  });
}
