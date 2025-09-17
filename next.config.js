/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: appDir is now stable in Next.js 15, no longer experimental
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
  // Output configuration for deployment
  output: 'standalone',
  // Enable source maps in production for debugging
  productionBrowserSourceMaps: false,
  // Set output file tracing root to avoid workspace warnings
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
