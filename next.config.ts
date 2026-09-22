import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  async headers() {
    const production =
      process.env.VERCEL_ENV === "production" ||
      (!process.env.VERCEL_ENV && process.env.DEPLOYMENT_ENV === "production");
    return production
      ? []
      : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "assets.ctfassets.net" },
    ],
  },
};

export default createNextIntlPlugin()(nextConfig);
