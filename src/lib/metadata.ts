import type { Metadata } from "next";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = "/api/og",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · 99OVR`,
      description,
      url: path,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · 99OVR`,
      description,
      images: [image],
    },
  };
}
