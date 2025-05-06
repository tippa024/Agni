/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC compiler by default in Next.js 15
  experimental: {
    forceSwcTransforms: true,
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Image optimization
  images: {
    domains: ["avatars.githubusercontent.com"],
    formats: ["image/avif", "image/webp"],
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Configure headers for security
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
      ],
    },
  ],
  // Add the webpack configuration here
  webpack: (config, { isServer }) => {
    // For server-side builds, don't bundle 'swisseph'.
    // It contains a native '.node' addon that needs to be required at runtime.
    if (isServer) {
      config.externals = [...config.externals, "swisseph"];
    }

    // Return the modified config
    return config;
  },
};

module.exports = nextConfig;
