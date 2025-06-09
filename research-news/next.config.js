// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/all',
        permanent: true, // set to false if this is a temporary redirect
      },
    ]
  },
}

module.exports = nextConfig
