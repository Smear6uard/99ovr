import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "99OVR",
    short_name: "99OVR",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
