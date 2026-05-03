/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/facade/:path*",
        destination: `${process.env.KONFIG_FACADE_URL ?? "http://localhost:4000"}/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
