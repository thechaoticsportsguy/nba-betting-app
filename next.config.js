/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a.espncdn.com' },
      { protocol: 'https', hostname: 'site.web.api.espn.com' },
      { protocol: 'https', hostname: 'cdn.nba.com' }
    ]
  }
};

module.exports = nextConfig;
