const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  compress: true,
  poweredByHeader: false,

  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config
  },

  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },

  outputFileTracingIncludes: {
    '/*': ['./data/**/*'],
  },
}

module.exports = nextConfig