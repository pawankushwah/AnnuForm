/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
      {
        source: "/docs/:path*",
        destination: "http://localhost:8000/docs/:path*",
      },
    ];
  },
};

export default nextConfig;
