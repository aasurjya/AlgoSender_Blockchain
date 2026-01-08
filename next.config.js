/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  experimental: {
    serverMinification: false,
  },
};

module.exports = nextConfig;
