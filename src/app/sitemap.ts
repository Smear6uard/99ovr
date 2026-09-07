import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/daily", "/play", "/budget", "/h2h", "/how-to-play", "/scoring", "/modes", "/about", "/privacy", "/terms", "/contact"].map(path => ({ url: `${SITE_URL}${path}` }));
}
