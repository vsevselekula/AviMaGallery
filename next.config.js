/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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
  trailingSlash: true,
};

module.exports = nextConfig;
