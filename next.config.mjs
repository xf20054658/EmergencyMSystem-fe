/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API proxy for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://health.2060data.com/api/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'https://health.2060data.com/ws/:path*',
      },
    ];
  },
};

export default nextConfig;
