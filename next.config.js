/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/konfig/:path*",
        destination: `${process.env.KONFIG_API_URL ?? "http://localhost:8089"}/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
