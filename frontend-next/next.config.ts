import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  distDir: isCapacitorBuild ? 'out' : 'dist',
  output: isCapacitorBuild ? 'export' : undefined,
  compress: true, // 🟢 Enable Gzip compression
  poweredByHeader: false, // 🟢 Security & Performance (save bytes)
  reactStrictMode: false, // 🟢 Disable strict mode for production performance (optional)
  images: {
    unoptimized: isCapacitorBuild, // Required for static export
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for maximum bandwidth saving
    deviceSizes: [320, 420, 768, 1024, 1200], // Minimal breakpoint sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Strict small sizes
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
  ...(isCapacitorBuild ? {} : {
    async rewrites() {
      // Use NEXT_PUBLIC_API_URL if set (for Vercel deployment),
      // otherwise fall back to localhost:5000 (for local dev)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: "/uploads/:path*",
          destination: `${backendUrl}/uploads/:path*`,
        },
      ];
    }
  }),
};

export default nextConfig;
