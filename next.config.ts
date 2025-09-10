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
      {
        protocol: "https",
        hostname: "pompmxmkeogtjzivnumt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // experimental: {
  //   serverComponentsExternalPackages: ["pino", "pino-pretty"], // If using App Router & server components
  // },
};

export default nextConfig;
