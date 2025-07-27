import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["img.clerk.com"],
  },
  // experimental: {
  //   serverComponentsExternalPackages: ["pino", "pino-pretty"], // If using App Router & server components
  // },
};

export default nextConfig;
