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
  eslint: {
    // Отключаем ESLint во время билда для production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем проверку типов во время билда для production
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
