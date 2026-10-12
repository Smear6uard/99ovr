import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { PUBLIC_PATHS } from "@/content/library";
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
