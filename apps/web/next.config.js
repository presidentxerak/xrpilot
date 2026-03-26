/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pilot/ui', '@pilot/shared', '@pilot/design-tokens'],
  images: { domains: ['ipfs.io', 'gateway.pinata.cloud'] },
};
module.exports = nextConfig;
