import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
