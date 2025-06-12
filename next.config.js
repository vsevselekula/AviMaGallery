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
  output: 'export',
  experimental: {
    serverActions: false,
  },
  trailingSlash: true,
  async generateStaticParams() {
    return {
      '/': {},
      '/_not-found': {},
    }
  },
};

module.exports = nextConfig; 