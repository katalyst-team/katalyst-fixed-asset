import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For App Router only (if you use it in the future)
  experimental: {
    serverActions: {
      bodySizeLimit: "1000mb",
    },
  },

  i18n: {
    defaultLocale: "id",
    localeDetection: false,
    locales: ["en", "id"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nos.jkt-1.neo.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
    unoptimized: false,
  },

  reactStrictMode: true,

  trailingSlash: true,
};

export default nextConfig;
