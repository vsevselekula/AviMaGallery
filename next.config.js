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
    // Включаем обратно проверки качества кода
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Включаем обратно проверку типов во время билда для production
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
