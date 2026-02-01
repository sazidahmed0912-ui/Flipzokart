
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: 'dist',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.ailandingpage.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "rukminim1.flixcart.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }, // Common
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "your-api-domain.com" },
      { protocol: "https", hostname: "cdn.yoursite.com" },
      { protocol: "https", hostname: "flipzokart-backend.onrender.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*", // Proxy API requests
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8000/uploads/:path*", // Proxy static uploads if any
      },
    ];
  },
};

export default nextConfig;
