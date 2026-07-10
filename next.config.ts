import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "21.0.19.43",
    "127.0.0.1",
    "space-z.ai",
  ],
};

export default nextConfig;