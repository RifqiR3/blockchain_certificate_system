import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "marketplace.canva.com",
      },
      {
        hostname: "cdn.create.microsoft.com",
      },
      {
        hostname: "ipfs.io",
      },
    ],
  },
};

export default nextConfig;
