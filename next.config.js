/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep sql.js as external — do NOT let webpack bundle it
  serverExternalPackages: ['sql.js'],
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
