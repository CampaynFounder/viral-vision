/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA configuration
  images: {
    domains: [],
    unoptimized: false, // Cloudflare Pages handles image optimization
  },
  // Cloudflare Pages compatibility
  // Note: Cloudflare Pages works with Next.js default output
  // No special output configuration needed
  // Ensure proper headers for PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

