import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "99ovr.app" }],
        destination: "https://www.99ovr.app/:path*",
        permanent: true,
      },
      { source: "/classic", destination: "/play", permanent: true },
    ];
  },
};
export default nextConfig;
