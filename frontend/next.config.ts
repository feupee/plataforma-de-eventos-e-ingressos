import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",

        hostname: "s1.ticketm.net",
      },
    ],
  },
};

export default nextConfig;
