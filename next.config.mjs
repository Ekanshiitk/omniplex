/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    esmExternals: false, // ✅ Fix Type Stripping issues
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // ✅ Prevents issues with server-only modules
        path: false,
      };
    }
    
    config.cache = false; // ✅ Disables Webpack caching to fix the cache issue
    return config;
  },
};

export default nextConfig;