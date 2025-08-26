/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://server-oh30bf2y5-yaroslavs-projects-63120884.vercel.app',
  },
}

module.exports = nextConfig

