import { ImageResponse } from "next/og";
import { decodeBuild } from "@/lib/encode";
import { simulate } from "@/lib/sim";
import { OgHero, OgLandscape } from "@/components/og/cards";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("b");
  const [anton, inter, interBold, interExt, interBoldExt] = await Promise.all([
    antonData,
    interData,
    interBoldData,
    interExtData,
    interBoldExtData,
  ]);

  const build = code ? decodeBuild(code) : null;
  const result = build ? simulate(build) : null;

  return new ImageResponse(result ? <OgLandscape result={result} /> : <OgHero />, {
    width: 1200,
    height: 630,
    fonts: [
      // Inter first (incl. latin-ext) so missing-glyph fallback finds ć/č in
      // Inter before Anton's capital-looking lowercase.
      { name: "Inter", data: inter, weight: 400, style: "normal" },
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
      { name: "Inter", data: interExt, weight: 400, style: "normal" },
      { name: "Inter", data: interBoldExt, weight: 700, style: "normal" },
      { name: "Anton", data: anton, weight: 400, style: "normal" },
    ],
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
