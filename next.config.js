/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: { 
    forceSwcTransforms: false 
  },
  webpack: (config) => {
    config.cache = false
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.git', '**/data']
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
