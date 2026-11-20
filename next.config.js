const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ['better-sqlite3'],
  reactStrictMode: true,

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

  outputFileTracingIncludes: {
    '/*': ['./data/**/*'],
  },
}

module.exports = nextConfig
