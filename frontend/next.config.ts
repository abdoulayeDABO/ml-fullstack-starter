import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.1.27"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
