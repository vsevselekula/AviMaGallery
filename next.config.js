/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/random/**',
      },
    ],
    domains: ['wutftnrkjkbgqhxqgpqs.supabase.co'],
  },
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 