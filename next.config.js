/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip Node.js version check during development
  skipTrailingSlashRedirect: true,
  experimental: {
    serverMinification: false,
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
  },
};

module.exports = nextConfig;
