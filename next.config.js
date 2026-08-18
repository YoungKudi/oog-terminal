/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,  // ✅ Enable SWC
  experimental: {
    forceSwcTransforms: true,  // ✅ Force SWC over Babel
    serverActions: true,
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
    domains: ['gsskpaxijbnlpuqcadxr.supabase.co'],
  },
  env: {
    NEXTAUTH_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api` 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
}

module.exports = nextConfig
