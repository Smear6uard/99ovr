import type { ComponentProps } from "react";

/** Document navigation prevents an Auto Ads runtime from carrying into ad-free game/error pages. */
export default function SiteLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
