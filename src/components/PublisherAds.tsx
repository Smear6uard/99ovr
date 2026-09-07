import Script from "next/script";
import { ADS_ENABLED, ADSENSE_CLIENT } from "@/config/ads";

/** Only mount on permanent pages with substantive publisher content, never game/error layouts. */
export function PublisherAds() {
  if (!ADS_ENABLED || !ADSENSE_CLIENT) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
