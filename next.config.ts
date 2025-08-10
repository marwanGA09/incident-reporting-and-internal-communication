import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // experimental: {
  //   serverComponentsExternalPackages: ["pino", "pino-pretty"], // If using App Router & server components
  // },
};

export default nextConfig;
